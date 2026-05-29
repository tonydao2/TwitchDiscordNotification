import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

class DiscordTwitchNotifStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // AWS Secrets Manager
    const DiscordTwitchSecrets = 'secrets-manager-twitch-discord';

    const tag = Math.random() * 1000000;

    // Lambda
    const lambda = new cdk.aws_lambda.DockerImageFunction(
      this,
      'TwitchDiscordLambda',
      {
        architecture: cdk.aws_lambda.Architecture.X86_64,
        code: cdk.aws_lambda.DockerImageCode.fromImageAsset('./src', {
          file: 'Dockerfile',
          platform: cdk.aws_ecr_assets.Platform.LINUX_AMD64,
          buildArgs: {
            FORCE_REBUILD: tag.toString(),
          },
          assetName: 'twitch-discord-notif-ECR',
        }),
        memorySize: 256,
        timeout: cdk.Duration.seconds(30),
        environment: {
          TWITCH_SECRETS: DiscordTwitchSecrets,
        },
        logFormat: cdk.aws_lambda.LogFormat.JSON,
        applicationLogLevelV2: cdk.aws_lambda.ApplicationLogLevel.DEBUG,
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
        `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${DiscordTwitchSecrets}*`,
      ],
    });

    lambda.addToRolePolicy(secretsManager);

    // API Gateway to trigger Lambda
    const api = new cdk.aws_apigatewayv2.HttpApi(this, 'TwitchDiscordApi', {
      apiName: 'TwitchDiscordNotificationApi',
    });

    api.addRoutes({
      path: '/notify',
      methods: [cdk.aws_apigatewayv2.HttpMethod.POST],
      integration: new cdk.aws_apigatewayv2_integrations.HttpLambdaIntegration(
        'LambdaIntegration',
        lambda,
      ),
    });

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
