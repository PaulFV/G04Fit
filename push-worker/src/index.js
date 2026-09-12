import webpush from 'web-push';
import { DurableObject } from 'cloudflare:workers';

const encoder = new TextEncoder();
const MOTIVATION_MESSAGES = [
  { title: 'Komm, trainieren! 💪', body: 'Dein Plan wartet auf dich. Öffne G04Fit und leg los.' },
  { title: 'Heute ist ein guter Tag zum Trainieren', body: 'Ein kleiner Anfang reicht – der Rest kommt mit der Bewegung.' },
  { title: 'Zeit für dich und dein Training', body: 'Schenk dir diese Einheit. Danach wirst du froh sein, angefangen zu haben.' },
  { title: 'Nur anfangen', body: 'Du musst nicht perfekt trainieren. Du musst nur den ersten Satz machen.' },
  { title: 'Dein stärkeres Ich wartet', body: 'Jede Einheit zählt. Öffne G04Fit und mach heute deinen nächsten Schritt.' },
  { title: 'Los geht’s! 🔥', body: 'Deine heutige Einheit bringt dich deinem Ziel ein Stück näher.' },
  { title: 'Mach heute zu deinem Trainingstag', body: 'Motivation kommt beim Machen. Starte jetzt mit G04Fit.' },
  { title: 'Du kannst das', body: 'Ein Training, ein Schritt, ein Erfolg. Heute zählt.' }
];
const MOTIVATION_MESSAGES_EN = [
  { title: 'Come on, let\'s train! 💪', body: 'Your plan is waiting. Open G04Fit and get started.' },
  { title: 'Today is a great day to train', body: 'A small start is enough — the rest comes with movement.' },
  { title: 'Time for you and your training', body: 'Give yourself this workout. You will be glad you started.' },
  { title: 'Just start', body: 'You do not have to train perfectly. Just do the first set.' },
  { title: 'Your stronger self is waiting', body: 'Every workout counts. Open G04Fit and take your next step today.' },
  { title: 'Let\'s go! 🔥', body: 'Today\'s workout brings you a little closer to your goal.' },
  { title: 'Make today your training day', body: 'Motivation comes from doing. Start with G04Fit now.' },
  { title: 'You can do this', body: 'One workout, one step, one success. Today counts.' }
];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}

function corsHeaders(origin, env) {
  return {
    'Access-Control-Allow-Origin': origin === env.APP_ORIGIN ? origin : env.APP_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function withCors(response, origin, env) {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders(origin, env)).forEach(([key, value]) => headers.set(key, value));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

async function sha256(value) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function secureEqual(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string' || left.length !== right.length) return false;
  let different = 0;
  for (let i = 0; i < left.length; i += 1) different |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return different === 0;
}

function localParts(timestamp, timezone) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  });
  return Object.fromEntries(formatter.formatToParts(new Date(timestamp))
    .filter(part => part.type !== 'literal')
    .map(part => [part.type, Number(part.value)]));
}

function zonedDateToTimestamp(year, month, day, hour, minute, timezone) {
  const target = Date.UTC(year, month - 1, day, hour, minute);
  let guess = target;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const observed = localParts(guess, timezone);
    const observedUtc = Date.UTC(observed.year, observed.month - 1, observed.day, observed.hour, observed.minute);
    const correction = target - observedUtc;
    guess += correction;
    if (correction === 0) break;
  }
  const check = localParts(guess, timezone);
  return check.year === year && check.month === month && check.day === day &&
    check.hour === hour && check.minute === minute ? guess : null;
}

function nextReminderTimestamp(reminder, after = Date.now() + 30000) {
  if (!reminder?.enabled || !/^([01]\d|2[0-3]):[0-5]\d$/.test(reminder.time) ||
      !Array.isArray(reminder.days) || !reminder.days.length) return null;

  const timezone = reminder.timezone || 'Europe/Berlin';
  const current = localParts(after, timezone);
  const [hour, minute] = reminder.time.split(':').map(Number);

  for (let offset = 0; offset <= 7; offset += 1) {
    const calendarDate = new Date(Date.UTC(current.year, current.month - 1, current.day + offset));
    if (!reminder.days.includes(calendarDate.getUTCDay())) continue;
    const candidate = zonedDateToTimestamp(
      calendarDate.getUTCFullYear(), calendarDate.getUTCMonth() + 1,
      calendarDate.getUTCDate(), hour, minute, timezone
    );
    if (candidate && candidate > after) return candidate;
  }
  return null;
}

function validSubscription(subscription) {
  return Boolean(subscription && typeof subscription.endpoint === 'string' &&
    subscription.endpoint.startsWith('https://') && typeof subscription.keys?.p256dh === 'string' &&
    typeof subscription.keys?.auth === 'string');
}

function validReminder(reminder) {
  if (!reminder || typeof reminder.enabled !== 'boolean') return false;
  if (reminder.locale != null && reminder.locale !== 'de' && reminder.locale !== 'en') return false;
  if (!reminder.enabled) return true;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(reminder.time || '')) return false;
  if (!Array.isArray(reminder.days) || !reminder.days.length ||
      reminder.days.some(day => !Number.isInteger(day) || day < 0 || day > 6)) return false;
  try {
    localParts(Date.now(), reminder.timezone || 'Europe/Berlin');
    return true;
  } catch (error) {
    return false;
  }
}

