
from cryptography.fernet import Fernet
import json
from discord_webhook import DiscordWebhook

# Setup encryption and decryption logic
ENCRYPTION_KEY = Fernet.generate_key()
cipher_suite = Fernet(ENCRYPTION_KEY)

DISCORD_WEBHOOK_URL = "https://discordapp.com/api/webhooks/1286411369645736016/IgUBVotyvXDkl2y3f4qaAcJwLyjviOsCN9wOAhpqa2DDtTt7Ws9D00aPuk8fucuGz4W2"  # Replace with your actual webhook URL

def encrypt_data(data):
    return cipher_suite.encrypt(json.dumps(data).encode()).decode()

def send_to_discord(encrypted_data, filename):
    try:
        webhook = DiscordWebhook(url=DISCORD_WEBHOOK_URL)
        webhook.add_file(file=encrypted_data.encode(), filename=filename)
        response = webhook.execute()
        if response.status_code == 200:
            print('Data sent to Discord successfully.')
            return response.json()['attachments'][0]['url']  # Extract the URL of the uploaded file
        else:
            print(f'Failed to send data to Discord: {response.status_code} - {response.text}')
    except Exception as e:
        print(f'Error occurred while sending to Discord: {str(e)}')
    return None

def decrypt_data(encrypted_data):
    return json.loads(cipher_suite.decrypt(encrypted_data.encode()).decode())
