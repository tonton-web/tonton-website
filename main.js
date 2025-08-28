// --- CRITICAL: Replace with your Supabase URL and anon key ---
const supabaseUrl = 'https://vambodsgqcdfjjveqqiq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhbWJvZHNncWNkZmpqdmVxcWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNDc1MDEsImV4cCI6MjA3MTkyMzUwMX0.9jsF-L74ntI1FZVyLuy4hXMn4stz6X2dwRrogYX9Hwk';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
// -------------------------------------------------------------

// This function handles all UI updates for authentication
async function updateAuthUI() {
    const { data: { session } } = await supabase.auth.getSession();
    const authBtn = document.getElementById("auth-btn");
    const profileBtn = document.getElementById("profile-btn");
    
    if (authBtn) {
        if (session) {
            authBtn.textContent = 'Logout';
            authBtn.onclick = async () => {
                await supabase.auth.signOut();
            };
            if (profileBtn) {
                profileBtn.style.display = 'block';
            }
        } else {
            authBtn.textContent = 'Login';
            authBtn.onclick = () => {
                window.location.href = 'login.html';
            };
            if (profileBtn) {
                profileBtn.style.display = 'none';
            }
        }
    }
}

let isDragging = false;
let isResizing = false;
let offsetX, offsetY;
let initialWidth, initialHeight;
let initialX, initialY;
let currentSortBy = "newest";

const MIN_WIDTH = 300;
const MIN_HEIGHT = 300;
const POSTS_TO_SHOW = 50;

async function displayEntries(sortBy = "newest") {
    const entryList = document.getElementById("entry-list");
    if (!entryList) return;
    entryList.innerHTML = "";

    const { data: posts, error } = await supabase
        .from('posts')
        .select(`
            id,
            title,
            content,
            created_at,
            user_id
        `)
        .order('created_at', { ascending: sortBy === "oldest" })
        .limit(POSTS_TO_SHOW);
    
    if (error) {
        console.error("Error fetching posts:", error);
        return;
    }

    if (posts && posts.length > 0) {
        posts.forEach(post => {
            displayEntry(post.title, post.content, post.id);
        });
    } else {
        entryList.innerHTML = "<p>No posts found yet. Start sharing your thoughts!</p>";
    }
}

function displayEntry(title, text, postId) {
    const entryList = document.getElementById("entry-list");
    if (!entryList) return;

    const entryDiv = document.createElement("div");
    entryDiv.classList.add("entry");

    const maxLength = 200;
    const isLongPost = text.length > maxLength;

    const postContent = document.createElement("p");
    postContent.classList.add("post-content");

    const truncatedText = text.substring(0, maxLength) + '...';
    
    postContent.innerHTML = isLongPost ? truncatedText : text;

    const readMoreBtn = document.createElement("button");
    readMoreBtn.textContent = "Read More";
    readMoreBtn.classList.add("read-more-btn");
    readMoreBtn.style.display = isLongPost ? 'block' : 'none';

    const collapseBtn = document.createElement("button");
    collapseBtn.textContent = "Collapse";
    collapseBtn.classList.add("collapse-btn");
    collapseBtn.style.display = 'none';

    readMoreBtn.addEventListener('click', () => {
        postContent.innerHTML = text;
        entryDiv.classList.add('expanded');
        readMoreBtn.style.display = 'none';
        collapseBtn.style.display = 'block';
    });
    
    collapseBtn.addEventListener('click', () => {
        postContent.innerHTML = truncatedText;
        entryDiv.classList.remove('expanded');
        readMoreBtn.style.display = 'block';
        collapseBtn.style.display = 'none';
    });

    entryDiv.innerHTML = `<h4>${title}</h4>`;
    entryDiv.appendChild(postContent);
    entryDiv.appendChild(readMoreBtn);
    entryDiv.appendChild(collapseBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", () => {
        deleteEntry(postId);
    });
    entryDiv.appendChild(deleteBtn);

    entryList.appendChild(entryDiv);
}

async function addEntry() {
    const titleInput = document.getElementById("entry-title");
    const textInput = document.getElementById("entry-text");
    
    const entryTitle = titleInput.value.trim();
    const entryText = textInput.innerHTML.trim();
    
    if (!entryTitle || !entryText) {
        alert("Please enter both a title and content.");
        return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert("You must be logged in to add a thought.");
        window.location.href = 'login.html';
        return;
    }

    const { error } = await supabase
        .from('posts')
        .insert({
            title: entryTitle,
            content: entryText,
            user_id: user.id
        });

    if (error) {
        console.error("Error adding entry:", error);
        alert("Failed to add thought. Please try again.");
    } else {
        titleInput.value = "";
        textInput.innerHTML = "";
        document.getElementById("upload-section").style.display = "none";
        displayEntries();
    }
}

