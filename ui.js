// Paste all of your UI logic here
let isDragging = false;
let isResizing = false;
let offsetX, offsetY;
let initialWidth, initialHeight;
let initialX, initialY;
const MIN_WIDTH = 300;
const MIN_HEIGHT = 300;

export function setupUIListeners() {
    const dragHandle = document.querySelector("#upload-header");
    const resizeHandle = document.querySelector(".resize-handle");
    const closeBtn = document.querySelector(".close-btn");
    const uploadSection = document.getElementById("upload-section");

    if (dragHandle && uploadSection) {
        dragHandle.addEventListener("mousedown", (e) => {
            e.preventDefault();
            isDragging = true;
            offsetX = e.clientX - uploadSection.offsetLeft;
            offsetY = e.clientY - uploadSection.offsetTop;
            uploadSection.style.cursor = "grabbing";
        });
    }

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            uploadSection.style.left = (e.clientX - offsetX) + "px";
            uploadSection.style.top = (e.clientY - offsetY) + "px";
        }
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        if (uploadSection) {
            uploadSection.style.cursor = "default";
        }
    });

    if (resizeHandle && uploadSection) {
        resizeHandle.addEventListener("mousedown", (e) => {
            e.preventDefault();
            isResizing = true;
            e.stopPropagation();
            initialWidth = uploadSection.offsetWidth;
            initialHeight = uploadSection.offsetHeight;
            initialX = e.clientX;
            initialY = e.clientY;
        });
    }

    document.addEventListener("mousemove", (e) => {
        if (isResizing) {
            const deltaX = e.clientX - initialX;
            const deltaY = e.clientY - initialY;
            const newWidth = initialWidth + deltaX;
            const newHeight = initialHeight + deltaY;

            if (newWidth >= MIN_WIDTH) {
                uploadSection.style.width = newWidth + "px";
            }
            if (newHeight >= MIN_HEIGHT) {
                uploadSection.style.height = newHeight + "px";
            }
        }
    });

    document.addEventListener("mouseup", () => {
        isResizing = false;
    });

    if (closeBtn && uploadSection) {
        closeBtn.addEventListener("click", () => {
            uploadSection.style.display = "none";
        });
    }
}