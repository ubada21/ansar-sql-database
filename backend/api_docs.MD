
# API Documentation

Base URL: `/api`

---

## Endpoints

---

## Users API

**Base URL:** `/api/users`

### Endpoints

---

### `GET /api/users`

**Description:**  
Fetch all users from the database.

**Response:**

```json
[
{
  "UID": 1,
    "FirstName": "Muhammad",
    "MiddleName": "Ahmed",
    "LastName": "Khan",
    "DOB": "1990-04-20",
    "Email": "muhammad.khan@example.com",
    "PhoneNumber": "6045551234",
    "Address": "123 Main St",
    "City": "Vancouver",
    "Province": "BC",
    "PostalCode": "V5K0A1"
},
  ...
]
```

**Status Codes:**
- `200 OK` — Successful retrieval
- `500 Internal Server Error` — Server error

---

### `POST /api/users`

**Description:**  
Create a new user.

**Request Body:**

```json
{
  "FirstName": "Muhammad",
  "MiddleName": "Ahmed",
  "LastName": "Khan",
  "DOB": "1990-04-20",
  "Email": "muhammad.khan@example.com",
  "PhoneNumber": "6045551234",
  "Address": "123 Main St",
  "City": "Vancouver",
  "Province": "BC",
  "PostalCode": "V5K0A1"
}
```

**Response:**

```json
{
  "message": "User with UID 1created successfully"
}
```

**Status Codes:**
- `201 Created` — User created successfully
- `400 Bad Request` — Missing or invalid data
- `500 Internal Server Error` — Server error

---

## Courses API

**Base URL:** `/api/courses`

### Endpoints

---

### `GET /api/courses`

**Description:**  
Fetch all courses from the database.

**Response:**

```json
[
{
  "CourseID": 2,
    "Title": "Introduction to Quranic Studies",
    "StartDate": "2025-07-10 09:00:00",
    "EndDate": "2025-08-10 11:00:00",
    "Schedule": "Tuesday, Thursday",
    "Location": "Room A"
},
  ...
]
```

**Status Codes:**
- `200 OK` — Successful retrieval
- `500 Internal Server Error` — Server error

---

### `POST /api/courses`

**Description:**  
Create a new course.

**Request Body:**

```json
{
  "Title": "Introduction to Quranic Studies",
  "StartDate": "2025-07-10 09:00:00",
  "EndDate": "2025-08-10 11:00:00",
  "Schedule": "Tuesday, Thursday",
  "Location": "Room A"
}
```

**Response:**

```json
{
  "message": "Course with CourseID 1 created successfully"
}
```

**Status Codes:**
- `201 Created` — Course created successfully
- `400 Bad Request` — Missing or invalid data
- `500 Internal Server Error` — Server error

# API Documentation

Base URL: `/api`

---

## Roles API

**Base URL:** `/api`

### Endpoints

---

### `POST /api/users/:uid/roles/`

**Description:**  
Assign a role to a specific user.

**Request Body:**

```json
{
  " UID": 2
    "RoleID": 2
}
```

**Response:**

```json
{
  "message": "Role assigned to user successfully"
}
```

**Status Codes:**
- `200 OK` — Role assigned successfully
- `400 Bad Request` — Missing or invalid data
- `404 Not Found` — User or Role not found
- `500 Internal Server Error` — Server error

---

### `GET /api/users/:uid/roles`

**Description:**  
Fetch a list of roles assigned to a specific user.

**Response:**

```json
{
  "roles": [
  {
    "RoleID": 1,
      "RoleName": "Admin"
  },
  {
    "RoleID": 2,
    "RoleName": "Student"
  }
  ]
}
```

**Status Codes:**
- `200 OK` — Successful retrieval
- `404 Not Found` — User not found
- `500 Internal Server Error` — Server error

---

### `GET /api/roles`

**Description:**  
Fetch a list of all available roles.

**Response:**

```json
{
  "roles": [
  {
    "RoleID": 1,
      "RoleName": "Admin"
  },
  {
    "RoleID": 2,
    "RoleName": "Student"
  }
  ]
}
```

**Status Codes:**
- `200 OK` — Successful retrieval
- `500 Internal Server Error` — Server error

---

### `DELETE /api/users/:uid/roles/:roleid`

**Description:**  
Remove a specific role assigned to a user.

**Response:**

```json
{
  "message": "Role removed from user successfully"
}
```

**Status Codes:**
- `200 OK` — Role removed successfully
- `404 Not Found` — User or Role not found
- `500 Internal Server Error` — Server error

---

### `GET /api/roles/:roleid`

**Description:**  
Fetch all users assigned to a specific role.

**Response:**

```json
{
  "users": [
  {
    "UID": 1,
      "FirstName": "Muhammad",
      "MiddleName": "Ahmed",
      "LastName": "Khan",
      "DOB": "1990-04-20",
      "Email": "muhammad.khan@example.com",
      "PhoneNumber": "6045551234",
      "Address": "123 Main St",
      "City": "Vancouver",
      "Province": "BC",
      "PostalCode": "V5K0A1"
  }  
  ]
}
```

**Status Codes:**
- `200 OK` — Successful retrieval
- `404 Not Found` — Role not found
- `500 Internal Server Error` — Server error



