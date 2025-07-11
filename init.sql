DROP TABLE IF EXISTS TEACHER_COURSE, REGISTRATION, DONATION, COURSES, USER_ROLE, USERS, ROLES;

-- USERS table, UID atm is just int that auto-increments, can change later according to spec
CREATE TABLE USERS (
  UID INT PRIMARY KEY AUTO_INCREMENT,
  FirstName VARCHAR(100) NOT NULL,
  MiddleName VARCHAR(100),
  LastName VARCHAR(100) NOT NULL,
  DOB DATE,
  Email VARCHAR(100) UNIQUE,
  PhoneNumber VARCHAR(10),
  Address VARCHAR(100),
  City VARCHAR(25),
  Province VARCHAR(2),
  PostalCode VARCHAR(6)
);


-- LOOKUP TABLE, USE JUNCTOIN TABLE TO ASSIGN TO USER
-- CREATE TABLE ROLES (
  --     RoleID INT PRIMARY KEY AUTO_INCREMENT,
  --     RoleName VARCHAR(25) NOT NULL
  --     Student TINYINT(1) DEFAULT 0,
  --     Instructor TINYINT(1) DEFAULT 0,
  --     Admin TINYINT(1) DEFAULT 0,
  --     Parent TINYINT(1) DEFAULT 0,
  --     Donor TINYINT(1) DEFAULT 0,
  --     
  --     FOREIGN KEY (UID) REFERENCES USERS(UID) ON DELETE CASCADE
  -- );

CREATE TABLE ROLES (
  RoleID INT PRIMARY KEY AUTO_INCREMENT,
  RoleName VARCHAR(25) NOT NULL
);
-- COURSES table
CREATE TABLE COURSES (
  CourseID INT PRIMARY KEY AUTO_INCREMENT,
  Title VarChar(100),
  StartDate DATETIME NOT NULL,
  EndDate DATETIME NOT NULL,
  Schedule TEXT,
  Location VARCHAR(100)
);

-- DONATION table
CREATE TABLE DONATION (
  CID INT PRIMARY KEY AUTO_INCREMENT,
  Email VARCHAR(100),
  Amount DECIMAL(10,2),
  Provider VARCHAR(100)
);

-- Junction Tables

-- REGISTRATION
CREATE TABLE REGISTRATION (
  UID INT,
  CourseID INT,
  PRIMARY KEY (UID, CourseID),
  FOREIGN KEY (UID) REFERENCES USERS(UID) ON DELETE CASCADE,
  FOREIGN KEY (CourseID) REFERENCES COURSES(CourseID) ON DELETE CASCADE
);

-- TEACHES 
CREATE TABLE TEACHER_COURSE (
  UID INT,
  CourseID INT,
  PRIMARY KEY (UID, CourseID),
  FOREIGN KEY (UID) REFERENCES USERS(UID) ON DELETE CASCADE,
  FOREIGN KEY (CourseID) REFERENCES COURSES(CourseID) ON DELETE CASCADE
);

-- USER_ROLES JUNCTION TABLE
CREATE TABLE USER_ROLE (
  UID INT,
  RoleID INT,
  PRIMARY KEY (UID, RoleID),
  FOREIGN KEY (UID) REFERENCES USERS(UID) ON DELETE CASCADE,
  FOREIGN KEY (RoleID) REFERENCES ROLES(RoleID) ON DELETE CASCADE
);

CREATE TABLE COURSE_INSTRUCTORS (
  CourseID INT NOT NULL,
  UID INT NOT NULL,
  PRIMARY KEY (CourseID, UID),
  FOREIGN KEY (CourseID) REFERENCES COURSES(CourseID) ON DELETE CASCADE,
  FOREIGN KEY (UID) REFERENCES USERS(UID) ON DELETE CASCADE
);

INSERT INTO USERS (FirstName, MiddleName, LastName, DOB, Email, PhoneNumber, Address, City, Province, PostalCode)
VALUES 
('Ali', 'Ahmed', 'Khan', '1990-04-20', 'ali.khan@example.com', '6045551234', '123 Main St', 'Vancouver', 'BC', 'V5K0A1'),
('Ubada', NULL, 'Raja', '1995-09-15', 'ubada.r@example.com', '6045555678', '456 Oak Ave', 'Burnaby', 'BC', 'V5C2Z4'),
('Yusuf', 'Ibrahim', 'Ali', '2000-01-05', 'yusuf.s@example.com', '6045559876', '789 Pine Rd', 'Surrey', 'BC', 'V3T3W2'),
('Hamza', 'Omar', 'Siddiqui', '1997-07-18', 'hamza.s@example.com', '6045551122', '159 Maple St', 'Surrey', 'BC', 'V3W5N9'),
('Khalid', NULL, 'Hussein', '1992-02-25', 'khalid.h@example.com', '6045553344', '753 Birch Ave', 'Burnaby', 'BC', 'V5A3L7'),
('Imran', 'Yusuf', 'Malik', '1989-10-03', 'imran.m@example.com', '6045555566', '852 Willow Rd', 'Vancouver', 'BC', 'V5Z2M3'),
('Zaid', NULL, 'Qureshi', '2001-12-29', 'zaid.q@example.com', '6045557788', '456 Aspen Dr', 'Delta', 'BC', 'V4C4X2'),
('Adnan', 'Ibrahim', 'Farooq', '1995-04-14', 'adnan.f@example.com', '6045559900', '963 Oak Crescent', 'Richmond', 'BC', 'V6Y3G4');

INSERT INTO COURSES (Title, StartDate, EndDate, Schedule, Location)
VALUES 
('Quran Memorization Class', '2025-07-01 18:00:00', '2025-09-30 20:00:00', 'Monday, Wednesday', 'Masjid Hall'),
('Beginner Arabic Workshop', '2025-07-10 17:00:00', '2025-08-25 19:00:00', 'Tuesday, Thursday', 'Community Center Room B'),
('Summer Youth Camp', '2025-08-05 09:00:00', '2025-08-20 12:00:00', 'Monday, Tuesday, Wednesday, Thursday, Friday', 'Zoom');

INSERT INTO ROLES (RoleName) VALUES
('Admin'),
('Instructor'),
('Parent'),
('Student'),
('Donor');

INSERT INTO USER_ROLE (UID, RoleID)
VALUES
(2, 2),
(1, 4),
(3, 4),
(5, 1),
(6, 3),
(4, 5);


