import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';
import bodyParser from 'body-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20' as any,
});

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const app = express();
const PORT = 3000;

app.set('trust proxy', true);
app.use(cors());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV });
});

// Stripe Webhook (must be before body-parser)
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return res.status(500).send('Webhook secret not configured');
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object as any;
      const customerId = subscription.customer as string;
      const status = subscription.status;
      const renewalDate = new Date(subscription.current_period_end * 1000).toISOString();

      // Find user by stripe_customer_id
      const { data: profile, error: findError } = await supabaseAdmin
        .from('user_profiles')
        .select('uid')
        .eq('stripe_customer_id', customerId)
        .single();

      if (profile) {
        await supabaseAdmin
          .from('user_profiles')
          .update({
            subscription_status: status === 'active' ? 'active' : 'inactive',
            renewal_date: renewalDate,
          })
          .eq('uid', profile.uid);
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

app.use(bodyParser.json());

// API Routes
app.post('/api/create-checkout-session', async (req, res) => {
  const { priceId, userId, email } = req.body;

  try {
    // Create or get Stripe customer
    let { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('uid', userId)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: email,
        metadata: { userId },
      });
      customerId = customer.id;
      await supabaseAdmin
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('uid', userId);
    }

    const referer = req.get('referer');
    let origin = req.headers.origin as string;
    
    if (!origin && referer) {
      try {
        origin = new URL(referer).origin;
      } catch (e) {
        // Ignore URL parsing errors
      }
    }
    
    if (!origin) {
      origin = `${req.protocol}://${req.get('host')}`;
    }

    let appUrl = process.env.APP_URL || origin;
    
    // Ensure appUrl is an absolute URL with a scheme
    if (appUrl && !appUrl.startsWith('http')) {
      // If it's a relative path, prepend the origin
      if (appUrl.startsWith('/')) {
        appUrl = `${origin}${appUrl}`;
      } else {
        // Otherwise assume https
        appUrl = `https://${appUrl}`;
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${appUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/signup`,
      metadata: { userId },
    });

    res.json({ url: session.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/verify-session', async (req, res) => {
  const { sessionId } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === 'paid' && session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      const customerId = session.customer as string;
      const status = subscription.status;
      const renewalDate = new Date((subscription as any).current_period_end * 1000).toISOString();
      const userId = session.metadata?.userId;

      if (userId) {
        await supabaseAdmin
          .from('user_profiles')
          .update({
            subscription_status: status === 'active' ? 'active' : 'inactive',
            renewal_date: renewalDate,
          })
          .eq('uid', userId);
        
        return res.json({ status: 'updated', subscriptionStatus: status === 'active' ? 'active' : 'inactive' });
      }
    }
    res.json({ status: 'no_change' });
  } catch (error: any) {
    console.error('Verify session error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Vite / Static files
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(process.cwd(), 'dist');
  console.log('Production mode: Serving static files from', distPath);
  
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error serving index.html:', err);
        res.status(500).send('Server Error: Frontend build (dist/index.html) not found.');
      }
    });
  });
} else {
  // Dynamic import for Vite to avoid loading it in production
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

// Only listen if not running in a serverless environment (like Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
