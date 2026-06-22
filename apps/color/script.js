console.log("why are you here");

function generateRandomColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
}

function updatePalette() {
    const palette = document.querySelectorAll('.color-box');
    palette.forEach(box => {
        const newColor = generateRandomColor();
        box.style.backgroundColor = newColor;
        box.querySelector('.hex-text').innerText = newColor;
    });
}