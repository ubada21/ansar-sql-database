DROP TABLE IF EXISTS TEACHES, REGISTRATION, CONTRIBUTION, PROGRAM, EVENT, LOCATION, EMPLOYEE, STUDENT, DONOR, USER;

-- USER table, UID atm is just int that auto-increments, can change later according to spec
CREATE TABLE USER (
    UID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    DOB DATE,
    Email VARCHAR(100) UNIQUE,
    PhoneNumber VARCHAR(20)
);

-- STUDENT subclass of USER
CREATE TABLE STUDENT (
    UID INT PRIMARY KEY,
    FOREIGN KEY (UID) REFERENCES USER(UID) ON DELETE CASCADE
);

-- EMPLOYEE subclass of USER
CREATE TABLE EMPLOYEE (
    UID INT PRIMARY KEY,
    PayrollInfo VARCHAR(255),
    Role VARCHAR(50),
    FOREIGN KEY (UID) REFERENCES USER(UID) ON DELETE CASCADE
);

-- DONOR subclass of USER
CREATE TABLE DONOR (
    UID INT PRIMARY KEY,
    FOREIGN KEY (UID) REFERENCES USER(UID) ON DELETE CASCADE
);

-- LOCATION table
CREATE TABLE LOCATION (
    LocationID INT PRIMARY KEY AUTO_INCREMENT,
    Address VARCHAR(255)
);

-- For one-off events, EndDate == StartDate
-- For programs, they are different. One-off events will only have one Program_schedule, recurring events can have many (multiple days in the week etc.)

CREATE TABLE EVENT (
    EventID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Type ENUM('OneTime', 'Recurring') NOT NULL,
    LocationID INT,
    FOREIGN KEY (LocationID) REFERENCES LOCATION(LocationID) ON DELETE SET NULL
);


-- PROGRAM_SCHEDULE TABLE
-- one to many relationship, an event can have multiple programs_chedules, comes in handy when we have recurring programs.
CREATE TABLE PROGRAM_SCHEDULE (
    ScheduleID INT PRIMARY KEY AUTO_INCREMENT,
    ProgramID INT NOT NULL,
    DayOfWeek ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    FOREIGN KEY (ProgramID) REFERENCES PROGRAM(EventID) ON DELETE CASCADE
);


-- CONTRIBUTION table
-- Maybe make a seperate PROVIDER table that has the provider and payment data for that transaction
CREATE TABLE CONTRIBUTION (
    CID INT PRIMARY KEY AUTO_INCREMENT,
    UID INT,
    Amount DECIMAL(10,2),
    Type ENUM('Loan', 'Donation'),
    Provider VARCHAR(100),
    FOREIGN KEY (UID) REFERENCES DONOR(UID) ON DELETE SET NULL
);

-- Junction Tables

-- REGISTRATION
CREATE TABLE REGISTRATION (
    UID INT,
    EventID INT,
    PRIMARY KEY (UID, EventID),
    FOREIGN KEY (UID) REFERENCES STUDENT(UID) ON DELETE CASCADE,
    FOREIGN KEY (EventID) REFERENCES EVENT(EventID) ON DELETE CASCADE
);

-- TEACHES 
CREATE TABLE TEACHES (
    UID INT,
    EventID INT,
    PRIMARY KEY (UID, EventID),
    FOREIGN KEY (UID) REFERENCES EMPLOYEE(UID) ON DELETE CASCADE,
    FOREIGN KEY (EventID) REFERENCES EVENT(EventID) ON DELETE CASCADE
);

