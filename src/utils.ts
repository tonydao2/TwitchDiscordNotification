import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

const secretsClient = new SecretsManagerClient({
  region: process.env.AWS_REGION ?? 'us-east-1',
});

export const getSecretValue = async (
  secretName: string,
): Promise<string | undefined> => {
  const command = new GetSecretValueCommand({ SecretId: secretName });
  try {
    const response = await secretsClient.send(command);
    return response.SecretString;
  } catch (error) {
    console.error('Error fetching secret:', error);
    throw error;
  }
};

// TODO: Add DynamoDB table to parse multiple discord channels instead of hardcoding two webhooks in secrets manager

export const loadSecrets = async () => {
  // Load both secrets in parallel
  const [webhookRaw, twitchRaw] = await Promise.all([
    getSecretValue('twitch-webhook-secrets'),
    getSecretValue('secrets-manager-twitch-discord'),
  ]);

  const { Secrets: webhookSecret } = JSON.parse(webhookRaw ?? '{}');

  const {
    ClientID: clientId,
    ClientSecret: clientSecret,
    MyDiscordWebhook: discordWebhookUrl,
    TylerDiscordWebhook: tylerDiscordWebhookUrl,
  } = JSON.parse(twitchRaw ?? '{}');

  return {
    webhookSecret,
    clientId,
    clientSecret,
    discordWebhookUrl,
    tylerDiscordWebhookUrl,
  };
};
