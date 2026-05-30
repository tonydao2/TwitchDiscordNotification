import * as crypto from 'crypto';

// Notification request headers
const TWITCH_MESSAGE_ID = 'Twitch-Eventsub-Message-Id'.toLowerCase();
const TWITCH_MESSAGE_TIMESTAMP =
  'Twitch-Eventsub-Message-Timestamp'.toLowerCase();
const TWITCH_MESSAGE_SIGNATURE =
  'Twitch-Eventsub-Message-Signature'.toLowerCase();

// Prepend this string to the HMAC that's created from the message
const HMAC_PREFIX = 'sha256=';

// Build the message used to get the HMAC.
function getHmacMessage(headers: Record<string, string>, body: string) {
  return (
    (headers[TWITCH_MESSAGE_ID] ?? '') +
    (headers[TWITCH_MESSAGE_TIMESTAMP] ?? '') +
    body
  );
}

// Get the HMAC.
function getHmac(secret: string, message: string) {
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

// Verify the message by comparing the HMAC we created to the signature Twitch sent us.
function verifyMessage(hmac: string, verifySignature: string) {
  return crypto.timingSafeEqual(
    Buffer.from(hmac),
    Buffer.from(verifySignature),
  );
}

async function getTwitchAccessToken(
  clientId: string,
  clientSecret: string,
): Promise<string> {
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: 'POST' },
  );

  if (!res.ok)
    throw new Error(`Failed to get Twitch access token: ${res.status}`);

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export interface StreamInfo {
  title: string;
  broadcasterName: string;
  streamUrl: string;
}

export async function getTwitchStreamInfo(
  broadcasterId: string,
  broadcasterName: string,
  clientId: string,
  clientSecret: string,
): Promise<StreamInfo> {
  const token = await getTwitchAccessToken(clientId, clientSecret);

  const res = await fetch(
    `https://api.twitch.tv/helix/streams?user_id=${broadcasterId}`,
    {
      headers: {
        'Client-Id': clientId,
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) throw new Error(`Failed to fetch stream info: ${res.status}`);

  const data = (await res.json()) as { data: { title: string }[] };
  const stream = data.data[0];

  return {
    title: stream?.title ?? 'No title',
    broadcasterName,
    streamUrl: `https://twitch.tv/${broadcasterName}`,
  };
}

// Verify Twitch signature from Lambda event
export function verifyTwitchSignature(
  headers: Record<string, string>,
  body: string,
  secret: string,
): boolean {
  const signature = headers[TWITCH_MESSAGE_SIGNATURE];
  if (!signature) return false;

  const message = getHmacMessage(headers, body);
  const hmac = HMAC_PREFIX + getHmac(secret, message);
  return verifyMessage(hmac, signature);
}
