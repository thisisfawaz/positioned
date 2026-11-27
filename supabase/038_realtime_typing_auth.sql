-- Realtime Authorization for the ephemeral "is typing..." channel.
--
-- The typing channel is named `typing:<ContactRequest.id>` and is created with
-- { private: true }. A private channel is only joinable/usable if RLS policies
-- on realtime.messages allow it for the current auth.uid().
--
-- TWO policies are required:
--   SELECT  -> lets a participant SUBSCRIBE (receive broadcasts)
--   INSERT  -> lets a participant SEND broadcasts
-- SELECT alone is not enough: a private channel silently drops sends that have
-- no matching write policy, which is why the typing indicator never appeared
-- even though both sides showed SUBSCRIBED.
--
-- Both say the same thing: you may use `typing:<id>` only if you are the
-- sender or receiver of that ContactRequest. `realtime.topic()` returns the
-- full topic string ("typing:<id>"); User.id in Prisma IS the Supabase auth
-- uid (ensure-user.ts sets id: supabaseUser.id), so auth.uid()::text compares
-- directly to the FK columns.
--
-- Scoped to the typing topic only; does NOT touch the postgres_changes
-- subscriptions (those are protected by table RLS). Additive; re-runnable.

DROP POLICY IF EXISTS "typing topic: participants only" ON realtime.messages;
CREATE POLICY "typing topic: participants only"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (
    realtime.topic() LIKE 'typing:%'
    AND EXISTS (
      SELECT 1 FROM "ContactRequest" cr
      WHERE cr.id = split_part(realtime.topic(), ':', 2)
        AND (cr."fromUserId" = auth.uid()::text OR cr."toUserId" = auth.uid()::text)
    )
  );

DROP POLICY IF EXISTS "typing topic: participants can send" ON realtime.messages;
CREATE POLICY "typing topic: participants can send"
  ON realtime.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    realtime.topic() LIKE 'typing:%'
    AND EXISTS (
      SELECT 1 FROM "ContactRequest" cr
      WHERE cr.id = split_part(realtime.topic(), ':', 2)
        AND (cr."fromUserId" = auth.uid()::text OR cr."toUserId" = auth.uid()::text)
    )
  );
