
function addSlider() {
    const image = document.getElementById("sliderImage").value;
    const title = document.getElementById("sliderTitle").value;
    const description = document.getElementById("sliderDescription").value;
    
    const sliderData = { image, title, description };
    
    // Get existing sliders from localStorage
    let sliders = JSON.parse(localStorage.getItem("sliders")) || [];
    sliders.push(sliderData);
    
    localStorage.setItem("sliders", JSON.stringify(sliders));
    
    alert("Slider added successfully!");
    document.getElementById("sliderForm").reset();
}

document.addEventListener("DOMContentLoaded", () => {
    fetchSliders();

    // Fetch all slider items from the backend
    async function fetchSliders() {
        try {
            const response = await fetch('/get-sliders');
            const sliders = await response.json();
            displaySliders(sliders);
        } catch (error) {
            console.error("Error fetching sliders:", error);
        }
    }

    // Render sliders with edit/delete buttons
    function displaySliders(sliders) {
        const sliderContainer = document.getElementById('slider-items');
        sliderContainer.innerHTML = ''; // Clear existing items

        sliders.forEach(slider => {
            const sliderDiv = document.createElement('div');
            sliderDiv.className = 'slider-item';
            sliderDiv.setAttribute('id', `slider-item-${slider.id}`);

            sliderDiv.innerHTML = `
                <img src="${slider.image}" alt="${slider.title}">
                <h3>${slider.title}</h3>
                <p>${slider.description}</p>
                <button onclick="editSlider(${slider.id})">Edit</button>
                <button class="delete-button" onclick="deleteSlider(${slider.id})">Delete</button>
            `;

            sliderContainer.appendChild(sliderDiv);
        });
    }

    // Handle slider deletion
    window.deleteSlider = async (id) => {
        if (confirm("Are you sure you want to delete this slider?")) {
            try {
                await fetch(`/delete-slider/${id}`, { method: 'DELETE' });
                document.getElementById(`slider-item-${id}`).remove();
            } catch (error) {
                console.error("Error deleting slider:", error);
            }
        }
    };

    // Placeholder function for editing a slider
    window.editSlider = (id) => {
        // Implement your edit logic here (open a form to edit slider data)
        console.log(`Editing slider with ID: ${id}`);
    };
});

// Add new slider
function addSlider() {
    const image = document.getElementById("sliderImage").value;
    const title = document.getElementById("sliderTitle").value;
    const description = document.getElementById("sliderDescription").value;

    const sliderData = { image, title, description };

    // POST the new slider to the backend
    fetch('/add-slider', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(sliderData),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Slider added successfully!");
                document.getElementById("sliderForm").reset();
                fetchSliders(); // Refresh the slider list after adding
            } else {
                alert("Failed to add slider. Please try again.");
            }
        })
        .catch(error => {
            console.error("Error adding slider:", error);
            alert("An error occurred. Please try again.");
        });
}

// Toggle nested list visibility
document.querySelectorAll('.parent-toggle').forEach(item => {
    item.addEventListener('click', event => {
        event.preventDefault(); // Prevent default anchor behavior
        const nestedList = item.nextElementSibling; // Get the nested ul
        if (nestedList) {
            nestedList.style.display =
                nestedList.style.display === 'block' ? 'none' : 'block';
        }
    });
});

// Function to delete a work item (similar pattern)
function deleteWorkItem(workItemId) {
    fetch(`/delete-work/${workItemId}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const workItemDiv = document.getElementById(`work-item-${workItemId}`);
                workItemDiv.remove();
            } else {
                alert("Failed to delete work item. Please try again.");
            }
        })
        .catch(error => {
            console.error("Error deleting work item:", error);
            alert("An error occurred. Please try again.");
        });
}

// Fetch and display work items
fetch('/api/work-items')
    .then(response => response.json())
    .then(data => {
        const workItemsContainer = document.getElementById('work-items');
        data.forEach(item => {
            const workItemDiv = document.createElement('div');
            workItemDiv.className = 'work-item';
            workItemDiv.id = `work-item-${item.id}`;

            const imageContainer = document.createElement('div');
            imageContainer.className = 'image-container';
            const image = document.createElement('img');
            image.src = `/uploads/${item.image_path}`;
            image.alt = "Work Image";
            imageContainer.appendChild(image);

            const contentContainer = document.createElement('div');
            contentContainer.className = 'content-container';
            const title = document.createElement('h2');
            title.textContent = item.title;
            const description = document.createElement('p');
            description.textContent = item.description;
            const link = document.createElement('a');
            link.href = item.website_url;
            link.target = "_blank";
            link.textContent = "Visit Website";

            const deleteButton = document.createElement('button');
            deleteButton.textContent = "Delete";
            deleteButton.className = 'delete-btn';
            deleteButton.onclick = () => deleteWorkItem(item.id);

            contentContainer.appendChild(title);
            contentContainer.appendChild(description);
            contentContainer.appendChild(link);
            contentContainer.appendChild(deleteButton);

            workItemDiv.appendChild(imageContainer);
            workItemDiv.appendChild(contentContainer);

            workItemsContainer.appendChild(workItemDiv);
        });
    })
    .catch(error => console.error('Error fetching work items:', error));

//
fetch('/api/recent-users')
    .then(response => response.json())
    .then(data => {
        const userActivitiesTable = document.getElementById('userActivities');
        data.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.password}</td>
                    <td>${user.created_at}</td>
                `;
            userActivitiesTable.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error fetching recent users:', error);
    });

