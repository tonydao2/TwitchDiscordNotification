interface DiscordNotificationProps {
  broadcasterName: string;
  streamTitle: string;
  streamUrl: string;
  discordWebhookUrl: string;
}

export async function sendDiscordNotification(
  props: DiscordNotificationProps,
): Promise<void> {
  const { broadcasterName, streamTitle, streamUrl, discordWebhookUrl } = props;

  const payload = {
    embeds: [
      {
        title: `${broadcasterName} is now live!`,
        url: streamUrl,
        description: streamTitle,
      },
    ],
  };

  const response = await fetch(discordWebhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Discord webhook failed: ${response.status}`);
  }
}
