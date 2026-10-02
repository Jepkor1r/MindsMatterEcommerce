/*
 * ============================================
 * MAILGUN SENDER (server-only)
 * ============================================
 * Mailgun is the "post office". We hand it a
 * letter (subject + HTML) and a stamp (the API
 * key) and it delivers the email.
 *
 * The API key is read from Supabase Edge Function
 * secrets. It never reaches the browser and must
 * never be logged.
 * ============================================
 */

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export type SendResult = { ok: true; messageId: string } | { ok: false; error: string };

export async function sendMailgunEmail(email: OutgoingEmail): Promise<SendResult> {
  const apiKey = Deno.env.get('MAILGUN_API_KEY');
  const domain = Deno.env.get('MAILGUN_DOMAIN');
  const from = Deno.env.get('MAILGUN_FROM_EMAIL');
  // US accounts use api.mailgun.net; EU accounts use api.eu.mailgun.net
  const apiBase = Deno.env.get('MAILGUN_API_BASE') ?? 'https://api.mailgun.net';

  if (!apiKey || !domain || !from) {
    return { ok: false, error: 'Mailgun is not configured (missing MAILGUN_API_KEY, MAILGUN_DOMAIN or MAILGUN_FROM_EMAIL)' };
  }

  const form = new FormData();
  form.append('from', from);
  form.append('to', email.to);
  form.append('subject', email.subject);
  form.append('html', email.html);
  form.append('text', email.text);
  if (email.replyTo) form.append('h:Reply-To', email.replyTo);

  try {
    const response = await fetch(`${apiBase}/v3/${domain}/messages`, {
      method: 'POST',
      headers: { Authorization: `Basic ${btoa(`api:${apiKey}`)}` },
      body: form,
    });

    if (!response.ok) {
      // Mailgun's error body explains the problem (e.g. "Forbidden", unverified
      // sandbox recipient) and does not contain our key. Trim it for storage.
      const body = (await response.text()).slice(0, 300);
      return { ok: false, error: `Mailgun ${response.status}: ${body}` };
    }

    const data = await response.json();
    return { ok: true, messageId: data.id ?? '' };
  } catch (err) {
    return { ok: false, error: `Could not reach Mailgun: ${err instanceof Error ? err.message : String(err)}` };
  }
}