// Fetch logged-in users count from MySQL
    fetch('/api/users/count')
        .then(response => response.json())
        .then(data => {
            document.getElementById('loggedInUsers').textContent = data.loggedInUsers;
        })
        .catch(error => console.error('Error fetching user count:', error));

    window.onload = function () {
        fetch('/api/user-count')
            .then(response => response.json())
            .then(data => {
                // Inject the user count into the page
                document.getElementById('user-count').textContent = data.userCount;
            })
            .catch(error => {
                console.error('Error fetching user count:', error);
            });

}

// Function to render users
function renderUsers(users) {
    const userList = document.getElementById('user-list');
    userList.innerHTML = ''; // Clear the current list

    users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.classList.add('user-item');
        userDiv.innerHTML = `
                    <p><strong>Username:</strong> ${user.username}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Role:</strong> ${user.role}</p>
                    <button class="delete-btn" onclick="deleteUser(${user.id})">Delete</button>
                `;
        userList.appendChild(userDiv);
    });
}
document.getElementById('add-user-form').addEventListener('submit', function (e) {
    e.preventDefault();

    // Collect the form data
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;
    const password = document.getElementById('password').value;
    const day = document.getElementById('day').value;

    // Send the data to the backend
    fetch('/add-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, role, password, day })
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message); // Show success or error message
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to add user');
        });
});

// Edit User (opens form with user details to edit)
function editUser(id) {
    // This is where you would add functionality to edit a user (similar to before).
}

// Delete User with confirmation
function deleteUser(id) {
    if (confirm("Are you sure you want to delete this user?")) {
        fetch(`/delete-user/${id}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("User deleted successfully.");
                    getUsers(); // Reload the user list
                } else {
                    alert("Failed to delete user.");
                }
            })
            .catch(error => {
                console.error("Error deleting user:", error);
            });
    }
}

// Add User (submit form)
document.getElementById('add-user-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;

    const newUser = {
        username,
        email,
        role
    };

    fetch('/add-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("User added successfully.");
                getUsers(); // Reload the user list
            } else {
                alert("Failed to add user.");
            }
        })
        .catch(error => {
            console.error("Error adding user:", error);
        });
});

// Function to fetch users from the server
function getUsers() {
    fetch('/get-users')
        .then(response => response.json())
        .then(data => {
            renderUsers(data.users);
        })
        .catch(error => {
            console.error("Error fetching users:", error);
        });
}

// Initial fetch to load users
getUsers();

//manage content

// Fetch all content when the page loads
document.addEventListener('DOMContentLoaded', fetchContent);

// Fetch content from the server and display in the table
function fetchContent() {
    fetch('/get-content')
        .then(response => response.json())
        .then(contents => {
            const tableBody = document.querySelector('#content-table tbody');
            tableBody.innerHTML = ''; // Clear existing content

            contents.forEach(content => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${content.id}</td>
                    <td>${content.title}</td>
                    <td>${content.body}</td>
                    <td>
                        <button class="edit-btn" data-id="${content.id}">Edit</button>
                        <button class="delete-btn" data-id="${content.id}">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Add event listeners to the edit and delete buttons
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const contentId = e.target.getAttribute('data-id');
                    deleteContent(contentId);
                });
            });

            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const contentId = e.target.getAttribute('data-id');
                    editContent(contentId);
                });
            });
        });
}

// Function to add content
document.querySelector('#content-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const title = document.querySelector('#title').value;
    const body = document.querySelector('#body').value;

    fetch('/add-content', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, body })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Content added successfully!');
                fetchContent(); // Refresh the content list
            }
        })
        .catch(error => console.error('Error adding content:', error));
});

// Function to delete content
function deleteContent(contentId) {
    fetch(`/delete-content/${contentId}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Content deleted successfully!');
                fetchContent(); // Refresh the content list
            }
        })
        .catch(error => console.error('Error deleting content:', error));
}

// Function to edit content (you can implement your own edit form or inline editing)
function editContent(contentId) {
    alert('Edit feature is under construction!');
}

