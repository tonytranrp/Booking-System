let selectedSeats = [];
let currentUser = null;
let pyodide;
let jsonLink = ""; // Variable to hold the latest JSON link
let registeredUsers = []; // Array to hold registered users

async function loadPyodideAndPackages() {
    pyodide = await loadPyodide();
    await pyodide.loadPackage('micropip');
    await pyodide.runPythonAsync(`
        import micropip
        await micropip.install(['requests', 'cryptography', 'discord-webhook'])
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
    `);
    console.log('Pyodide and packages loaded!');
}

function generateSeatMap() {
    const seatMap = document.getElementById('seatMap');
    seatMap.innerHTML = '';
    const rows = ['A', 'B', 'C', 'D'];
    const seatsPerRow = 10;
    for (let row of rows) {
        for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
            const seat = document.createElement('div');
            seat.className = 'seat';
            const seatId = `${row}${seatNum}`;
            seat.textContent = seatId;
            seat.setAttribute('data-seat-id', seatId);
            seat.onclick = () => toggleSeat(seatId);
            seatMap.appendChild(seat);
        }
        seatMap.appendChild(document.createElement('br'));
    }
}

function toggleSeat(seatId) {
    if (!currentUser) return;
    const seatElement = document.querySelector(`[data-seat-id="${seatId}"]`);
    if (!seatElement) return;

    const numPeople = parseInt(document.getElementById('numPeople').value);

    if (selectedSeats.includes(seatId)) {
        selectedSeats = selectedSeats.filter(seat => seat !== seatId);
        seatElement.classList.remove('selected');
    } else if (selectedSeats.length < numPeople) {
        selectedSeats.push(seatId);
        seatElement.classList.add('selected');
    }

    updateSelectedSeats();
}

function updateSelectedSeats() {
    document.getElementById('selectedSeats').textContent = selectedSeats.join(', ');
}

async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Check if the username is already registered
    if (registeredUsers.find(user => user.username === username)) {
        alert("Username is already registered!");
        return;
    }

    const userData = { username, password, progress: selectedSeats };
    registeredUsers.push(userData); // Add user to the registered list

    const encryptedData = await pyodide.runPythonAsync(`
        encrypt_data(${JSON.stringify(userData)})
    `);

    console.log('Encrypted Data:', encryptedData);

    const filename = `upload-${Date.now()}.json`;
    jsonLink = await pyodide.runPythonAsync(`
        send_to_discord(${JSON.stringify(encryptedData)}, "${filename}")
    `);

    console.log('JSON Link:', jsonLink);

    if (jsonLink) {
        alert("Registration successful! Please sign in.");
    } else {
        alert("Failed to send data to Discord.");
    }
}

async function signIn() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const user = registeredUsers.find(user => user.username === username && user.password === password);

    if (user) {
        currentUser = username;
        document.getElementById('authSection').classList.add('hidden');
        document.getElementById('bookingSection').classList.remove('hidden');
        loadUserBooking();
    } else {
        alert('Sign in failed. Please try again.');
    }
}

async function loadUserBooking() {
    if (!currentUser) return;

    // Fetch and decrypt user's previous booking data
    const response = await fetch(jsonLink);  // Use dynamic link
    const jsonData = await response.json();

    for (const entry of jsonData) {
        if (entry.username === currentUser) {
            selectedSeats = entry.progress || [];
            updateSelectedSeats();
            break;
        }
    }
}

function bookSeats() {
    if (!currentUser) return;
    const numPeople = parseInt(document.getElementById('numPeople').value);
    if (selectedSeats.length === numPeople) {
        alert(`Booked seats: ${selectedSeats.join(', ')}`);
        clearSelection();
    } else {
        alert(`Please select exactly ${numPeople} seats.`);
    }
}

function clearSelection() {
    selectedSeats.forEach(seatId => {
        const seatElement = document.querySelector(`[data-seat-id="${seatId}"]`);
        if (seatElement) {
            seatElement.classList.remove('selected');
        }
    });
    selectedSeats = [];
    updateSelectedSeats();
}

// Initialize when window loads
window.onload = () => {
    loadPyodideAndPackages();
    generateSeatMap();
};