async function deleteEntry(postId) {
    if (confirm("Are you sure you want to delete this thought?")) {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId);
        
        if (error) {
            console.error("Error deleting entry:", error);
            alert("Failed to delete thought. Please try again.");
        } else {
            displayEntries();
        }
    }
}

async function displayUserPosts() {
    const postsContainer = document.getElementById("user-posts-container");
    if (!postsContainer) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        postsContainer.innerHTML = "<p>You must be logged in to see your posts.</p>";
        return;
    }

    const { data: userPosts, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.serror("Error fetching user posts:", error);
        return;
    }

    postsContainer.innerHTML = "";
    if (userPosts && userPosts.length > 0) {
        userPosts.forEach(post => {
            const postDiv = document.createElement("div");
            postDiv.classList.add("entry");
            postDiv.innerHTML = `<h4>${post.title}</h4><p>${post.content}</p>`;
            postsContainer.appendChild(postDiv);
        });
    } else {
        postsContainer.innerHTML = "<p>No posts found yet. Start sharing your thoughts!</p>";
    }
}

function setupUIListeners() {
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

document.addEventListener("DOMContentLoaded", () => {
    // Call the function to set the initial UI state on page load
    updateAuthUI();

    // Listen for any future auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
        updateAuthUI();
    });

    const sortBtn = document.getElementById("sort-btn");
    const sortDropdown = document.getElementById("sort-dropdown");
    const sortOptions = document.querySelectorAll(".sort-option");
    const addThoughtBtn = document.getElementById("add-thought-btn");
    const uploadSection = document.getElementById("upload-section");
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    
    setupUIListeners();

    const categoryElements = document.querySelectorAll('[data-category]');
    categoryElements.forEach(element => {
        element.addEventListener('click', () => {
            const categoryName = element.getAttribute('data-category');
            openCategory(categoryName);
        });
    });
    
    function openCategory(name) {
        window.location.href = `categorypage.html?name=${encodeURIComponent(name)}`;
    }

    const params = new URLSearchParams(window.location.search);
    const categoryName = params.get("name");
    
    if (categoryName) {
        const title = document.getElementById("category-title");
        title.textContent = categoryName;
        document.getElementById("category-content").innerHTML = `<p>Welcome to the ${categoryName} category. Here you can explore and share amazing ideas.</p>`;
        
        displayEntries(currentSortBy);
        
        if (addThoughtBtn) {
            addThoughtBtn.addEventListener("click", async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    if (uploadSection) {
                        uploadSection.style.display = "flex";
                    }
                } else {
                    alert("You must be logged in to add a thought.");
                    window.location.href = 'login.html';
                }
            });
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('login-email');
            const passwordInput = document.getElementById('login-password');
            
            if (emailInput && passwordInput) {
                const email = emailInput.value;
                const password = passwordInput.value;
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                
                if (error) {
                    alert(`Login failed: ${error.message}`);
                } else {
                    alert("Login successful! Redirecting to homepage.");
                    window.location.href = 'index.html';
                }
            } else {
                console.error("Login form elements not found.");
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const { error } = await supabase.auth.signUp({ 
                email, 
                password,
                options: {
                    emailRedirectTo: 'https://tonton-web.github.io/index.html'
                } 
            });
            
            if (error) {
                alert(`Registration failed: ${error.message}`);
            } else {
                alert("Registration successful! Please check your email to confirm your account.");
                window.location.href = 'login.html';
            }
        });
    }

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('forgot-email').value;
            const { error } = await supabase.auth.resetPasswordForEmail(email);

            if (error) {
                alert(`Password reset failed: ${error.message}`);
            } else {
                alert("If an account exists, a reset link has been sent to your email.");
            }
        });
    }

    if (window.location.pathname.endsWith('profile.html')) {
        displayUserPosts();
    }

    if (sortBtn && sortDropdown && sortOptions) {
        sortBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sortDropdown.style.display = (sortDropdown.style.display === 'block') ? 'none' : 'block';
        });

        sortOptions.forEach(option => {
            option.addEventListener('click', () => {
                currentSortBy = option.getAttribute('data-sort');
                displayEntries(currentSortBy);
                sortDropdown.style.display = 'none';
            });
        });

        window.addEventListener('click', (e) => {
            if (!sortBtn.contains(e.target) && !sortDropdown.contains(e.target)) {
                sortDropdown.style.display = 'none';
            }
        });
    }
});
