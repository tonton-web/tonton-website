import { handleAuth } from './auth.js';
import { displayEntries, addEntry, displayUserPosts } from './posts.js';
import { setupUIListeners } from './ui.js';

let currentSortBy = "newest";

function openCategory(name) {
    window.location.href = `categorypage.html?name=${encodeURIComponent(name)}`;
}

document.addEventListener("DOMContentLoaded", () => {
    // Authentication
    handleAuth();

    // Event listeners
    const sortBtn = document.getElementById("sort-btn");
    const sortDropdown = document.getElementById("sort-dropdown");
    const sortOptions = document.querySelectorAll(".sort-option");
    const addThoughtBtn = document.getElementById("add-thought-btn");
    const uploadSection = document.getElementById("upload-section");
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    
    // UI listeners
    setupUIListeners();

    // Check if we are on the category page
    const params = new URLSearchParams(window.location.search);
    const categoryName = params.get("name");
    
    if (categoryName) {
        const title = document.getElementById("category-title");
        title.textContent = categoryName;
        document.getElementById("category-content").innerHTML = `<p>Welcome to the ${categoryName} category. Here you can explore and share amazing ideas.</p>`;
        
        displayEntries(currentSortBy);
        
        // This button now calls the new addEntry function from posts.js
        if (addThoughtBtn) {
            addThoughtBtn.addEventListener("click", () => {
                const isLoggedIn = supabase.auth.getSession() !== null;
                if (isLoggedIn) {
                    uploadSection.style.display = "flex";
                } else {
                    alert("You must be logged in to add a thought.");
                    window.location.href = 'login.html';
                }
            });
        }
    }

    // New forms handling with Supabase calls
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            
            if (error) {
                alert(`Login failed: ${error.message}`);
            } else {
                alert("Login successful! Redirecting to homepage.");
                window.location.href = 'index.html';
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const { error } = await supabase.auth.signUp({ email, password });
            
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
});

// Your other functions
function openCategory(name) {
    window.location.href = `categorypage.html?name=${encodeURIComponent(name)}`;
}