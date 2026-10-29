CREATE TABLE public.saved_charts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  birth_date date NOT NULL,
  birth_time time NOT NULL,
  place_name text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  timezone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_charts TO authenticated;
GRANT ALL ON public.saved_charts TO service_role;
ALTER TABLE public.saved_charts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own charts select" ON public.saved_charts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own charts insert" ON public.saved_charts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own charts update" ON public.saved_charts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own charts delete" ON public.saved_charts FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.report_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  report_type text NOT NULL,
  tier text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'queued',
  birth_date date NOT NULL,
  birth_time time NOT NULL,
  place_name text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  timezone text NOT NULL,
  deliver_after timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.report_requests TO service_role;
ALTER TABLE public.report_requests ENABLE ROW LEVEL SECURITY;