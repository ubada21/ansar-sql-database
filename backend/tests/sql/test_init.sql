
DROP TABLE IF EXISTS TEACHER_COURSE, REGISTRATION, DONATION, COURSES, ROLES, USERS;

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


CREATE TABLE ROLES (
    UID INT PRIMARY KEY,
    Student TINYINT(1) DEFAULT 0,
    Employee TINYINT(1) DEFAULT 0,
    Parent TINYINT(1) DEFAULT 0,
    Donor TINYINT(1) DEFAULT 0,
    
    FOREIGN KEY (UID) REFERENCES USERS(UID) ON DELETE CASCADE
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

INSERT INTO USERS (FirstName, MiddleName, LastName, DOB, Email, PhoneNumber, Address, City, Province, PostalCode)
VALUES 
('Ali', 'Ahmed', 'Khan', '1990-04-20', 'ali.khan@example.com', '6045551234', '123 Main St', 'Vancouver', 'BC', 'V5K0A1'),
('Ubada', NULL, 'Raja', '1995-09-15', 'ubada.r@example.com', '6045555678', '456 Oak Ave', 'Burnaby', 'BC', 'V5C2Z4'),
('Yusuf', 'Ibrahim', 'Ali', '2000-01-05', 'yusuf.s@example.com', '6045559876', '789 Pine Rd', 'Surrey', 'BC', 'V3T3W2'),
('Muhammad', NULL, 'Rashid', '2000-01-01', 'mrashid@example.com', '6043333333', '1234 New St', 'Surrey', 'BC', 'V6C8V5');

INSERT INTO COURSES (Title, StartDate, EndDate, Schedule, Location)
VALUES 
('Quran Memorization Class', '2025-07-01 18:00:00', '2025-09-30 20:00:00', 'Monday, Wednesday', 'Masjid Hall'),
('Beginner Arabic Workshop', '2025-07-10 17:00:00', '2025-08-25 19:00:00', 'Tuesday, Thursday', 'Community Center Room B'),
('Summer Youth Camp', '2025-08-05 09:00:00', '2025-08-20 12:00:00', 'Monday, Tuesday, Wednesday, Thursday, Friday', 'Zoom'),
("Intermediate Arabic Conversation", "2025-07-20 17:30:00", "2025-09-05 19:30:00", "Wednesday, Friday", "Community Center Room C");

