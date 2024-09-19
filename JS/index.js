const SERVER_URL = 'http://localhost:8000';  // Assuming the Python server runs on port 8000
const rows = ['A', 'B', 'C', 'D'];
const seatsPerRow = 10;
let selectedSeats = [];
let currentUser = null;

function signIn() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    fetch(`${SERVER_URL}/signin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === 'success') {
            currentUser = username;
            document.getElementById('authSection').classList.add('hidden');
            document.getElementById('bookingSection').classList.remove('hidden');
            loadUserBooking();
        } else {
            alert('Sign in failed: ' + result.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while signing in. Please try again.');
    });
}

function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    fetch(`${SERVER_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === 'success') {
            alert('Registration successful. Please sign in.');
        } else {
            alert('Registration failed: ' + result.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while registering. Please try again.');
    });
}

function generateSeatMap() {
    const seatMap = document.getElementById('seatMap');
    seatMap.innerHTML = '';
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

function bookSeats() {
    if (!currentUser) return;
    const numPeople = parseInt(document.getElementById('numPeople').value);
    if (selectedSeats.length === numPeople) {
        const bookingData = {
            user: currentUser,
            seats: selectedSeats,
            timestamp: new Date().toISOString()
        };
        
        fetch(`${SERVER_URL}/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData),
        })
        .then(response => response.json())
        .then(result => {
            if (result.status === 'success') {
                alert(`Booked seats: ${selectedSeats.join(', ')}`);
                clearSelection();
            } else {
                alert('Booking failed: ' + result.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while booking. Please try again.');
        });
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

function loadUserBooking() {
    if (!currentUser) return;

    fetch(`${SERVER_URL}/user-booking?username=${encodeURIComponent(currentUser)}`)
    .then(response => response.json())
    .then(data => {
        if (data.seats) {
            selectedSeats = data.seats;
            selectedSeats.forEach(seatId => {
                const seatElement = document.querySelector(`[data-seat-id="${seatId}"]`);
                if (seatElement) {
                    seatElement.classList.add('selected');
                }
            });
            updateSelectedSeats();
        }
    })
    .catch(error => {
        console.error('Error loading user booking:', error);
        alert('An error occurred while loading your booking. Please try again.');
    });
}

window.onload = generateSeatMap;
document.getElementById('numPeople').addEventListener('change', clearSelection);