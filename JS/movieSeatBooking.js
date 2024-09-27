let selectedSeats = [];

function generateSeatMap() {
    const seatMap = document.getElementById('seatMap');
    seatMap.innerHTML = '';

    const rows = ['A', 'B', 'C', 'D'];
    const seatsPerRow = 5;

    for (let row of rows) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';

        for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
            const seat = document.createElement('div');
            seat.className = 'seat';
            const seatId = `${row}${seatNum}`;
            seat.textContent = seatId;
            seat.setAttribute('data-seat-id', seatId);
            seat.onclick = () => toggleSeat(seatId);
            rowDiv.appendChild(seat);
        }
        seatMap.appendChild(rowDiv);
    }
}

function toggleSeat(seatId) {
    const seatElement = document.querySelector(`[data-seat-id="${seatId}"]`);
    if (!seatElement) return;

    const numPeople = parseInt(document.getElementById('numPeople').value);
    let message = '';

    if (selectedSeats.includes(seatId)) {
        selectedSeats = selectedSeats.filter(seat => seat !== seatId);
        seatElement.classList.remove('selected');
        message = `Deselected seat: ${seatId}`;
        animateSeat(seatElement, '#ccc');
    } else if (selectedSeats.length < numPeople) {
        selectedSeats.push(seatId);
        seatElement.classList.add('selected');
        message = `Selected seat: ${seatId}`;
        animateSeat(seatElement, '#4CAF50');
    } else {
        message = `You can only select ${numPeople} seats.`;
    }

    document.getElementById('selectedSeats').textContent = selectedSeats.join(', ');
    showNotification(message);
}

function animateSeat(seatElement, color) {
    anime({
        targets: seatElement,
        backgroundColor: color,
        scale: 1.1,
        duration: 500,
        easing: 'easeInOutQuad'
    });
}

function showNotification(message) {
    const notification = document.getElementById('seatNotification');
    const loadingBar = document.getElementById('loadingBar');
    const notificationText = document.getElementById('notificationText');

    notificationText.textContent = message;
    notification.classList.remove('hidden');

    // Show loading bar animation
    loadingBar.style.width = '100%';
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        loadingBar.style.width = '0';
        setTimeout(() => {
            notification.classList.add('hidden');
            notification.classList.remove('fade-out');
        }, 500);
    }, 1500);
}

function bookSeats() {
    if (selectedSeats.length > 0) {
        alert(`Booking the following seats: ${selectedSeats.join(', ')}`);
        
        // Store selected seats in local storage
        localStorage.setItem('selectedSeats', selectedSeats.join(', '));
        
        // Reset after booking
        selectedSeats = []; 
        document.getElementById('selectedSeats').textContent = '';
        generateSeatMap(); // Regenerate seat map

        // Redirect to ticket page
        window.location.href = "./JS/Ticket.html"; // Make sure this path is correct
    } else {
        alert('Please select at least one seat.');
    }
}



function selectBookingSystem(type) {
    document.getElementById('menuSection').classList.add('hidden');
    document.getElementById('authSection').classList.remove('hidden');
    // Add any further logic needed for selection here.
}

// Initialize the seat map on load
window.onload = generateSeatMap;
