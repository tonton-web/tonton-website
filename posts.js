const POSTS_TO_SHOW = 50;

export async function displayEntries(sortBy = "newest") {
    const entryList = document.getElementById("entry-list");
    if (!entryList) return;
    entryList.innerHTML = "";

    const { data: posts, error } = await supabase
        .from('posts') // Use your table name, e.g., 'posts' or 'thoughts'
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

export function displayEntry(title, text, postId) {
    // This function is fine, but we'll need to modify the delete button
    const entryList = document.getElementById("entry-list");
    if (!entryList) return;

    const entryDiv = document.createElement("div");
    entryDiv.classList.add("entry");

    const formattedText = text.replace(/\n/g, "<br>");
    entryDiv.innerHTML = `<h4>${title}</h4><p>${formattedText}</p>`;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", () => {
        deleteEntry(postId);
    });

    entryDiv.appendChild(deleteBtn);
    entryList.appendChild(entryDiv);
}

export async function addEntry() {
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
        .from('posts') // Use your table name
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
        displayEntries(); // Refresh the list
    }
}

export async function deleteEntry(postId) {
    if (confirm("Are you sure you want to delete this thought?")) {
        const { error } = await supabase
            .from('posts') // Use your table name
            .delete()
            .eq('id', postId); // Match the post by its ID
        
        if (error) {
            console.error("Error deleting entry:", error);
            alert("Failed to delete thought. Please try again.");
        } else {
            displayEntries(); // Refresh the list
        }
    }
}

// New function to display a user's posts on the profile page
export async function displayUserPosts() {
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
        .eq('user_id', user.id) // Filter posts by the logged-in user's ID
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching user posts:", error);
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
