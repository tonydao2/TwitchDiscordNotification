import { loadSecrets } from './utils/utils';
import { verifyTwitchSignature, getTwitchStreamInfo } from './utils/twitch';
import { sendDiscordNotification } from './utils/discord';

export const handler = async (event: any) => {
  const headers = event.headers;
  const rawBody = event.body ?? '';

  

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

  // TODO: check headers['twitch-eventsub-message-type'] — if 'webhook_callback_verification',
  // parse body and return { statusCode: 200, body: parsedBody.challenge } as plain text
  // See: https://dev.twitch.tv/docs/eventsub/handling-webhook-events/#responding-to-a-challenge-request

  const body = JSON.parse(rawBody);
  const { broadcaster_user_id, broadcaster_user_name } = body.event;

  const streamInfo = await getTwitchStreamInfo(
    broadcaster_user_id,
    broadcaster_user_name,
    clientId,
    clientSecret,
  );

  await sendDiscordNotification({
    broadcasterName: streamInfo.broadcasterName,
    streamTitle: streamInfo.title,
    streamUrl: streamInfo.streamUrl,
    discordWebhookUrl,
  });

  await sendDiscordNotification({
    broadcasterName: streamInfo.broadcasterName,
    streamTitle: streamInfo.title,
    streamUrl: streamInfo.streamUrl,
    discordWebhookUrl: tylerDiscordWebhookUrl,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'OK' }),
  };
};
