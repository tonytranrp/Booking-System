let selectedSeats = [];

function generateSeatMap() {
    const seatMap = document.getElementById('seatMap');
    seatMap.innerHTML = '';

    const totalRows = 5;  // Total rows from 1 to 40
    const seatsPerSide = 3; // Seats on each side of the aisle (3 on the left, 3 on the right)

    for (let row = 1; row <= totalRows; row++) {
        const rowContainer = document.createElement('div');
        rowContainer.className = 'row';

        // Create seats on the left side
        for (let seatNum = 1; seatNum <= seatsPerSide; seatNum++) {
            const seatId = `L${row}${seatNum}`; // L for left side seats
            const seat = createSeatElement(seatId);
            rowContainer.appendChild(seat);
        }

        // Add a space for the aisle
        const aisle = document.createElement('div');
        aisle.className = 'aisle';
        rowContainer.appendChild(aisle);

        // Create seats on the right side
        for (let seatNum = 1; seatNum <= seatsPerSide; seatNum++) {
            const seatId = `R${row}${seatNum}`; // R for right side seats
            const seat = createSeatElement(seatId);
            rowContainer.appendChild(seat);
        }

        seatMap.appendChild(rowContainer);
    }
}

function createSeatElement(seatId) {
    const seat = document.createElement('div');
    seat.className = 'seat';
    seat.textContent = seatId;
    seat.setAttribute('data-seat-id', seatId);
    seat.onclick = () => toggleSeat(seatId);
    return seat;
}

let notificationTimeout;  // Timeout to manage notification fade
let notificationInProgress = false; // Prevent multiple notifications stacking

function toggleSeat(seatId) {
    const seatElement = document.querySelector(`[data-seat-id="${seatId}"]`);
    if (!seatElement) return;

    const numPeople = parseInt(document.getElementById('numPeople').value);
    let message = '';

    // Check if the seat is already selected
    if (selectedSeats.includes(seatId)) {
        selectedSeats = selectedSeats.filter(seat => seat !== seatId);
        seatElement.classList.remove('selected');
        message = `Deselected seat: ${seatId}`;
        anime({
            targets: seatElement,
            backgroundColor: '#ccc',
            scale: 1,
            duration: 500
        });
    } else if (selectedSeats.length < numPeople) {
        // Only add a seat if the number of selected seats is less than numPeople
        selectedSeats.push(seatId);
        seatElement.classList.add('selected');
        message = `Selected seat: ${seatId}`;
        anime({
            targets: seatElement,
            backgroundColor: '#4CAF50',
            scale: 1.1,
            duration: 500
        });
    } else {
        // If trying to select more than the allowed number of seats
        message = `You can only select ${numPeople} seats.`;
    }

    document.getElementById('selectedSeats').textContent = selectedSeats.join(', ');

    // Show notification
    showNotification(message);
}

function showNotification(message) {
    const notification = document.getElementById('seatNotification');
    const loadingBar = document.getElementById('loadingBar');
    const notificationText = document.getElementById('notificationText');

    // Clear any existing timeouts to prevent stacking of notifications
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
        notificationInProgress = false;
    }

    // Update notification text
    notificationText.textContent = message;

    // Show the notification if not already in progress
    if (!notificationInProgress) {
        notificationInProgress = true;
        notification.classList.remove('hidden');
        notification.classList.remove('fade-out');
        notification.style.right = '20px'; // Slide in smoothly

        // Start loading bar animation
        loadingBar.style.width = '100%';

        // Set a timeout to begin the fade-out and slide-out process
        notificationTimeout = setTimeout(() => {
            notification.classList.add('fade-out');
            loadingBar.style.width = '0'; // Reset loading bar

            // Complete fade-out and hide notification
            setTimeout(() => {
                notification.style.right = '-300px'; // Slide out smoothly
                notification.classList.add('hidden');
                notificationInProgress = false; // Allow new notifications
            }, 500); // Wait for fade-out to finish
        }, 1500); // Show the notification for 1.5 seconds
    }
}
