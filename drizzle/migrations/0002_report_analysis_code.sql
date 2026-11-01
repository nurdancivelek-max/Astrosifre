ALTER TABLE public.report_requests ADD COLUMN analyst_code text NOT NULL DEFAULT 'ALTAIR' CHECK (analyst_code IN ('ALTAIR', 'VEGA', 'SIRIUS'));
GRANT ALL ON public.report_requests TO service_role;