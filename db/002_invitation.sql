-- Allows two accounts to be reserved without inventing or communicating passwords.
-- Pending members cannot log in until their own one-time email invitation is completed.
ALTER TABLE hub_members ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE hub_members ADD COLUMN IF NOT EXISTS activated_at timestamptz;
CREATE TABLE IF NOT EXISTS hub_activation_tokens (
  token_digest text PRIMARY KEY CHECK (char_length(token_digest)=64),
  member_id uuid NOT NULL REFERENCES hub_members(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_hub_activation_tokens_member ON hub_activation_tokens(member_id);
CREATE INDEX IF NOT EXISTS idx_hub_activation_tokens_expiry ON hub_activation_tokens(expires_at);
-- A pending or activated account is never a public signup; only administrators create members.
