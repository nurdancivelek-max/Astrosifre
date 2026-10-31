CREATE TABLE public.soulmate_profiles (
  user_id uuid PRIMARY KEY,
  nickname text NOT NULL,
  birth_date date NOT NULL,
  birth_time text,
  place_name text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  timezone text NOT NULL,
  sun_sign int NOT NULL,
  moon_sign int NOT NULL,
  rising_sign int,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.soulmate_profiles TO authenticated;
GRANT ALL ON public.soulmate_profiles TO service_role;
ALTER TABLE public.soulmate_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner read" ON public.soulmate_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "owner insert" ON public.soulmate_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner update" ON public.soulmate_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner delete" ON public.soulmate_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);