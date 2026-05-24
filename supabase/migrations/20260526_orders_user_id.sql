ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS status  text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'cancelled'));

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders(user_id);
