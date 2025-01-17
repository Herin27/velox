document.getElementById("registerForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const username = document.getElementById("username").value;

    // Ajax request to check if the username already exists
    fetch('/check-username', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username })
    })
    .then(response => response.json())
    .then(data => {
        if (data.exists) {
            // If username exists, show error and suggest a new username
            document.getElementById("username-error").textContent = `Username "${username}" already exists! Suggested: ${username}_123`;
        } else {
            // If username doesn't exist, submit the form
            document.getElementById("registerForm").submit();
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
});
