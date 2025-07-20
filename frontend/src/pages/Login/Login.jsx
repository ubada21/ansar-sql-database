import { useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';

function Login() {
  const API_URL = 'http://localhost:3000/api'

  const navigate = useNavigate()

  // formData that we will submit to the API
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // see Profile.JS, basically checking if user is logged in already
  const checkAuth = async() => {
    const response =  await fetch(API_URL + '/check-auth', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    const data = await response.json();

    // if user is logged in, then navigate to profile page
    if (response.ok) {
      navigate('/profile')
    } else {
      return
    }
  }

  // see profile.js
  useEffect(() => {
    checkAuth()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    
    e.preventDefault();
    setLoading(true);
    setError(null);

    // when submitted, this function will submit the data to the api
    try {
      const response = await fetch(API_URL + '/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
        // ^ basically just putting the formData into a format that our API is expecting
        credentials: 'include' // important for cookie auth, then when every request is sent, cookie is also sent
      });

      const data = await response.json();

      if (response.ok) {
        // login is successful, redirect to profile page
        console.log('Login successful:', data.message);
        resetForm()
        navigate('/profile')
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // clear form fields
  const resetForm = () => {
    setFormData({
      email: '',
      password: ''
    });
  };

  return (
    <>
    <div>LOGIN PAGE</div>
    <form onSubmit={handleSubmit}>
    <label>E-Mail
    <input 
    name="email"
    value={formData.email}
    onChange={handleInputChange}
    />
    </label>
    <label>Password
    <input 
    name="password"
    value={formData.password}
    type="password"
    onChange={handleInputChange}
    />
    </label>
    <button type="submit" >Submit</button>
    </form>
    <button onClick={() => navigate('/register')}>Register</button>
    </>
  )
}

export default Login
