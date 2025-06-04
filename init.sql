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

-- EVENT table, EventID is int, with autoincrement, can change later
-- StratDate is a Datetime, so it gives day and time of the event. If we make a prgoram, then it ust include endDate
-- & Schedule to make it recurring.
CREATE TABLE EVENT (
    EventID INT PRIMARY KEY AUTO_INCREMENT,
    StartDate DATETIME NOT NULL,
    LocationID INT,
    FOREIGN KEY (LocationID) REFERENCES LOCATION(LocationID) ON DELETE SET NULL
);

-- PROGRAM subclass of EVENT
-- Schedule is text format right now, but maybe could be changed to make schedule a table itself.
-- schedule should include something like: (Tuesday, Friday, Saturday) list of days and starttime and endtime is same
-- as in the fields. Only caveat is start/end time is same for all days which may not be the case
CREATE TABLE PROGRAM (
    EventID INT PRIMARY KEY,
    EndDate DATETIME,
    Schedule TEXT,
    FOREIGN KEY (EventID) REFERENCES EVENT(EventID) ON DELETE CASCADE
);

-- CONTRIBUTION table
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

