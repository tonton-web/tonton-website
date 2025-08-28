let isDragging = false;
let isResizing = false;
let offsetX, offsetY;
let initialWidth, initialHeight;
let initialX, initialY;
let currentSortBy = "newest";

const MIN_WIDTH = 300;
const MIN_HEIGHT = 300;
const POSTS_TO_SHOW = 50;

function openCategory(name) {
    window.location.href = `categorypage.html?name=${encodeURIComponent(name)}`;
}

function displayEntries(categoryName, sortBy = "newest") {
    const entryList = document.getElementById("entry-list");
    if (!entryList) return;
    entryList.innerHTML = "";

    const savedEntries = JSON.parse(localStorage.getItem(categoryName)) || [];
    
    let sortedEntries = savedEntries;

    if (sortBy === "newest") {
        // Newest posts are at the end of the array, so we reverse it to put newest at the top.
        sortedEntries = savedEntries.slice().reverse();
    } else { // sortBy === "oldest"
        // The oldest posts are already at the beginning of the array.
        sortedEntries = savedEntries.slice();
    }
    
    // Limit to the last 50 posts to avoid performance issues
    sortedEntries = sortedEntries.slice(0, POSTS_TO_SHOW);
    
    sortedEntries.forEach(entry => {
        // We now append the posts in order instead of prepending
        displayEntry(entry.title, entry.text, true);
    });
}

function handleAuth() {
    const authBtn = document.getElementById("auth-btn");
    const profileBtn = document.getElementById("profile-btn");
    
    if (!authBtn) return;
    
    // Check if the profile button exists on this page before trying to access it
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (isLoggedIn) {
        authBtn.textContent = 'Logout';
        authBtn.onclick = () => {
            localStorage.setItem('isLoggedIn', 'false');
            window.location.reload(); 
        };
        // Show the profile button when logged in
        if (profileBtn) {
            profileBtn.style.display = 'block'; 
        }
    } else {
        authBtn.textContent = 'Login';
        authBtn.onclick = () => {
            window.location.href = 'login.html';
        };
        // Hide the profile button when logged out
        if (profileBtn) {
            profileBtn.style.display = 'none';
        }
    }
}

// Function to display an entry (moved from a different place for clarity)
function displayEntry(title, text, append = false) {
    const entryList = document.getElementById("entry-list");
    if (!entryList) return; 

    const entryDiv = document.createElement("div");
    entryDiv.classList.add("entry");

    const formattedText = text.replace(/\n/g, "<br>");
    entryDiv.innerHTML = `<h4>${title}</h4><p>${formattedText}</p>`;

    const readMoreBtn = document.createElement("button");
    readMoreBtn.textContent = "Read More";
    readMoreBtn.classList.add("read-more-btn");
    readMoreBtn.addEventListener("click", () => {
        entryDiv.classList.add("expanded");
    });

    const collapseBtn = document.createElement("button");
    collapseBtn.textContent = "Collapse";
    collapseBtn.classList.add("collapse-btn");
    collapseBtn.addEventListener("click", () => {
        entryDiv.classList.remove("expanded");
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", () => {
        const params = new URLSearchParams(window.location.search);
        const categoryName = params.get("name");
        deleteEntry(categoryName, title, text);
    });

    entryDiv.appendChild(readMoreBtn);
    entryDiv.appendChild(collapseBtn);
    entryDiv.appendChild(deleteBtn);

    // Use a conditional check to decide whether to prepend or append
    if (append) {
        entryList.appendChild(entryDiv);
    } else {
        entryList.prepend(entryDiv);
    }
}

