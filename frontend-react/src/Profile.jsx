import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3000/api/profile', {
      credentials: 'include',
    })
      .then(res => {
        return res.json();
      })
      .then(data => {
        setUser(data.user); // assuming your backend returns { user: { ... } }
      })
      .catch(err => {
        console.log(err)
        setUser(null);
      });
  }, []);

  async function handleLogout() {
    await fetch('http://localhost:3000/api/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
    navigate('/login');
  }

  if (!user) {
    return <div>Loading profile...</div>;
  }

  return (
    <>
      <div>{user.FirstName}</div>
      <div>{user.LastName}</div>
      <div>{user.Email}</div>
      <button onClick={handleLogout}>Logout</button>
    </>
  );
}

export default Profile;
