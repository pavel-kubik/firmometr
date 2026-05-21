CREATE OR REPLACE VIEW public.watchlist_with_email AS
SELECT
  w.id,
  w.ico,
  w.display_name,
  w.user_id,
  w.added_at,
  w.last_checked_at,
  w.isir_clarity,
  w.dph_nespolehlivy,
  w.ares_stav_kod,
  p.email AS user_email
FROM public.watchlist w
JOIN public.profiles p ON p.id = w.user_id;

GRANT SELECT ON public.watchlist_with_email TO service_role;
