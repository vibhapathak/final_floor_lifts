let numFloors = 1;
let numLifts = 1;
const lifts = [];
const floorHeights = []; // Ensure this is declared globally
let liftTargetFloor = -1;
// Define canvas size
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 800;

function setup() {
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT, WEBGL).parent('liftContainer');
    frameRate(30);
    noLoop(); // Stop automatic redrawing
    generateFloors();
    generateLifts();
    generateButtons();
    generateFloorButtons(); // For vertical floor buttons
};

function draw() {
    background(240);
    // Draw floors
    stroke(0);
    strokeWeight(2);
    fill(0); 
    for (let i = 0; i < floorHeights.length; i++) {
        const height = floorHeights[i];
        line(-CANVAS_WIDTH / 2, height, CANVAS_WIDTH / 2, height);
        textSize(16);
        textAlign(RIGHT, CENTER);
        text(`Floor ${i + 1}`, CANVAS_WIDTH / 2 - 10, height); // Label each floor
    }
    
    // Draw lifts
    for (let lift of lifts) {
        push();
        translate(lift.x, lift.y, 0);
        drawCar();
        drawDoors(lift);
        updateLiftPosition(lift);
        pop();
    }
}

function drawCar() {
    fill('rgba(75%, 75%, 100%, 0.2)');
    let liftWidth = 50; // Adjust these sizes as needed
    let liftHeight = 100;
    let liftDepth = 50;
    box(liftWidth, liftHeight, liftDepth); // Draw lift car in 3D
}

function drawDoors(lift) {
    push();
    translate(0, 0, 25);
    fill('rgba(75%, 100%, 75%, 0.5)');
    const doorTravel = 25;
    const xDoorDisplacement = doorTravel * lift.openState;
    [1, -1].forEach(sign => {
        push();
        translate(sign * xDoorDisplacement, 0, 0);
        box(25, 100, 5); // Draw doors
        pop();
    });
    pop();
}

function generateFloors() {
    floorHeights.length = 0; // Reset array
    const floorSpacing = CANVAS_HEIGHT / numFloors; // Space between floors based on canvas height
    for (let i = 0; i < numFloors; i++) {
        // Place floors between the black lines
        floorHeights.push(-CANVAS_HEIGHT / 2 + (i + 0.5) * floorSpacing); // Floor positions
    }
}


function generateLifts() {
    lifts.length = 0; // Reset array
    const liftWidth = 50; // Width of each lift
    const liftHeight = 100;
    const liftDepth = 50;
    const canvasWidth = CANVAS_WIDTH; // Width of the canvas
    // Calculate spacing between lifts
    const totalWidth = numLifts * liftWidth;
    const spacing = (canvasWidth - totalWidth) / (numLifts + 1);
    // Calculate starting position for the first lift
    const startX = -canvasWidth / 2 + spacing + liftWidth / 2;
    for (let i = 0; i < numLifts; i++) {
        lifts.push({
            x: startX + i * (liftWidth + spacing), // Position each lift with even spacing
            y: CANVAS_HEIGHT / 2, // Start lifts at ground level
            targetFloor: 0,
            requests: [],
            openState: 0,
            busy: false,
            doorOpen: false,
        });
    }
}

function generateFloorButtons() {
    const floorButtonsContainer = document.getElementById('floorButtonsContainer');
    floorButtonsContainer.innerHTML = ''; 
    const buttonHeight = 40; 
    const buttonWidth = 100; 
    for (let i = numFloors - 1; i >= 0; i--) {
        const height = floorHeights[i];
        const buttonY = height - buttonHeight / 2;
        const floorNumber = numFloors - i;
        const button = document.createElement('button');
        button.innerText = `Floor ${floorNumber}`; // Label each button with its floor number
        button.style.position = 'absolute'; // Use absolute positioning
        button.style.left = '0px'; // Align to the left edge of the container
        button.style.top = `${buttonY}px`; // Position vertically based on calculated buttonY
        button.style.width = `${buttonWidth}px`; // Set button width
        button.style.height = `${buttonHeight}px`; // Set button height
        button.style.margin = '0px'; // Remove default margin
        button.style.padding = '0px'; // Remove default padding
        button.style.backgroundColor = 'blueviolet'; // Button background color
        button.style.color = 'black'; // Button text color
        button.style.border = '5px solid pink'; // Remove default border
        button.style.borderRadius = '3px'; // Rounded corners
        button.addEventListener('click', () => {
            liftTargetFloor = i;
            callLiftToFloor(liftTargetFloor); });
       floorButtonsContainer.appendChild(button);   }}


