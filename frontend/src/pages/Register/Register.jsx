import { useEffect, useState} from "react"
import { useNavigate } from "react-router-dom"

//api url, just so in the future, only need to change this line to fix, should prob move it someweher else and imppot
const API_URL = 'http://localhost:3000/api'

function Register() {
  //sets the data that we will eventually send to the api, initially all empty fields
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    DOB: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
    city: "",
    province: "",
    postalCode: ""
  })
  // will use in the future for loading animations
  const [loading, setLoading] = useState(false)
  // error state, so easier to debug
  const [error, setError] = useState('')

  // used to navigate to other pages from this one
  const navigate = useNavigate()

  // changes the fields in the form dat when user types something in, so the data is automatically put into formData
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  //set all fields to null, empty them basically
  const resetForm = () => {
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      DOB: "",
      email: "",
      password: "",
      phoneNumber: "",
      address: "",
      city: "",
      province: "",
      postalCode: ""
    });
  };

  // function runs when user clicks the submit button
  const handleSubmit = async (e) => {

    e.preventDefault(); // prevents the page from reloading on submit
    setLoading(true); // used later to set loading animation, if we decide to do it
    setError(null); //no error initially

    try {
      // send the dat to the API endpoint
      const response = await fetch(API_URL + '/register', {
        method: 'POST', // we are using a post method
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ // this is the data, all of it is coming from formData that the user filled out
          FIRSTNAME: formData.firstName,
          MIDDLENAME: formData.middleName,
          LASTNAME: formData.lastName,
          DOB: formData.DOB,
          EMAIL: formData.email,
          PASSWORD: formData.password,
          PHONENUMBER: formData.phoneNumber,
          ADDRESS: formData.address,
          CITY: formData.city,
          PROVINCE: formData.province,
          POSTALCODE: formData.postalCode
        }),
        credentials: 'include' // important for cookie auth, then when every request is sent, cookie is also sent
      });

      const data = await response.json();

      if (response.ok) { // if the server responsds with a 200 OK code, we know it went through
        // registration is successful, redirect to login page
        console.log('Registration successful:', data.message); 
        resetForm() // set al lfields empty, so the data doesnt persist in an already submitted form
        navigate('/login') //once a user is registered, go straight to login page
      } else {
        setError(data.message || 'Registration failed'); // else registration failed, see error
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
    <div>REGISTER</div>
    <form onSubmit={handleSubmit}>     
    <label>
    First Name 
    <input name="firstName" value={formData.firstName} onChange={handleInputChange} />
    </label>
    <label>
    Middle Name 
    <input name="middleName" value={formData.middleName} type="text" onChange={handleInputChange}/>
    </label>
    <label>
    Last Name 
    <input name="lastName" value={formData.lastName} type="text" onChange={handleInputChange}/>
    </label>
    <label>
    Date of Birth 
    <input name="DOB" value={formData.DOB} type="date" onChange={handleInputChange}/>
    </label>
    <label>
    E-Mail 
    <input name="email" value={formData.email} type="text" onChange={handleInputChange}/>
    </label>
    <label>
    Password
    <input name="password" value={formData.password} type="text" onChange={handleInputChange}/>
    </label>
    <label>
    Phone Number
    <input name="phoneNumber" value={formData.phoneNumber} type="text" onChange={handleInputChange}/>
    </label>
    <label>
    Address 
    <input name="address" value={formData.address} type="text" onChange={handleInputChange}/>
    </label>
    <label>
    City 
    <input name="city" value={formData.city} type="text" onChange={handleInputChange}/>
    </label>
    <label>
    Province 
    <input name="province" value={formData.province} type="text" onChange={handleInputChange}/>
    </label>
    <label>
    Postal Code 
    <input name="postalCode" value={formData.postalCode} type="text" onChange={handleInputChange}/>
    </label>
    <button type="submit" >Submit</button>
    </form>
    </div>
  )
}

export default Register
