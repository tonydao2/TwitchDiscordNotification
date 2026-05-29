import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

class DiscordTwitchNotifStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // AWS Secrets Manager
    const TwitchSecrets = 'secrets-manager-twitch';
    const DiscordSecrets = 'secrets-manager-discord-webhook';

    // Lambda 
    const lambda = new cdk.aws_lambda.DockerImageFunction(
      this,
      'TwitchDiscordLambda',
      {
        architecture: cdk.aws_lambda.Architecture.X86_64,
        code: cdk.aws_lambda.DockerImageCode.fromImageAsset('./src', {
          file: 'Dockerfile',
          platform: cdk.aws_ecr_assets.Platform.LINUX_AMD64,
        }),
        memorySize: 256,
        timeout: cdk.Duration.seconds(30),
        environment: {
          TWITCH_SECRETS: TwitchSecrets,
          DISCORD_SECRETS: DiscordSecrets,
        },
        logFormat: cdk.aws_lambda.LogFormat.JSON,
        applicationLogLevelV2: cdk.aws_lambda.ApplicationLogLevel.ERROR,
        systemLogLevelV2: cdk.aws_lambda.SystemLogLevel.INFO,
      },
    );

    // Log Group for Lambda
    const logGroup = new cdk.aws_logs.LogGroup(this, 'TwitchDiscordLogGroup', {
      logGroupName: `/aws/lambda/${lambda.functionName}`,
      retention: cdk.aws_logs.RetentionDays.THREE_DAYS,
    });

    logGroup.node.addDependency(lambda);

    // Grant Lambda permissions to read secrets
    const secretsManager = new cdk.aws_iam.PolicyStatement({
      actions: ['secretsmanager:GetSecretValue'],
      resources: [
        `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${TwitchSecrets}*`,
        `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${DiscordSecrets}*`,
      ],
    });

    lambda.addToRolePolicy(secretsManager);

    // API Gateway to trigger Lambda

    // SNS to Slack/Email myself if failed
  }
}

const app = new cdk.App();
const myStack = new DiscordTwitchNotifStack(app, 'DiscordTwitchNotifStack', {
  env: {
    account: '306408468647',
    region: 'us-east-1',
  },
});

cdk.Tags.of(myStack).add(
  'repo',
  'git@github.com/tonydao2/TwitchDiscordNotification',
);
cdk.Tags.of(myStack).add('source', 'Twitch');
cdk.Tags.of(myStack).add('destination', 'Discord');
cdk.Tags.of(myStack).add('name', 'TwitchDiscordNotification');
app.synth();
