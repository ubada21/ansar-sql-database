async function handleLogin() {
  try {
    const res = await fetch('http://localhost:3000/api/profile', {
      credentials: 'include'
    });

    if (res.ok) {
      // user is already logged in, redirect
      window.location.href = '/views/profile.html'; 
    }
    // if not, stay on login page
  } catch (error) {
    console.error('Auth check failed:', error);
  }
}

async function login(email, password) {
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
      // popup alert
      alert(data.message);
      window.location.href = '/views/profile.html'
    } else {
      alert(data.message || 'Login failed.');
    }
  } catch (err) {
    console.error(err);
    alert('Network error, please try again.');
  }
}

window.addEventListener('load', handleLogin)

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  await login(email, password);
});

