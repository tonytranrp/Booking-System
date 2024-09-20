import json
import time
import threading
import requests
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from discord_webhook import DiscordWebhook
from cryptography.fernet import Fernet

DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1286411369645736016/IgUBVotyvXDkl2y3f4qaAcJwLyjviOsCN9wOAhpqa2DDtTt7Ws9D00aPuk8fucuGz4W2"
ENCRYPTION_KEY = Fernet.generate_key()
cipher_suite = Fernet(ENCRYPTION_KEY)

users = {}
bookings = {}
current_file_url = None

def encrypt_data(data):
    return cipher_suite.encrypt(json.dumps(data).encode()).decode()

def decrypt_data(encrypted_data):
    return json.loads(cipher_suite.decrypt(encrypted_data.encode()))

def save_data_to_discord():
    global current_file_url
    data = {
        "users": users,
        "bookings": bookings
    }
    encrypted_data = encrypt_data(data)
    webhook = DiscordWebhook(url=DISCORD_WEBHOOK_URL)
    filename = f"upload-{int(time.time())}.json"
    webhook.add_file(file=encrypted_data.encode(), filename=filename)
    response = webhook.execute()
    
    if response.status_code == 200:
        message_data = response.json()
        current_file_url = message_data['attachments'][0]['url']
        print(f"Data saved to Discord: {current_file_url}")
    else:
        print("Failed to save data to Discord")

def load_data_from_discord():
    global users, bookings, current_file_url
    if current_file_url:
        response = requests.get(current_file_url)
        if response.status_code == 200:
            encrypted_data = response.text
            data = decrypt_data(encrypted_data)
            users = data.get("users", {})
            bookings = data.get("bookings", {})
            print("Data loaded from Discord")
        else:
            print("Failed to load data from Discord")
    else:
        print("No file URL available. Creating initial empty file.")
        save_data_to_discord()

def sync_data_periodically():
    while True:
        load_data_from_discord()
        time.sleep(60)  # Wait for 1 minute
        save_data_to_discord()

class BookingHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))

        if self.path == '/signin':
            result = self.handle_signin(data)
        elif self.path == '/register':
            result = self.handle_register(data)
        elif self.path == '/book':
            result = self.handle_booking(data)
        else:
            result = {"status": "error", "message": "Invalid endpoint"}

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(result).encode('utf-8'))

    def do_GET(self):
        if self.path.startswith('/user-booking'):
            parsed_path = urlparse(self.path)
            params = parse_qs(parsed_path.query)
            username = params.get('username', [None])[0]
            
            if username:
                booking = bookings.get(username, {"seats": []})
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(booking).encode('utf-8'))
            else:
                self.send_error(400, "Missing username parameter")
        else:
            self.send_error(404, "Not Found")

    def handle_signin(self, data):
        username = data.get('username')
        password = data.get('password')
        if username in users and users[username] == password:
            return {"status": "success", "message": "Signed in successfully"}
        else:
            return {"status": "error", "message": "Invalid username or password"}

    def handle_register(self, data):
        username = data.get('username')
        password = data.get('password')
        if username in users:
            return {"status": "error", "message": "Username already exists"}
        else:
            users[username] = password
            save_data_to_discord()  # Save data after registration
            return {"status": "success", "message": "Registered successfully"}

    def handle_booking(self, data):
        username = data.get('user')
        seats = data.get('seats')
        timestamp = data.get('timestamp')
        
        if username not in users:
            return {"status": "error", "message": "User not found"}
        
        bookings[username] = {
            "seats": seats,
            "timestamp": timestamp
        }
        
        save_data_to_discord()  # Save data after booking
        
        message = f"New booking: User {username} booked seats {', '.join(seats)} at {timestamp}"
        webhook = DiscordWebhook(url=DISCORD_WEBHOOK_URL, content=message)
        webhook.execute()
        
        return {"status": "success", "message": "Booking processed and sent to Discord"}

def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, BookingHandler)
    print(f"Server running on port {port}")
    
    # Start the data synchronization thread
    sync_thread = threading.Thread(target=sync_data_periodically)
    sync_thread.daemon = True
    sync_thread.start()
    
    httpd.serve_forever()

if __name__ == "__main__":
    load_data_from_discord()  # Load initial data
    run_server()
