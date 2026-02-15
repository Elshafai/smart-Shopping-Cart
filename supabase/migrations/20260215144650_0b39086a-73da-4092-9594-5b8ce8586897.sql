ALTER TABLE public.cartproduct REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.cartproduct;