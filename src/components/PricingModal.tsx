import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, CreditCard, Zap, Shield, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  showSkip?: boolean;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, showSkip = false }) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleSubscribe = async () => {
    if (!profile) {
      toast.error('Please log in to subscribe');
      return;
    }
    setLoading(true);
    try {
      const priceId = billingCycle === 'monthly' 
        ? import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID 
        : import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID;

      if (!priceId) {
        throw new Error(`Stripe ${billingCycle} price ID is not configured.`);
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: profile.uid,
          email: profile.email,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Stripe error:', error);
      toast.error(error.message || 'Failed to start subscription process');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
          >
            {/* Left Side: Info */}
            <div className="md:w-1/3 bg-black text-white p-10 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                  <Star className="text-yellow-400" size={24} />
                </div>
                <h2 className="text-3xl font-bold mb-4 tracking-tight">Become a Hero</h2>
                <p className="text-white/60 text-sm leading-relaxed mb-8">
                  Join our community of golfers making a real difference. Track your performance, enter monthly draws, and support your favorite charities.
                </p>
                <ul className="space-y-4">
                  {[
                    'Monthly Prize Draws',
                    'Performance Tracking',
                    'Charity Contributions',
                    'Exclusive Community',
                    'Early Access to Events'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center text-sm text-white/80">
                      <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <Check size={12} className="text-white" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-12 flex items-center space-x-4 text-white/40 text-xs">
                <Shield size={16} />
                <span>Secure payments via Stripe</span>
              </div>
            </div>

            {/* Right Side: Pricing */}
            <div className="flex-1 p-10 bg-white">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-bold">Choose your plan</h3>
                  <p className="text-gray-500 text-sm">Select the billing cycle that works for you.</p>
                </div>
                {!showSkip && (
                  <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                    <X size={24} />
                  </button>
                )}
              </div>

              <div className="flex p-1 bg-gray-50 rounded-2xl mb-10">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                    billingCycle === 'monthly' ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all relative ${
                    billingCycle === 'yearly' ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Yearly
                  <span className="absolute -top-2 -right-2 px-2 py-1 bg-green-100 text-green-700 text-[8px] font-black uppercase rounded-full tracking-tighter">
                    Save 20%
                  </span>
                </button>
              </div>

              <div className="mb-10 p-8 bg-gray-50 rounded-[2rem] border border-gray-100 text-center">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                  {billingCycle === 'monthly' ? 'Monthly Plan' : 'Yearly Plan'}
                </div>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-black tracking-tighter">
                    ${billingCycle === 'monthly' ? '25' : '240'}
                  </span>
                  <span className="text-gray-400 font-medium ml-2">
                    /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  {billingCycle === 'monthly' 
                    ? 'Billed monthly. Cancel anytime.' 
                    : 'Billed annually. Equivalent to $20/mo.'}
                </p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full py-5 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center group disabled:opacity-50"
                >
                  <CreditCard className="mr-2" size={20} />
                  {loading ? 'Processing...' : 'Subscribe & Pay Now'}
                </button>
                
                {showSkip && (
                  <button 
                    onClick={onClose}
                    className="w-full py-4 text-sm font-bold text-gray-400 hover:text-black transition-all"
                  >
                    I'll do this later
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PricingModal;
