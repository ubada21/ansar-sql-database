import { useEffect, useState} from "react"
import { useNavigate } from "react-router-dom"
import config from '../../config.js';

const API_URL = config.API_URL

function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState({})

  //send request to get profile data from endpoint
  const getProfileData = async() => {
    try {
      const response = await fetch(API_URL + '/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // need this so the server knows who to look for, if a user is logged in, it will send the uid along with the profile request
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user) //set User state to the data returned by the api call,m which should be the user
      }
    } catch(err) {
      console.log(err)
    }
  }


  // checking if user is logged in. We check this by checking if a valid token exists.
    const checkAuth = async() => {
      try {
        const response =  await fetch(API_URL + '/check-auth', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })
        const data = await response.json();

        if (response.ok) {
          console.log('Authorized:', data.message)
          // if a valid token exists (user is logged in), then we call the getProfileData function we wrtoe above
          await getProfileData()
        } else {
          console.log('Unauthorized', data.message)
          // otherwise, a valid token doesn't exist (user is not logged in)  and we navigate the user to the login page
          navigate('/login')
        }
      } catch(err) {
        console.log(err)
      }
    }

  // logout current user by clearing the cookie
  const logout = async () => {
    try {
      const response =  await fetch(API_URL + '/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      const data = await response.json();

      if (response.ok) {
        console.log('Logged Out Successfully', data.message)
        navigate('/login')
      } else {
        console.log('Unauthorized', data.message)
        navigate('/login')
      }
    } catch (err) {
      console.log(err)
    }
  }

  // useEffect just runs at the beginning once, so we just check if user is logged in and then get data is thats the cse
  useEffect(() => {
    checkAuth()
  }, [])


  return (
    <>
    <div>
    {Object.entries(user).map(([key, value]) => (
      <div key={key}>
      <strong>{key}:</strong> {value === null ? 'N/A' : value.toString()}
      </div>
    ))}
    </div>

    <button onClick={logout}>Log Out</button>
    <button onClick={() => navigate('/users')}>All Users</button>
    </>
  )
}

export default Profile
