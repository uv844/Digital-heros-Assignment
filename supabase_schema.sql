-- User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  uid UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'lapsed')),
  renewal_date TIMESTAMP WITH TIME ZONE,
  selected_charity_id UUID,
  charity_contribution_percentage INTEGER DEFAULT 10,
  total_winnings DECIMAL(12, 2) DEFAULT 0,
  stripe_customer_id TEXT,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Golf Scores
CREATE TABLE IF NOT EXISTS golf_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  uid UUID REFERENCES auth.users NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Charities
CREATE TABLE IF NOT EXISTS charities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  upcoming_events JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Draws
CREATE TABLE IF NOT EXISTS draws (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  winning_numbers INTEGER[] NOT NULL,
  status TEXT DEFAULT 'simulated' CHECK (status IN ('simulated', 'published')),
  jackpot_amount DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Winners
CREATE TABLE IF NOT EXISTS winners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  draw_id UUID REFERENCES draws NOT NULL,
  uid UUID REFERENCES auth.users NOT NULL,
  match_type INTEGER NOT NULL CHECK (match_type IN (3, 4, 5)),
  prize_amount DECIMAL(12, 2) NOT NULL,
  proof_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE golf_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin status without recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE uid = auth.uid() AND role = 'admin' AND is_blocked = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- User Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles 
  FOR SELECT USING (auth.uid() = uid AND is_blocked = false);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles 
  FOR UPDATE USING (auth.uid() = uid AND is_blocked = false);

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile" ON user_profiles 
  FOR INSERT WITH CHECK (auth.uid() = uid);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
CREATE POLICY "Admins can manage all profiles" ON user_profiles 
  FOR ALL USING (public.is_admin());

-- Golf Scores Policies
DROP POLICY IF EXISTS "Users can view their own scores" ON golf_scores;
CREATE POLICY "Users can view their own scores" ON golf_scores 
  FOR SELECT USING (auth.uid() = uid AND EXISTS (SELECT 1 FROM user_profiles WHERE uid = auth.uid() AND is_blocked = false));

DROP POLICY IF EXISTS "Users can insert their own scores" ON golf_scores;
CREATE POLICY "Users can insert their own scores" ON golf_scores 
  FOR INSERT WITH CHECK (auth.uid() = uid AND EXISTS (SELECT 1 FROM user_profiles WHERE uid = auth.uid() AND is_blocked = false));

DROP POLICY IF EXISTS "Users can delete their own scores" ON golf_scores;
CREATE POLICY "Users can delete their own scores" ON golf_scores 
  FOR DELETE USING (auth.uid() = uid AND EXISTS (SELECT 1 FROM user_profiles WHERE uid = auth.uid() AND is_blocked = false));

DROP POLICY IF EXISTS "Admins can manage all scores" ON golf_scores;
CREATE POLICY "Admins can manage all scores" ON golf_scores 
  FOR ALL USING (public.is_admin());

-- Charities Policies
DROP POLICY IF EXISTS "Everyone can view charities" ON charities;
CREATE POLICY "Everyone can view charities" ON charities 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage charities" ON charities;
CREATE POLICY "Admins can manage charities" ON charities 
  FOR ALL USING (public.is_admin());

-- Draws Policies
DROP POLICY IF EXISTS "Everyone can view published draws" ON draws;
CREATE POLICY "Everyone can view published draws" ON draws 
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Admins can manage all draws" ON draws;
CREATE POLICY "Admins can manage all draws" ON draws 
  FOR ALL USING (public.is_admin());

-- Winners Policies
DROP POLICY IF EXISTS "Users can view their own winnings" ON winners;
CREATE POLICY "Users can view their own winnings" ON winners 
  FOR SELECT USING (auth.uid() = uid AND EXISTS (SELECT 1 FROM user_profiles WHERE uid = auth.uid() AND is_blocked = false));

DROP POLICY IF EXISTS "Admins can manage all winners" ON winners;
CREATE POLICY "Admins can manage all winners" ON winners 
  FOR ALL USING (public.is_admin());

-- Trigger to automatically create a profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (
    uid, 
    email, 
    display_name, 
    photo_url,
    role, 
    subscription_status, 
    total_winnings, 
    charity_contribution_percentage
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'display_name', 
      new.raw_user_meta_data->>'full_name', 
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1),
      'Hero'
    ),
    COALESCE(
      new.raw_user_meta_data->>'photo_url',
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    ),
    CASE WHEN new.email IN ('admin@digitalhero.com', 'smssmack14@gmail.com') THEN 'admin' ELSE 'user' END,
    'inactive',
    0,
    10
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
