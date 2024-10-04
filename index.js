const floorInput = document.getElementById("floor-input");
const LiftInput = document.getElementById("lift-input");
const submitButton = document.getElementById("submit-btn");
const container = document.getElementById("container");
const liftContainer = document.createElement("div");

let liftStates = {}; // Track the state of each lift
let liftQueues = {}; // Queue for each lift

submitButton.addEventListener("click", () => {
    container.innerHTML = "";
    liftContainer.innerHTML = "";
    
    const numFloors = parseInt(floorInput.value, 10);
    const numLifts = parseInt(LiftInput.value, 10);

    for (let i = numFloors; i > 0; i--) {
        createFloors(i, numLifts);
    }

    for (let i = 0; i < numLifts; i++) {
        liftStates[`lift-${i}`] = { currentFloor: 1, busy: false, direction: null, doorsOpen: false };
        liftQueues[`lift-${i}`] = [];
    }

    // Empty input box
    LiftInput.value = "";
    floorInput.value = "";
});

function createFloors(floors, lifts) {
    const floorDiv = document.createElement("div");
    floorDiv.setAttribute("class", "floordiv");

    const floorContainer = document.createElement("div");
    floorContainer.setAttribute("class", "floor");
    floorContainer.dataset.floor = floors;

    const buttonContainer = document.createElement("div");
    buttonContainer.setAttribute("class", "btn-div");

    const UpButton = document.createElement("button");
    const DownButton = document.createElement("button");

    UpButton.setAttribute("class", "up-down");
    DownButton.setAttribute("class", "up-down");

    UpButton.setAttribute("id", `up-${floors}`);
    DownButton.setAttribute("id", `down-${floors}`);

    UpButton.innerText = "Up";
    DownButton.innerText = "Down";

    UpButton.dataset.floor = floors;
    DownButton.dataset.floor = floors;

    buttonContainer.append(UpButton);
    buttonContainer.append(DownButton);

    let floorNumber = document.createElement("p");
    floorNumber.setAttribute("class", "floorName");
    floorNumber.innerText = `Floor ${floors}`;

    buttonContainer.append(floorNumber);
    floorContainer.append(buttonContainer);
    floorDiv.append(floorContainer);
    container.append(floorDiv);

    // Logic to generate Lifts only for the first floor
    if (floors === 1) {
        for (let j = 0; j < lifts; j++) {
            let lift = document.createElement("div");
            lift.setAttribute("class", "lift-div");
            lift.setAttribute("onfloor", 1);
            lift.dataset.id = `lift-${j}`;

            let leftDoor = document.createElement("div");
            let rightDoor = document.createElement("div");

            leftDoor.setAttribute("class", "left-door");
            rightDoor.setAttribute("class", "right-door");

            lift.appendChild(leftDoor);
            lift.appendChild(rightDoor);

            liftContainer.appendChild(lift);
        }
        
        liftContainer.setAttribute("class", "lift");
        floorContainer.append(liftContainer);
    }
}

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("up-down")) {
        const clickedFloor = parseInt(e.target.dataset.floor);
        const isUpButton = e.target.innerText === "Up";

        // Disable the button and turn it grey
        e.target.style.backgroundColor = "gray"; 
        e.target.classList.add("disabled");

        requestLift(clickedFloor, isUpButton);
    }
});

function requestLift(requestedFloor, isUp) {
    const direction = isUp ? "up" : "down";
    let selectedLift = null;
    let minDistance = Infinity;

    for (const liftId in liftStates) {
        const lift = liftStates[liftId];
        const distance = Math.abs(lift.currentFloor - requestedFloor);

        if (!lift.busy && distance < minDistance) {
            selectedLift = liftId;
            minDistance = distance;
        }
    }

    if (selectedLift) {
        liftQueues[selectedLift].push({ floor: requestedFloor, direction: direction });
        if (!liftStates[selectedLift].busy) {
            processLiftQueue(selectedLift);
        }
    } else {
        // If all lifts are busy, add the request to the shortest queue
        let shortestQueueLift = Object.keys(liftQueues).reduce((a, b) => 
            liftQueues[a].length <= liftQueues[b].length ? a : b
        );
        liftQueues[shortestQueueLift].push({ floor: requestedFloor, direction: direction });
    }
}

function processLiftQueue(liftId) {
    if (liftQueues[liftId].length === 0) {
        liftStates[liftId].busy = false;
        liftStates[liftId].direction = null;
        return;
    }

    liftStates[liftId].busy = true;
    const nextRequest = liftQueues[liftId].shift();
    MoveLift(nextRequest.floor, liftId, nextRequest.direction);
}

function MoveLift(targetFloor, liftId, direction) {
    const elevator = document.querySelector(`[data-id="${liftId}"]`);
    let currentFloor = liftStates[liftId].currentFloor;
    let duration = Math.abs(targetFloor - currentFloor) * 2;

    liftStates[liftId].currentFloor = targetFloor;
    liftStates[liftId].direction = direction;

    // Ensure doors are closed before moving
    if (liftStates[liftId].doorsOpen) {
        closeLiftDoors(elevator, () => {
            liftStates[liftId].doorsOpen = false;
            startLiftMovement();
        });
    } else {
        startLiftMovement();
    }

    function startLiftMovement() {
        elevator.style.transition = `transform ${duration}s linear`;
        elevator.style.transform = `translateY(-${100 * (targetFloor - 1)}px)`;

        // Open doors after the lift reaches the destination
        setTimeout(() => {
            openLiftDoors(elevator);
        }, duration * 1000);

        // After the lift has moved and doors have closed, process next request
        setTimeout(() => {
            resetButtonState(targetFloor, direction);
            processLiftQueue(liftId);
        }, duration * 1000 + 5000); // 5 seconds for doors to open and close
    }
}

function resetButtonState(floor, direction) {
    const button = document.getElementById(`${direction}-${floor}`);
    if (button) {
        button.classList.remove("disabled");
        button.style.backgroundColor = "";
    }
}

function openLiftDoors(lift) {
    lift.children[0].style.transition = "transform 2.5s ease-in-out";
    lift.children[1].style.transition = "transform 2.5s ease-in-out";
    lift.children[0].style.transform = "translateX(-100%)"; // Open left door
    lift.children[1].style.transform = "translateX(100%)"; // Open right door

    setTimeout(() => {
        closeLiftDoors(lift);
    }, 2500);
}

function closeLiftDoors(lift, callback) {
    lift.children[0].style.transform = "none"; // Close left door
    lift.children[1].style.transform = "none"; // Close right door

    setTimeout(() => {
        if (callback) callback();
    }, 2500);
}