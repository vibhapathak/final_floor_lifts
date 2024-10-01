const floorInput = document.getElementById("floor-input");
const LiftInput = document.getElementById("lift-input");
const submitButton = document.getElementById("submit-btn");
const container = document.getElementById("container");
const liftContainer = document.createElement("div");

let floorVal = "";
let liftVal = "";
var prevFloor = 0;

let targetFloors = [];

submitButton.addEventListener("click", () => {
    container.innerHTML = " ";
    liftContainer.innerHTML = "";
    
    const numFloors = parseInt(floorInput.value, 10);
    const numLifts = parseInt(LiftInput.value, 10);

    for (let i = numFloors; i > 0; i--) {
        // Create floors
        createFloors(i, numLifts);
    }

    // Empty input box
    LiftInput.value = "";
    floorInput.value = "";
});

// Make Floors
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

    UpButton.setAttribute("id", floors);
    DownButton.setAttribute("id", floors);

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
            let Lifts = document.createElement("div");
            Lifts.setAttribute("class", "lift-div");
            Lifts.setAttribute("onfloor", 1); // Ensure lifts start on floor 1
            Lifts.dataset.currentLocation = prevFloor;

            let leftDoor = document.createElement("div");
            let rightDoor = document.createElement("div");

            leftDoor.setAttribute("class", "left-door");
            rightDoor.setAttribute("class", "right-door");

            Lifts.appendChild(leftDoor);
            Lifts.appendChild(rightDoor);

            liftContainer.appendChild(Lifts);
        }
        
        liftContainer.setAttribute("class", "lift");
        floorContainer.append(liftContainer); // Append the lift container to the floor container
    }
}



let x = 0;

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("up-down")) {
    if (e.target.dataset.floor === x) {
      return;
    } else {
      LiftStatus(e.target.dataset.floor);
    }

    x = e.target.dataset.floor;
  }
});

function LiftStatus(clickedFloor) {
    const lifts = document.querySelectorAll(".lift-div");
    let liftOnFloor = false; // Flag to check if a lift is already on the clicked floor

    // Check if any lift is currently on the clicked floor
    for (let i = 0; i < lifts.length; i++) {
        if (parseInt(lifts[i].getAttribute("onfloor")) === parseInt(clickedFloor)) {
            liftOnFloor = true; // A lift is already there
            openLiftDoors(lifts[i]); // Open doors of the lift present
            break;
        }
    }

    // If a lift is on the clicked floor, disable the buttons
    if (liftOnFloor) {
        alert(`Lift already on Floor ${clickedFloor}. Please choose a different floor.`);
        
        // Disable buttons
        const buttons = document.querySelectorAll(`button[id="${clickedFloor}"]`);
        buttons.forEach(button => {
            button.classList.add("disabled");
        });

        return; // Exit if a lift is already there
    }

    for (let i = 0; i < lifts.length; i++) {
        if (lifts[i].classList.contains("busy")) {
            let onFloorVal = parseInt(lifts[i].getAttribute("onfloor"));

            if (onFloorVal === clickedFloor) {
                return; // Lift is already busy on the clicked floor
            }
        } else {
            MoveLift(clickedFloor, i);
            return; // Lift is available, initiate movement
        }
    }

    // If all lifts are busy, add the clicked floor to the queue
    targetFloors.push(clickedFloor);
}

// Function to open the lift doors
function openLiftDoors(lift) {
    const leftDoor = lift.children[0];
    const rightDoor = lift.children[1];

    leftDoor.style.transform = "translateX(-100%)"; // Open left door
    rightDoor.style.transform = "translateX(100%)"; // Open right door

    // Close doors after a delay
    setTimeout(() => {
        leftDoor.style.transform = "none"; // Close left door
        rightDoor.style.transform = "none"; // Close right door

        // Re-enable buttons for the clicked floor
        const floor = lift.getAttribute("onfloor");
        const buttons = document.querySelectorAll(`button[id="${floor}"]`);
        buttons.forEach(button => {
            button.classList.remove("disabled");
        });
    }, 3000); // Adjust the time as needed for door open duration
}


  function MoveLift(clickedFloor, pos) {
    const elevators = document.getElementsByClassName("lift-div");
    const elevator = elevators[pos];
    let currentFloor = elevator.getAttribute("onfloor");
    let duration = Math.abs(parseInt(clickedFloor) - parseInt(currentFloor)) * 2;

    elevator.setAttribute("onfloor", clickedFloor);
    elevator.style.transition = `transform ${duration}s linear`;
    elevator.style.transform = `translateY(-${100 * parseInt(clickedFloor) - 100}px)`;
    elevator.classList.add("busy");

    // Open doors after the lift reaches the destination
    setTimeout(() => {
        elevator.children[0].style.transform = "translateX(-100%)"; // Open left door
        elevator.children[1].style.transform = "translateX(100%)"; // Open right door
    }, duration * 1000 + 1000);

    // Close doors after they are opened for a certain duration
    setTimeout(() => {
        elevator.children[0].style.transform = "none"; // Close left door
        elevator.children[1].style.transform = "none"; // Close right door
    }, duration * 1000 + 4000);

    // After the lift has moved and doors have closed, reset button states
    setTimeout(() => {
        elevator.classList.remove("busy");

        // Reset the disabled state of buttons for the current floor
        const buttons = document.querySelectorAll(`button[id="${clickedFloor}"]`);
        buttons.forEach(button => {
            button.classList.remove("disabled");
        });

        // Also check if we can enable other floors that the lift was busy on
        resetButtonStates();

        // Check if there are any floors in the queue to process
        if (targetFloors.length) {
            MoveLift(targetFloors.shift(), pos);
        }
    }, duration * 1000 + 7000);
}

function resetButtonStates() {
    const lifts = document.querySelectorAll(".lift-div");
    lifts.forEach(lift => {
        const onFloor = parseInt(lift.getAttribute("onfloor"));
        const buttons = document.querySelectorAll(`button[id="${onFloor}"]`);
        buttons.forEach(button => {
            button.classList.remove("disabled");
        });
    });
}
