import fetch from 'node-fetch';
import twilio from 'twilio';

const twi = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export async function sendWhatsAppTwilio({ to, text }: { to: string; text: string }) {
  if (!twi) throw new Error('Twilio not configured');
  const from = process.env.TWILIO_WA_FROM;
  const toNum = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  const msg = await twi.messages.create({ from, to: toNum, body: text });
  return { id: msg.sid };
}

export async function sendLINE({ toUserId, text }: { toUserId: string; text: string }) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) throw new Error('LINE not configured');
  const res = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      to: toUserId,
      messages: [{ type: 'text', text }]
    })
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LINE push failed: ${res.status} ${body}`);
  }
  return { ok: true };
}

export async function sendMessage({ channel, contact, text }: { channel: string; contact: string; text: string }) {
  if (channel === 'whatsapp') {
    return await sendWhatsAppTwilio({ to: contact, text });
  }
  if (channel === 'line') {
    return await sendLINE({ toUserId: contact, text });
  }
  throw new Error(`Unsupported channel: ${channel}`);
}