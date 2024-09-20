body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f0f0f0;
    color: #333;
    display: flex;
    flex-direction: column;
    align-items: center;
}

h1 {
    margin-top: 20px;
}

#authSection, #bookingSection {
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    margin-top: 20px;
    width: 300px;
    text-align: center;
}

#entertainment {
    margin-top: 20px;
    width: 100%;
    height: 200px;
    background-image: url('https://via.placeholder.com/800x200');
    background-size: cover;
    border-radius: 10px;
    position: relative;
    overflow: hidden;
}

#entertainment:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    transition: opacity 0.5s;
}

#entertainment:hover:before {
    opacity: 0;
}

.seat {
    width: 40px;
    height: 40px;
    margin: 5px;
    display: inline-block;
    background-color: #ccc;
    text-align: center;
    line-height: 40px;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s;
}

.seat:hover {
    transform: scale(1.1);
}

.selected {
    background-color: #4CAF50;
    animation: expand 0.3s forwards;
}

@keyframes expand {
    from { transform: scale(1); }
    to { transform: scale(1.2); }
}

.unselected {
    animation: fade 0.3s forwards;
}

@keyframes fade {
    from { opacity: 1; }
    to { opacity: 0; }
}

.hidden {
    display: none;
}
.animated-ball {
    transition: transform 0.3s; /* Smooth transitions */
}
