// registering an event listener for load event (when everything is loaded onto the page)
// when everything is loaded, runs the async func.
const getProfile = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/profile', {
      // sends cookies with the request
      credentials: 'include'
    });

    // checks the response code, if it is ok (200-299 range)

    if (res.ok) {
      const data = await res.json();
      const user = data.user;

      // find element by id in the profile.html file
      document.getElementById('first-name').textContent = user.FirstName;
      document.getElementById('last-name').textContent = user.LastName;
      document.getElementById('email').textContent = user.Email;
    } else {

      // user is not logged in, go to login page
      window.location.href = '/views/login.html';
    }

  } catch (err) {
    console.error('Failed to fetch profile:', error);
    alert('Network error — please try again.');
  }
}

window.addEventListener('load', getProfile);


// when logout button is clicked, call logout api
document.getElementById('logout-btn').addEventListener('click', async () => {
  await fetch('http://localhost:3000/api/logout', {
    method: 'POST',
    credentials: 'include'
  });
  window.location.href = '/views/login.html';
});

