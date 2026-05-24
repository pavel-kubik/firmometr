ALTER TABLE watchlist
  ADD COLUMN IF NOT EXISTS pending_notification BOOLEAN NOT NULL DEFAULT false;
