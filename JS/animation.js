window.onload = function() {
    loadPyodideAndPackages();
    generateSeatMap();
    startBackgroundAnimation();
};

function startBackgroundAnimation() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let particlesArray = [];

    // Set initial canvas dimensions to fill the whole window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Particle object
    class Particle {
        constructor(x, y) {
            this.x = x || Math.random() * canvas.width;
            this.y = y || Math.random() * canvas.height;
            this.size = Math.random() * 5 + 1;
            this.speedX = Math.random() * 3 - 1.5;
            this.speedY = Math.random() * 3 - 1.5;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.size > 0.2) this.size -= 0.1; // Particle fades out
        }

        draw() {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
    }

    function handleParticles() {
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();

            // Remove particle if its size is too small
            if (particlesArray[i].size <= 0.3) {
                particlesArray.splice(i, 1);
                i--;
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        handleParticles();
        requestAnimationFrame(animate);
    }

    // Add particles based on mouse movement across the entire window
    window.addEventListener('mousemove', (event) => {
        for (let i = 0; i < 10; i++) {
            particlesArray.push(new Particle(event.x, event.y));
        }
    });

    // Start the animation loop
    animate();

    // Adjust canvas size when the window is resized
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}
