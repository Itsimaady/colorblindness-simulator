const imageUpload = document.getElementById("imageUpload");

const originalCanvas = document.getElementById("originalCanvas");
const simulatedCanvas = document.getElementById("simulatedCanvas");

const originalCtx = originalCanvas.getContext("2d");
const simulatedCtx = simulatedCanvas.getContext("2d");

const widthText = document.getElementById("imgWidth");
const heightText = document.getElementById("imgHeight");
const sizeText = document.getElementById("imgSize");

const downloadBtn = document.getElementById("downloadBtn");

let uploadedImage = null;
let currentFilter = "normal";

imageUpload.addEventListener("change", handleImageUpload);

function handleImageUpload(e) {

    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(event) {

        const img = new Image();

        img.onload = function() {

            uploadedImage = img;

            setupCanvas(img);

            drawOriginal();

            applyFilter(currentFilter);

            updateStats(img, file);

        };

        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
}

function setupCanvas(img) {

    originalCanvas.width = img.width;
    originalCanvas.height = img.height;

    simulatedCanvas.width = img.width;
    simulatedCanvas.height = img.height;
}

function drawOriginal() {

    if (!uploadedImage) return;

    originalCtx.clearRect(
        0,
        0,
        originalCanvas.width,
        originalCanvas.height
    );

    originalCtx.drawImage(
        uploadedImage,
        0,
        0,
        originalCanvas.width,
        originalCanvas.height
    );
}

function updateStats(img, file) {

    widthText.textContent = img.width + " px";

    heightText.textContent = img.height + " px";

    sizeText.textContent =
        (file.size / 1024 / 1024).toFixed(2) + " MB";
}

document.querySelectorAll(".filter-btn").forEach(btn => {

    btn.addEventListener("click", () => {

        document
            .querySelectorAll(".filter-btn")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        currentFilter = btn.dataset.filter;

        if (uploadedImage) {
            applyFilter(currentFilter);
        }
    });
});

function applyFilter(type) {

    if (!uploadedImage) return;

    simulatedCtx.clearRect(
        0,
        0,
        simulatedCanvas.width,
        simulatedCanvas.height
    );

    simulatedCtx.drawImage(
        uploadedImage,
        0,
        0,
        simulatedCanvas.width,
        simulatedCanvas.height
    );

    if (type === "normal") return;

    const imageData = simulatedCtx.getImageData(
        0,
        0,
        simulatedCanvas.width,
        simulatedCanvas.height
    );

    const pixels = imageData.data;

    for (let i = 0; i < pixels.length; i += 4) {

        let r = pixels[i];
        let g = pixels[i + 1];
        let b = pixels[i + 2];

        let nr = r;
        let ng = g;
        let nb = b;

        switch(type) {

            case "protanopia":

                nr = (0.567 * r) + (0.433 * g);
                ng = (0.558 * r) + (0.442 * g);
                nb = (0.242 * g) + (0.758 * b);

                break;

            case "deuteranopia":

                nr = (0.625 * r) + (0.375 * g);
                ng = (0.700 * r) + (0.300 * g);
                nb = (0.300 * g) + (0.700 * b);

                break;

            case "tritanopia":

                nr = (0.950 * r) + (0.050 * g);
                ng = (0.433 * g) + (0.567 * b);
                nb = (0.475 * g) + (0.525 * b);

                break;

            case "achromatopsia":

                const gray =
                    (0.299 * r) +
                    (0.587 * g) +
                    (0.114 * b);

                nr = gray;
                ng = gray;
                nb = gray;

                break;
        }

        pixels[i] = nr;
        pixels[i + 1] = ng;
        pixels[i + 2] = nb;
    }

    simulatedCtx.putImageData(imageData, 0, 0);
}

downloadBtn.addEventListener("click", () => {

    if (!uploadedImage) {
        alert("Please upload an image first.");
        return;
    }

    const link = document.createElement("a");

    link.download =
        `simulation-${currentFilter}.png`;

    link.href =
        simulatedCanvas.toDataURL("image/png");

    link.click();
});