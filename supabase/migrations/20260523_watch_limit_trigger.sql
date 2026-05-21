CREATE OR REPLACE FUNCTION public.check_watch_limit()
RETURNS trigger AS $$
DECLARE
  v_tier      text;
  v_count     int;
  v_limit     int;
BEGIN
  SELECT user_tier INTO v_tier FROM public.profiles WHERE id = NEW.user_id;
  SELECT COUNT(*) INTO v_count FROM public.watchlist WHERE user_id = NEW.user_id;

  v_limit := CASE v_tier
    WHEN 'free'  THEN 3
    WHEN 'basic' THEN 50
    ELSE 2147483647
  END;

  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'watch_limit_exceeded';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_watch_limit
  BEFORE INSERT ON public.watchlist
  FOR EACH ROW EXECUTE FUNCTION public.check_watch_limit();
