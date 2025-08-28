import { supabase } from './supabaseClient.js';

export async function handleAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    const authBtn = document.getElementById("auth-btn");
    const profileBtn = document.getElementById("profile-btn");
    
    if (session) {
        // User is logged in
        authBtn.textContent = 'Logout';
        authBtn.onclick = async () => {
            await supabase.auth.signOut();
            window.location.reload();
        };
        if (profileBtn) {
            profileBtn.style.display = 'block';
        }
    } else {
        // User is not logged in
        authBtn.textContent = 'Login';
        authBtn.onclick = () => {
            window.location.href = 'login.html';
        };
        if (profileBtn) {
            profileBtn.style.display = 'none';
        }
    }
}