// New function to display a user's posts on the profile page
function displayUserPosts() {
    const postsContainer = document.getElementById("user-posts-container");
    if (!postsContainer) return;

    const userPosts = [
        { title: "My First Fictionalized Thought", text: "This is a placeholder post that would be stored and retrieved from a database. " },
        { title: "Another thought of mine", text: "Here is a second example post to show how the layout would look on your new profile page. " }
    ];

    postsContainer.innerHTML = "";
    if (userPosts.length > 0) {
        userPosts.forEach(post => {
            const postDiv = document.createElement("div");
            postDiv.classList.add("entry");
            postDiv.innerHTML = `<h4>${post.title}</h4><p>${post.text}</p>`;
            postsContainer.appendChild(postDiv);
        });
    } else {
        postsContainer.innerHTML = "<p>No posts found yet. Start sharing your thoughts!</p>";
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const authBtn = document.getElementById("auth-btn");
    if (authBtn) {
        handleAuth();
    }

    const params = new URLSearchParams(window.location.search);
    const categoryName = params.get("name");
    
    if (categoryName) {
        const title = document.getElementById("category-title");
        const content = document.getElementById("category-content");
        const entryList = document.getElementById("entry-list");
        const uploadSection = document.getElementById("upload-section");
        const addThoughtBtn = document.getElementById("add-thought-btn");
        const textInput = document.getElementById("entry-text");
        const dragHandle = document.querySelector("#upload-header");
        const resizeHandle = document.querySelector(".resize-handle");
        const closeBtn = document.querySelector(".close-btn");
        const sortBtn = document.getElementById("sort-btn");
        const sortDropdown = document.getElementById("sort-dropdown");
        const sortOptions = document.querySelectorAll(".sort-option");

        if (uploadSection) {
            uploadSection.style.display = "none";
        }
    
        title.textContent = categoryName;
        content.innerHTML = `<p>Welcome to the ${categoryName} category. Here you can explore and share amazing ideas.</p>`;
    
        displayEntries(categoryName, currentSortBy);
    
        textInput.addEventListener("paste", (event) => {
            event.preventDefault();
            const text = event.clipboardData.getData("text/plain");
            document.execCommand("insertHTML", false, text);
        });
    
        addThoughtBtn.addEventListener("click", () => {
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            if (isLoggedIn) {
                uploadSection.style.display = "flex";
            } else {
                alert("You must be logged in to add a thought.");
                window.location.href = 'login.html';
            }
        });
    
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
    
        if (sortBtn && sortDropdown) {
            sortBtn.addEventListener("click", () => {
                sortDropdown.classList.toggle("active");
            });
            
            document.addEventListener("click", (e) => {
                if (!sortBtn.contains(e.target) && !sortDropdown.contains(e.target)) {
                    sortDropdown.classList.remove("active");
                }
            });
    
            sortOptions.forEach(option => {
                option.addEventListener("click", (e) => {
                    currentSortBy = e.target.dataset.sortBy;
                    sortBtn.textContent = `Sort By: ${e.target.textContent}`;
                    displayEntries(categoryName, currentSortBy);
                    sortDropdown.classList.remove("active");
                });
            });
        }
    }
    
    // Check if we are on the profile page
    if (window.location.pathname.endsWith('profile.html')) {
        displayUserPosts();
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log("Simulating login...");
            localStorage.setItem('isLoggedIn', 'true');
            alert("Login successful! Redirecting to homepage.");
            window.location.href = 'index.html';
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log("Simulating registration...");
            alert("Registration successful! Please login.");
            window.location.href = 'login.html';
        });
    }

    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log("Simulating password reset request...");
            alert("If an account exists, a reset link has been sent to your email.");
            window.location.href = 'login.html';
        });
    }
});

function addEntry() {
    const params = new URLSearchParams(window.location.search);
    const categoryName = params.get("name");
    const titleInput = document.getElementById("entry-title");
    const textInput = document.getElementById("entry-text");
    const uploadSection = document.getElementById("upload-section");

    const entryTitle = titleInput.value.trim();
    const entryText = textInput.innerHTML.trim();

    if (!entryTitle || !entryText) {
        alert("Please enter both a title and content.");
        return;
    }

    const newEntry = { title: entryTitle, text: entryText };
    const savedEntries = JSON.parse(localStorage.getItem(categoryName)) || [];
    savedEntries.push(newEntry);
    localStorage.setItem(categoryName, JSON.stringify(savedEntries));

    displayEntries(categoryName, currentSortBy);

    titleInput.value = "";
    textInput.innerHTML = "";
    uploadSection.style.display = "none";
}

function deleteEntry(categoryName, entryTitle, entryText) {
    if (confirm("Are you sure you want to delete this thought?")) {
        const savedEntries = JSON.parse(localStorage.getItem(categoryName)) || [];
        const updatedEntries = savedEntries.filter(entry => entry.title !== entryTitle || entry.text !== entryText);
        localStorage.setItem(categoryName, JSON.stringify(updatedEntries));
        displayEntries(categoryName, currentSortBy);
    }
}