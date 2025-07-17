const API_BASE = "http://localhost:3000/api"; // adjust if needed

// LOGIN FUNCTIONALITY
document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault(); // stop the form from submitting normally

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      document.getElementById("loginMessage").innerText = "Login successful!";
    } else {
      document.getElementById("loginMessage").innerText = data.message || "Login failed.";
    }
  } catch (error) {
    console.error("Login error:", error);
    document.getElementById("loginMessage").innerText = "Server error.";
  }
});

// LOAD USERS FUNCTION (example GET request)
async function loadUsers() {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}/users`, {
      headers: {
        "Authorization": `Bearer ${token}` // Send token in header
      }
    });

    const users = await response.json();

    const userList = users.map(user => `<li>${user.name}</li>`).join('');
    document.getElementById("users").innerHTML = `<ul>${userList}</ul>`;
  } catch (error) {
    console.error("Error loading users:", error);
  }
}
async function registerTestUser() {
  const response = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      FirstName: "Test",
      MiddleName: "User",
      LastName: "Account",
      DOB: "1990-01-01",
      Email: "test@example.com",
      Password: "test123",
      Phone: "1234567890", // ✅ 
      Address: "123 Test Lane",
      City: "Testville",
      PostalCode: "A1A1A1",
      Province: "ON"
    }),
  });

  const data = await response.json();
  console.log("Register Response:", data);
  alert(data.message || "Registration complete");
}
