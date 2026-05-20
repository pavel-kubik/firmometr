ALTER TABLE public.watchlist
  DROP COLUMN IF EXISTS notify_email,
  DROP COLUMN IF EXISTS pending_notification;
