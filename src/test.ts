import { handler } from './app';
import * as crypto from 'crypto';

const SECRET = 'somethinghereforsecrets';

const MESSAGE_ID = 'f1c2a387-161a-49f9-a165-0f21d7a4e1c4';
const TIMESTAMP = new Date().toISOString();

const body = JSON.stringify({
  subscription: { type: 'stream.online' },
  event: {
    broadcaster_user_id: '549078226',
    broadcaster_user_name: 'teststreamer',
    type: 'live',
  },
});

const signature =
  'sha256=' +
  crypto
    .createHmac('sha256', SECRET)
    .update(MESSAGE_ID + TIMESTAMP + body)
    .digest('hex');

const mockEvent = {
  headers: {
    'twitch-eventsub-message-id': MESSAGE_ID,
    'twitch-eventsub-message-timestamp': TIMESTAMP,
    'twitch-eventsub-message-signature': signature,
    'twitch-eventsub-message-type': 'notification',
    'content-type': 'application/json',
  },
  body,
};

handler(mockEvent).then(console.log).catch(console.error);
