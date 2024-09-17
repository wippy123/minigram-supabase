ALTER TABLE account_settings
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN subscription_status TEXT,
ADD COLUMN subscription_plan TEXT;