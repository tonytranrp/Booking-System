import json
import requests
from discord_webhook import DiscordWebhook

# Replace with your actual Discord webhook URL
DISCORD_WEBHOOK_URL = "https://discordapp.com/api/webhooks/1286411369645736016/IgUBVotyvXDkl2y3f4qaAcJwLyjviOsCN9wOAhpqa2DDtTt7Ws9D00aPuk8fucuGz4W2"

# Create random data
data = {
    "username": "test_user",
    "password": "test_pass",
    "progress": ["A1", "A2", "B1"]
}

# Write the data to a JSON file
filename = "test_data.json"
with open(filename, 'w') as f:
    json.dump(data, f)

# Function to send the file to Discord
def send_to_discord(filename):
    webhook = DiscordWebhook(url=DISCORD_WEBHOOK_URL)
    with open(filename, 'rb') as f:
        webhook.add_file(file=f.read(), filename=filename)
    response = webhook.execute()
    return response

# Send the file and print the URL
response = send_to_discord(filename)
if response.status_code == 200:
    # Assuming the first attachment is the one we just uploaded
    uploaded_url = response.json()['attachments'][0]['url']

    print(f"Uploaded file URL: {uploaded_url}")
else:
    print("Failed to upload the file.")
