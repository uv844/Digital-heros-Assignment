-- User Profiles
CREATE TABLE user_profiles (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Golf Scores
CREATE TABLE golf_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  uid UUID REFERENCES auth.users NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Charities
CREATE TABLE charities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  upcoming_events JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Draws
CREATE TABLE draws (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  winning_numbers INTEGER[] NOT NULL,
  status TEXT DEFAULT 'simulated' CHECK (status IN ('simulated', 'published')),
  jackpot_amount DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Winners
CREATE TABLE winners (
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

-- User Profiles Policies
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.uid() = uid);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = uid);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = uid);

-- Golf Scores Policies
CREATE POLICY "Users can view their own scores" ON golf_scores FOR SELECT USING (auth.uid() = uid);
CREATE POLICY "Users can insert their own scores" ON golf_scores FOR INSERT WITH CHECK (auth.uid() = uid);

-- Charities Policies
CREATE POLICY "Everyone can view charities" ON charities FOR SELECT USING (true);

-- Draws Policies
CREATE POLICY "Everyone can view published draws" ON draws FOR SELECT USING (status = 'published');

-- Winners Policies
CREATE POLICY "Users can view their own winnings" ON winners FOR SELECT USING (auth.uid() = uid);
