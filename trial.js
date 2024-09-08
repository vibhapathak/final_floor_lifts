document.getElementById('generateButton').addEventListener('click', () => {
    const numFloors = parseInt(document.getElementById('numFloors').value, 10);
    const numLifts = parseInt(document.getElementById('numLifts').value, 10);

    if (isNaN(numFloors) || isNaN(numLifts) || numFloors < 1 || numLifts < 1) {
        alert('Please enter valid numbers for floors and lifts.');
        return;
    }

    // Update p5.js sketch with new numbers
    updateSketch(numFloors, numLifts);

    // Reset the lift index
    currentLiftIndex = 0; // Ensure that new requests will be handled by lift 1 (index 0)
});

function updateSketch(numFloors, numLifts) {
    if (window.sketch) {
        window.sketch.update(numFloors, numLifts);
    }
}
