document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Send login request to backend to check if the user exists
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Store user info in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect to dashboard page
            window.location.href = "./deshboard.html";
        } else {
            alert("Invalid username or password");
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
});