function generateButtons() {
    const buttonsContainer = document.getElementById('buttonsContainer');
    buttonsContainer.innerHTML = ''; // Clear any existing buttons
    for (let i = 0; i < numLifts; i++) {
        const button = document.createElement('button');
        button.innerText = `Lift ${i + 1}`; // Label for lifts
        button.addEventListener('click', () => {
            // Optionally, you might want to handle lift-specific actions here
            // For example, selecting a lift to view its details or control it
            console.log(`Lift ${i + 1} button clicked`);
        });
        buttonsContainer.appendChild(button);
    }
}
let currentLiftIndex = 0;

function callLiftToFloor(floorIndex) {
    if (lifts.length === 0) {
        // Optionally add logic for when no lifts are available
        return;
    }

    // Get the lift that should handle this request based on the current index
    let assignedLift = lifts[currentLiftIndex];

    // Add the request to the selected lift's queue
    assignedLift.requests.push(floorIndex);

    // Move to the next lift for the next request
    currentLiftIndex = (currentLiftIndex + 1) % lifts.length;

    // If the selected lift is not busy, start processing its requests
    if (!assignedLift.busy) {
        processLiftRequests(assignedLift);
    }
}


function processLiftRequests(lift) {
    if (lift.requests.length === 0) {
        lift.busy = false;
        return;
    }
    
    lift.busy = true;
    lift.targetFloor = lift.requests.shift(); // Get the next target floor from the queue
}

function updateLiftPosition(lift) {
    const additionalHeight = -50; // Replace with the desired number of pixels

    if (lift.requests.length === 0 && !lift.busy) {
        return; // No requests to process
    }

    const targetHeight = floorHeights[lift.targetFloor] + additionalHeight;
    
    if (lift.y !== targetHeight) {
        // Move the lift towards the target floor
        if (lift.y < targetHeight) {
            lift.y += 2;
            if (lift.y > targetHeight) lift.y = targetHeight; // Ensure it doesn’t overshoot
        } else if (lift.y > targetHeight) {
            lift.y -= 2;
            if (lift.y < targetHeight) lift.y = targetHeight; // Ensure it doesn’t overshoot
        }
    } else {
        // The lift has reached the target floor
        if (!lift.doorOpen) {
            // Open the doors
            if (lift.openState < 1) {
                lift.openState += 0.10;
                if (lift.openState >= 1) {
                    lift.openState = 1;
                    lift.doorOpen = true;
                    // Delay before closing doors
                    setTimeout(() => {
                        // Close the doors
                        if (lift.openState > 0) {
                            lift.openState -= 0.10;
                            if (lift.openState <= 0) {
                                lift.openState = 0;
                                lift.doorOpen = false;
                                lift.busy = false; // No more requests, mark lift as idle
                                // Process the next request in the queue
                                if (lift.requests.length > 0) {
                                    processLiftRequests(lift);
                                }
                            }
                        }
                    }, 1000); // Adjust the delay as needed
                }
            }
        } else {
            // Doors are open, wait to close them
            if (lift.openState > 0) {
                lift.openState -= 0.10;
                if (lift.openState <= 0) {
                    lift.openState = 0;
                    lift.doorOpen = false;
                    lift.busy = false; // No more requests, mark lift as idle
                    // Process the next request in the queue
                    if (lift.requests.length > 0) {
                        processLiftRequests(lift);
                    }
                }
            }
        }
    }
}


window.sketch = {
    update: function(numF, numL) {
        numFloors = numF;
        numLifts = numL;
        generateFloors();
        generateLifts();
        generateButtons();
        generateFloorButtons(); // For vertical floor buttons
        loop(); // Restart automatic redrawing
    }
};
