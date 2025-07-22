import { useCallback, useEffect, useState} from "react"
import { useNavigate } from "react-router-dom"
import config from "../../config"

const API_URL = config.API_URL

function Users() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])

  //send request to get users data from endpoint
  const getUsers = useCallback(async() => {
    try {
      const response = await fetch(API_URL + '/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // need this so the server knows who to look for, if a user is logged in, it will send the uid along with the profile request
      })

      const data = await response.json()

      if (response.ok) {
        setUsers(data.users) //set User state to the data returned by the api call,m which should be the user
      } else if (response === 401) {
        return <div>Unauthorized</div>
      }
    } catch(err) {
      console.log(err)
    }
  }, [setUsers])

  // checking if user is logged in. We check this by checking if a valid token exists.
    const checkAuth = useCallback(async() => {
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
          // if a valid token exists (user is logged in), then we call the getUsers function we wrtoe above
          await getUsers()
        } else {
          console.log('Unauthorized', data.message)
          // otherwise, a valid token doesn't exist (user is not logged in)  and we navigate the user to the login page
          navigate('/login')
        }
      } catch(err) {
        console.log(err)
      }
    }, [navigate, getUsers]);

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
  }, [checkAuth])


  return (
    <div>
    <h1>Users</h1>
      {users && users.map(user => (
        <div key={user.UID}> 
          <div><strong>UID:</strong> {user.UID}</div>
          <div><strong>Name:</strong> {user.FIRSTNAME} {user.MIDDLENAME || ''} {user.LASTNAME}</div>
          <div><strong>DOB:</strong> {new Date(user.DOB).toLocaleDateString()}</div>
          <div><strong>Email:</strong> {user.EMAIL}</div>
          <div><strong>Phone:</strong> {user.PHONENUMBER}</div>
        </div>
      ))}
    <button onClick={logout}>Logout</button>
    </div>
  )
}

export default Users
