"use-strict";
/*  Love Saroha
    lovesaroha1994@gmail.com (email address)
    https://www.lovesaroha.com (website)
    https://github.com/lovesaroha  (github)
*/

// Themes.
const themes = [
    {
        normal: "#5468e7",
        dark: "#4353b9",
        light: "#98a4f1",
        veryLight: "#eef0fd"
    }, {
        normal: "#e94c2b",
        dark: "#ba3d22",
        veryLight: "#fdedea",
        light: "#f29480"
    }
];
// Choose random color theme.
let colorTheme = themes[Math.floor(Math.random() * themes.length)];

// This function set random color theme.
function setTheme() {
    // Change css values.
    document.documentElement.style.setProperty("--primary", colorTheme.normal);
    document.documentElement.style.setProperty("--primary-light", colorTheme.light);
    document.documentElement.style.setProperty("--primary-dark", colorTheme.dark);
}

// Set random theme.
setTheme();

// Get canvas info from DOM.
var canvas;
var ctx;
let x;
let y;
let ox;
let oy;
let mouseDown = false;
let inputs = [];

let model;
// Load trained model.
tf.loadLayersModel("http://localhost:8000/digits-classification-model/model.json").then(savedModel => {
    model = savedModel;
    document.getElementById("view_id").innerHTML = document.getElementById("homePage_id").innerHTML;
    canvas = document.getElementById('myCanvas');
    ctx = canvas.getContext('2d');
    // Canvas mouse events. 
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", onMouseDown);
    draw();
}).catch(e => { console.log(e); });


//  On mouse mouse down.
function onMouseDown(e) {
    mouseDown = true;
}

// On mouse up.
function onMouseUp(e) {
    mouseDown = false;
}

// On mouse move.
function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
}


// Draw function.
function draw() {
    ctx.lineWidth = 40;
    ctx.strokeStyle = colorTheme.normal;
    if (mouseDown) {
        if (!ox || !oy) {
            ox = x;
            oy = y;
        }
        ctx.beginPath();
        ctx.lineCap = "round";
        ctx.moveTo(x, y);
        ctx.lineTo(ox, oy);
        ctx.stroke();
    }
    ox = x;
    oy = y;
    window.requestAnimationFrame(draw);
}

// This function guess based on canvas drawing.
function predict() {
    if(!x || !y) { return; }
    let image = new Image();
    image.src = canvas.toDataURL();
    image.onload = function (e) {
        // Resize image.
        inputs = [];
        var newCanvas = document.createElement("canvas").getContext("2d");
        newCanvas.drawImage(e.target, 0, 0, 28, 28);
        let scaled = newCanvas.getImageData(0, 0, 28, 28).data;
        let row = [];
        for (let i = 3; i < scaled.length; i += 4) {
            row.push([parseFloat((scaled[i]) / 255)]);
            if (row.length == 28) {
                inputs.push(row);
                row = [];
            }
        }
        // Predict on image data.
        let prediction = model.predict(tf.tensor([inputs])).dataSync();
        let index = 0;
        for (let i = 0; i < prediction.length; i++) {
            if (prediction[index] < prediction[i]) {
                index = i;
            }
        }
        document.getElementById("result_id").innerHTML = `<h3 class="m-3 text-white font-bold">Number is ${index} (${(prediction[index] * 100).toFixed(2)}%)</h3>`;
    }
}

window.addEventListener("mouseup", onMouseUp);

// This function clear canvas. 
function clearCanvas() {
    ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}