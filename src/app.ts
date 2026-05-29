import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

const secretsClient = new SecretsManagerClient({ region: 'us-east-1' });

export const handler = async (event: any, context: any) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  console.log('Headers:', event.headers);
  console.log('Body:', event.body);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Test' }),
  };
};
