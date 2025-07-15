document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const result = await postData(`${API_URL}/register`, { email, password });

  if (result.success) {
    window.location.href = 'login.html';
  } else {
    alert('Registration failed.');
  }
});

