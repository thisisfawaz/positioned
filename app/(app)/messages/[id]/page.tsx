import { redirect } from 'next/navigation'

/**
 * The conversation is a POPUP now (see MessagesClient), not a route. Keep this
 * path alive as a redirect so an old link or a refresh of /messages/<id> lands
 * back on the inbox instead of a 404. If deep-linking a specific thread is ever
 * wanted again, pass an `?open=<id>` query to /messages instead of reviving a
 * permanent pane.
 */
export default function ConversationRedirect() {
  redirect('/messages')
}
