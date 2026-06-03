import { loadSecrets } from './utils/utils';
import { verifyTwitchSignature, getTwitchStreamInfo } from './utils/twitch';
import { sendDiscordNotification } from './utils/discord';

const MESSAGE_TYPE = 'Twitch-Eventsub-Message-Type'.toLowerCase();

// Notification message types
const MESSAGE_TYPE_VERIFICATION = 'webhook_callback_verification';
const MESSAGE_TYPE_NOTIFICATION = 'notification';

export const handler = async (event: any) => {
  const headers = event.headers;
  const rawBody = event.body ?? '';
  const messageType = event.headers[MESSAGE_TYPE];

  const {
    webhookSecret,
    clientId,
    clientSecret,
    discordWebhookUrl,
    tylerDiscordWebhookUrl,
  } = await loadSecrets();

  if (!verifyTwitchSignature(headers, rawBody, webhookSecret)) {
    console.warn('Invalid Twitch signature');
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized' }),
    };
  }

  // Twitch sends a challenge request in headers, must respond to webhook_callback_verification
  if (MESSAGE_TYPE_VERIFICATION === messageType) {
    // Must return a 200 status code, the response body must contain the raw challenge value, and must set the Content-Type response header to the length of the challenge value.
    let notification = JSON.parse(rawBody);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: notification.challenge,
    };
  }

  // Ignore anything but notification
  if (messageType !== MESSAGE_TYPE_NOTIFICATION) {
    return { statusCode: 204, body: '' };
  }

  // TODO: Probably need to add revocation

  const body = JSON.parse(rawBody);
  const { broadcaster_user_id, broadcaster_user_name } = body.event;

  const streamInfo = await getTwitchStreamInfo(
    broadcaster_user_id,
    broadcaster_user_name,
    clientId,
    clientSecret,
  );

  await Promise.all([
    sendDiscordNotification({
      broadcasterName: streamInfo.broadcasterName,
      streamTitle: streamInfo.title,
      streamUrl: streamInfo.streamUrl,
      discordWebhookUrl,
    }),
    sendDiscordNotification({
      broadcasterName: streamInfo.broadcasterName,
      streamTitle: streamInfo.title,
      streamUrl: streamInfo.streamUrl,
      discordWebhookUrl: tylerDiscordWebhookUrl,
    }),
  ]);

  return {
    statusCode: 204,
    body: JSON.stringify({ message: 'OK' }),
  };
};
