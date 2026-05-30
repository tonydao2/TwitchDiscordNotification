## Description

A serverless AWS service that listens for Twitch stream-live events via webhook and sends notifications to one or more Discord channels. When a subscribed streamer goes live, the bot fetches stream metadata from the Twitch API and posts an embed/message to Discord via webhook URL.

## Tech Stack

- **Language**: TypeScript (Node.js)
- **Infrastructure**: AWS CDK (IaC)
- **Compute**: AWS Lambda (Docker image)
- **API**: AWS API Gateway v2 (HTTP API) — `/notify` POST endpoint
- **Secrets**: AWS Secrets Manager (Twitch + Discord credentials)

## How It Works

1. Twitch sends a signed POST webhook to the API Gateway `/notify` endpoint when a subscribed streamer goes live
2. Lambda verifies the Twitch HMAC signature
3. Fetches live stream info (title, URL) from the Twitch API using stored credentials
4. Posts a Discord notification to one or more webhook URLs (currently two hardcoded channels, looking to expand to use DynamoDB)
