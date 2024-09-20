const balls = [];
const gravity = 0.5; // Gravity constant
const bounceFactor = 0.7; // Energy loss on bounce
const friction = 0.99; // Friction to slow down the balls
let isDragging = false;
let draggedBall = null;

function createAnimatedEntertainment() {
    const entertainmentDiv = document.getElementById('entertainment');

    for (let i = 0; i < 5; i++) {
        const ball = document.createElement('div');
        ball.className = 'animated-ball';
        ball.style.width = '50px';
        ball.style.height = '50px';
        ball.style.backgroundImage = `url('https://via.placeholder.com/50')`; // Use actual images
        ball.style.backgroundSize = 'cover';
        ball.style.borderRadius = '50%'; // Make it a circle
        ball.style.position = 'absolute';
        ball.style.top = `${Math.random() * 80 + 10}%`; // Prevent going out of view
        ball.style.left = `${Math.random() * 90 + 5}%`;

        ball.velocityY = 0; // Initial vertical velocity
        ball.velocityX = (Math.random() - 0.5) * 5; // Random horizontal velocity
        balls.push(ball);
        entertainmentDiv.appendChild(ball);

        // Dragging functionality
        ball.onmousedown = (event) => {
            isDragging = true;
            draggedBall = ball;
            ball.style.cursor = 'grabbing';
        };

        ball.onmouseup = () => {
            isDragging = false;
            draggedBall = null;
            ball.style.cursor = 'pointer';
        };
    }

    document.onmousemove = (event) => {
        if (isDragging && draggedBall) {
            draggedBall.style.top = `${event.clientY - 25}px`; // Center the ball on the mouse
            draggedBall.style.left = `${event.clientX - 25}px`;
        }
    };
}

function detectCollision(ball1, ball2) {
    const rect1 = ball1.getBoundingClientRect();
    const rect2 = ball2.getBoundingClientRect();

    return !(
        rect1.right < rect2.left || 
        rect1.left > rect2.right || 
        rect1.bottom < rect2.top || 
        rect1.top > rect2.bottom
    );
}

function handleCollision(ball1, ball2) {
    const rect1 = ball1.getBoundingClientRect();
    const rect2 = ball2.getBoundingClientRect();

    // Calculate overlap
    const overlapX = (rect1.width + rect2.width) / 2 - Math.abs(rect1.left - rect2.left);
    const overlapY = (rect1.height + rect2.height) / 2 - Math.abs(rect1.top - rect2.top);

    // Resolve collision
    if (overlapX < overlapY) {
        ball1.style.left = `${parseFloat(ball1.style.left) + (ball1.velocityX > 0 ? -overlapX : overlapX)}px`;
        ball1.velocityX *= -bounceFactor;
    } else {
        ball1.style.top = `${parseFloat(ball1.style.top) + (ball1.velocityY > 0 ? -overlapY : overlapY)}px`;
        ball1.velocityY *= -bounceFactor;
    }
}

function updatePhysics() {
    balls.forEach((ball) => {
        if (!isDragging || ball !== draggedBall) {
            // Apply gravity
            ball.velocityY += gravity;

            // Move ball
            let top = parseFloat(ball.style.top);
            let left = parseFloat(ball.style.left);
            top += ball.velocityY;
            left += ball.velocityX;

            // Check for collision with the ground
            if (top + 50 >= window.innerHeight) {
                top = window.innerHeight - 50;
                ball.velocityY *= -bounceFactor; // Reverse velocity on bounce
                ball.velocityY *= friction; // Apply friction
            }

            // Update position
            ball.style.top = `${top}px`;
            ball.style.left = `${left}px`;

            // Prevent going out of bounds
            if (left < 0) {
                ball.velocityX = Math.abs(ball.velocityX); // Bounce back
                left = 0; // Reset position
            }
            if (left + 50 > window.innerWidth) {
                ball.velocityX = -Math.abs(ball.velocityX); // Bounce back
                left = window.innerWidth - 50; // Reset position
            }

            ball.style.left = `${left}px`;

            // Check for collisions with other balls
            balls.forEach((otherBall) => {
                if (ball !== otherBall && detectCollision(ball, otherBall)) {
                    handleCollision(ball, otherBall);
                }
            });

            // Apply friction to horizontal velocity
            ball.velocityX *= friction;
        }
    });

    requestAnimationFrame(updatePhysics); // Loop the physics update
}

// Call the function to create animations
window.onload = () => {
    createAnimatedEntertainment();
    updatePhysics();
};
