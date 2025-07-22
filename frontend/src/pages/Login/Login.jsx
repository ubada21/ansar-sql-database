import { useState, useEffect, useCallback} from 'react'
import { useNavigate } from 'react-router-dom';
import './Login.css';
import config from '../../config.js';

const API_URL = config.API_URL

function Login() {

  const navigate = useNavigate()

  // formData that we will submit to the API
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })


  // see Profile.JS, basically checking if user is logged in already
  const checkAuth = useCallback(async() => {
    const response =  await fetch(API_URL + '/check-auth', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    const data = await response.json();
    console.log(data)

    // if user is logged in, then navigate to profile page
    if (response.ok) {
      navigate('/profile')
    } else {
      return
    }
  }, [navigate]);

  // see profile.js
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    
    e.preventDefault();
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
      }
    } catch (err) {
      console.log(err)
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
    <form className='login-form' onSubmit={handleSubmit}>
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
    <button type="submit" >Log-in</button>
    </form>
    <button onClick={() => navigate('/register')}>Register</button>
    </>
  )
}

export default Login
