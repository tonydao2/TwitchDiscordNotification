import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

const secretsClient = new SecretsManagerClient({ region: 'us-east-1' });

const handler = async (event: any, context: any) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Test' }),
  };
};
