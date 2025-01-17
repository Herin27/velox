
// Get the user details from localStorage
const user = JSON.parse(localStorage.getItem('user'));

// If the user is not logged in, redirect to the login page
if (!user) {
    window.location.href = "/login.html";
} else {
    // Display user information
    document.getElementById("username").textContent = user.username;
    document.getElementById("email").textContent = user.email;
}

// Logout function to clear localStorage and redirect to login page
function logout() {
    localStorage.removeItem('user');
    window.location.href = "/login.html";
}