function motivationMessage(reminder, timestamp = Date.now()) {
  const local = localParts(timestamp, reminder?.timezone || 'Europe/Berlin');
  const dayKey = (local.year * 10000) + (local.month * 100) + local.day;
  const messages = reminder?.locale === 'en' ? MOTIVATION_MESSAGES_EN : MOTIVATION_MESSAGES;
  return messages[dayKey % messages.length];
}

async function sendNotification(env, subscription, reminder, test = false) {
  webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
  const english = reminder?.locale === 'en';
  const message = test
    ? (english
      ? { title: 'G04Fit · Test successful', body: 'Background notifications work. G04Fit will motivate you regularly from now on.' }
      : { title: 'G04Fit · Test erfolgreich', body: 'Hintergrund-Benachrichtigungen funktionieren. G04Fit motiviert dich ab jetzt regelmäßig.' })
    : motivationMessage(reminder);
  return webpush.sendNotification(subscription, JSON.stringify({
    title: message.title,
    body: message.body,
    tag: test ? 'g04fit-test' : 'g04fit-training',
    url: env.APP_URL
  }), { TTL: 300, urgency: 'high' });
}

export class ReminderDevice extends DurableObject {
  async authorize(request, allowCreate = false) {
    const header = request.headers.get('Authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (token.length < 32) return false;
    const suppliedHash = await sha256(token);
    const storedHash = await this.ctx.storage.get('tokenHash');
    if (!storedHash && allowCreate) {
      await this.ctx.storage.put('tokenHash', suppliedHash);
      return true;
    }
    return secureEqual(storedHash, suppliedHash);
  }

  async fetch(request) {
    const url = new URL(request.url);
    const isTest = url.pathname.endsWith('/test');

    if (request.method === 'PUT') {
      if (!await this.authorize(request, true)) return json({ error: 'Nicht autorisiert.' }, 401);
      const body = await request.json().catch(() => null);
      if (!validSubscription(body?.subscription) || !validReminder(body?.reminder)) {
        return json({ error: 'Ungültige Push- oder Erinnerungsdaten.' }, 400);
      }
      const nextReminder = nextReminderTimestamp(body.reminder);
      await this.ctx.storage.put({ subscription: body.subscription, reminder: body.reminder, nextReminder });
      if (nextReminder) await this.ctx.storage.setAlarm(nextReminder);
      else await this.ctx.storage.deleteAlarm();
      return json({ ok: true, nextReminder });
    }

    if (request.method === 'DELETE') {
      if (!await this.authorize(request)) return json({ error: 'Nicht autorisiert.' }, 401);
      await this.ctx.storage.deleteAlarm();
      await this.ctx.storage.deleteAll();
      return json({ ok: true });
    }

    if (request.method === 'POST' && isTest) {
      if (!await this.authorize(request)) return json({ error: 'Nicht autorisiert.' }, 401);
      const subscription = await this.ctx.storage.get('subscription');
      if (!subscription) return json({ error: 'Keine Push-Anmeldung vorhanden.' }, 404);
      try {
        const reminder = await this.ctx.storage.get('reminder');
        await sendNotification(this.env, subscription, reminder, true);
        return json({ ok: true });
      } catch (error) {
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          await this.ctx.storage.deleteAlarm();
          await this.ctx.storage.deleteAll();
        }
        return json({ error: 'Test-Benachrichtigung konnte nicht zugestellt werden.' }, 502);
      }
    }

    return json({ error: 'Methode nicht erlaubt.' }, 405);
  }

  async alarm() {
    const data = await this.ctx.storage.get(['subscription', 'reminder']);
    if (!data.subscription || !data.reminder?.enabled) return;
    try {
      await sendNotification(this.env, data.subscription, data.reminder, false);
    } catch (error) {
      if (error?.statusCode === 404 || error?.statusCode === 410) {
        await this.ctx.storage.deleteAll();
        return;
      }
      await this.ctx.storage.setAlarm(Date.now() + 60000);
      throw error;
    }
    const nextReminder = nextReminderTimestamp(data.reminder, Date.now() + 30000);
    await this.ctx.storage.put('nextReminder', nextReminder);
    if (nextReminder) await this.ctx.storage.setAlarm(nextReminder);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    if (origin && origin !== env.APP_ORIGIN) {
      return withCors(json({ error: 'Unerlaubter Ursprung.' }, 403), origin, env);
    }
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
    }
    if (request.method === 'GET' && url.pathname === '/vapid-public-key') {
      return withCors(json({ publicKey: env.VAPID_PUBLIC_KEY || '' }), origin, env);
    }
    const match = url.pathname.match(/^\/api\/devices\/([A-Za-z0-9_-]{16,128})(?:\/test)?$/);
    if (!match) return withCors(json({ error: 'Nicht gefunden.' }, 404), origin, env);

    const id = env.REMINDER_DEVICE.idFromName(match[1]);
    const response = await env.REMINDER_DEVICE.get(id).fetch(request);
    return withCors(response, origin, env);
  }
};
