-- Location: supabase/migrations/20251119144037_betting_platform_complete.sql
-- Schema Analysis: Fresh database - creating complete betting platform schema
-- Integration Type: Complete new module with authentication
-- Dependencies: auth.users (Supabase managed)

-- ============================================================================
-- SECTION 1: TYPES
-- ============================================================================

CREATE TYPE public.user_role AS ENUM ('admin', 'user');
CREATE TYPE public.bet_status AS ENUM ('pending', 'won', 'lost', 'cancelled');
CREATE TYPE public.match_status AS ENUM ('upcoming', 'live', 'finished', 'cancelled');
CREATE TYPE public.bet_category AS ENUM ('match', 'fun');

-- ============================================================================
-- SECTION 2: CORE TABLES
-- ============================================================================

-- User profiles table (intermediary between auth.users and app tables)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role public.user_role DEFAULT 'user'::public.user_role,
    points_balance INTEGER DEFAULT 1000,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Matches table
CREATE TABLE public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    match_date TIMESTAMPTZ NOT NULL,
    status public.match_status DEFAULT 'upcoming'::public.match_status,
    home_score INTEGER,
    away_score INTEGER,
    closing_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Fun bets table
CREATE TABLE public.fun_bets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    closing_time TIMESTAMPTZ NOT NULL,
    result_text TEXT,
    is_settled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Bet options for both matches and fun bets
CREATE TABLE public.bet_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    fun_bet_id UUID REFERENCES public.fun_bets(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    odds DECIMAL(4,2) NOT NULL,
    is_winner BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bet_options_reference_check CHECK (
        (match_id IS NOT NULL AND fun_bet_id IS NULL) OR
        (match_id IS NULL AND fun_bet_id IS NOT NULL)
    )
);

-- User bets table
CREATE TABLE public.bets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    bet_option_id UUID REFERENCES public.bet_options(id) ON DELETE CASCADE,
    stake INTEGER NOT NULL,
    potential_payout DECIMAL(10,2) NOT NULL,
    status public.bet_status DEFAULT 'pending'::public.bet_status,
    actual_payout DECIMAL(10,2),
    placed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    settled_at TIMESTAMPTZ,
    CONSTRAINT positive_stake CHECK (stake > 0)
);

-- Transactions table for points balance tracking
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL,
    description TEXT NOT NULL,
    bet_id UUID REFERENCES public.bets(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SECTION 3: INDEXES
-- ============================================================================

CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_matches_match_date ON public.matches(match_date);
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_fun_bets_closing_time ON public.fun_bets(closing_time);
CREATE INDEX idx_bet_options_match_id ON public.bet_options(match_id);
CREATE INDEX idx_bet_options_fun_bet_id ON public.bet_options(fun_bet_id);
CREATE INDEX idx_bets_user_id ON public.bets(user_id);
CREATE INDEX idx_bets_status ON public.bets(status);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);

-- ============================================================================
-- SECTION 4: FUNCTIONS
-- ============================================================================

-- Function to handle new user registration (trigger function)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'user'::public.user_role),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$;

-- Function to update user_profiles updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- ============================================================================
-- SECTION 5: ENABLE RLS
-- ============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fun_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bet_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 6: RLS POLICIES
-- ============================================================================

-- User profiles policies (Pattern 1: Core user table)
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "public_can_view_user_profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (true);

-- Matches policies (Pattern 4: Public read, private write for admins)
CREATE POLICY "public_can_view_matches"
ON public.matches
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "admins_manage_matches"
ON public.matches
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
  )
);

-- Fun bets policies (same as matches)
CREATE POLICY "public_can_view_fun_bets"
ON public.fun_bets
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "admins_manage_fun_bets"
ON public.fun_bets
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
  )
);

-- Bet options policies
CREATE POLICY "public_can_view_bet_options"
ON public.bet_options
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "admins_manage_bet_options"
ON public.bet_options
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
  )
);

-- Bets policies (Pattern 2: Simple user ownership)
CREATE POLICY "users_manage_own_bets"
ON public.bets
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "admins_view_all_bets"
ON public.bets
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
  )
);

-- Transactions policies (Pattern 2: Simple user ownership)
CREATE POLICY "users_view_own_transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "admins_view_all_transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
  )
);

-- ============================================================================
-- SECTION 7: TRIGGERS
-- ============================================================================

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_matches_updated_at
BEFORE UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_fun_bets_updated_at
BEFORE UPDATE ON public.fun_bets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- SECTION 8: MOCK DATA
-- ============================================================================

DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    user1_uuid UUID := gen_random_uuid();
    user2_uuid UUID := gen_random_uuid();
    match1_id UUID := gen_random_uuid();
    match2_id UUID := gen_random_uuid();
    match3_id UUID := gen_random_uuid();
    fun_bet1_id UUID := gen_random_uuid();
    fun_bet2_id UUID := gen_random_uuid();
    fun_bet3_id UUID := gen_random_uuid();
    option1_id UUID := gen_random_uuid();
    option2_id UUID := gen_random_uuid();
    option3_id UUID := gen_random_uuid();
BEGIN
    -- Create auth users with all required fields
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@avc69.nl', crypt('avc2025admin', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Admin Gebruiker", "role": "admin"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (user1_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'jan.devries@avc69.nl', crypt('avc2025', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Jan de Vries", "role": "user"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (user2_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'jan.bakker@avc69.nl', crypt('avc2025', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Jan Bakker", "role": "user"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Create matches
    INSERT INTO public.matches (id, home_team, away_team, match_date, status, closing_time) VALUES
        (match1_id, 'AVC ''69', 'VV Houten', '2025-11-20 19:00:00+00', 'upcoming', '2025-11-20 18:00:00+00'),
        (match2_id, 'Sliedrecht Sport', 'AVC ''69', '2025-11-22 20:00:00+00', 'upcoming', '2025-11-22 19:00:00+00'),
        (match3_id, 'AVC ''69', 'Dynamo Amsterdam', '2025-11-25 19:30:00+00', 'upcoming', '2025-11-25 18:30:00+00');

    -- Create fun bets
    INSERT INTO public.fun_bets (id, title, description, category, closing_time) VALUES
        (fun_bet1_id, 'Wie komt te laat?', 'Voorspel wie er deze week te laat komt bij de training', 'club', '2025-11-21 18:30:00+00'),
        (fun_bet2_id, 'Aantal aanwezigen training', 'Hoeveel spelers komen er naar de donderdagtraining?', 'training', '2025-11-21 18:30:00+00'),
        (fun_bet3_id, 'Beste speler van de maand', 'Wie wordt gekozen tot beste speler van november?', 'awards', '2025-11-30 23:59:00+00');

    -- Create bet options for matches
    INSERT INTO public.bet_options (id, match_id, option_text, odds) VALUES
        (option1_id, match1_id, 'AVC ''69 wint (1)', 1.85),
        (option2_id, match1_id, 'Gelijkspel (X)', 3.40),
        (option3_id, match1_id, 'VV Houten wint (2)', 4.20);

    INSERT INTO public.bet_options (match_id, option_text, odds) VALUES
        (match2_id, 'Sliedrecht Sport wint (1)', 2.10),
        (match2_id, 'Gelijkspel (X)', 3.20),
        (match2_id, 'AVC ''69 wint (2)', 3.50),
        (match3_id, 'AVC ''69 wint (1)', 1.65),
        (match3_id, 'Gelijkspel (X)', 3.80),
        (match3_id, 'Dynamo Amsterdam wint (2)', 5.50);

    -- Create bet options for fun bets
    INSERT INTO public.bet_options (fun_bet_id, option_text, odds) VALUES
        (fun_bet1_id, 'Piet van der Berg', 3.50),
        (fun_bet1_id, 'Lisa Jansen', 2.80),
        (fun_bet1_id, 'Marco de Wit', 4.20),
        (fun_bet2_id, 'Minder dan 15', 2.20),
        (fun_bet2_id, '15-20 spelers', 1.85),
        (fun_bet2_id, 'Meer dan 20', 3.10),
        (fun_bet3_id, 'Sarah van Dam', 2.50),
        (fun_bet3_id, 'Tom Visser', 3.20),
        (fun_bet3_id, 'Emma de Jong', 2.80);

    -- Create sample bets for users
    INSERT INTO public.bets (user_id, bet_option_id, stake, potential_payout, status) VALUES
        (user1_uuid, option1_id, 100, 185.00, 'pending'),
        (user2_uuid, option2_id, 50, 170.00, 'pending');

    -- Create sample transactions
    INSERT INTO public.transactions (user_id, amount, transaction_type, description) VALUES
        (user1_uuid, -100, 'bet_placed', 'Weddenschap geplaatst: AVC ''69 vs VV Houten'),
        (user2_uuid, -50, 'bet_placed', 'Weddenschap geplaatst: AVC ''69 vs VV Houten');

END $$;