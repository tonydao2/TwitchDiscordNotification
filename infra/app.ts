import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

class DiscordTwitchNotifStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // AWS Secrets Manager
        const TwitchSecrets = "";
        const DiscordSecrets = "";

        const repository: String = "TwitchDiscordNotif";

        // AWS Lambda ECR Init
        const 


    }
}

const app = new cdk.App();
