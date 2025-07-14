                                                                            
                                                                              
## Overview
A very simple example portal using Flask


## Setup
1. Install Python 3.10.0
2. Create a virtual environment: 
```console
python -m venv venv
```
3. Activate the virtual environment: venv\Scripts\activate (Windows) or source venv/bin/activate (Linux)
4. Update pip: 
```console
python -m pip install --upgrade pip
```
5. Install the requirements
```console
python -m pip install -r requirements.txt
```
6. Install node.js (version 18) at https://nodejs.org/en/download/
 Or windows using chocolatey 
```choco install nodejs```
or linux using apt
```sudo apt install nodejs```
or mac using brew
```brew install node```
7. Install npm (**Ensure you install in the Static Directory**)
```console 
cd application/static
```
``` console
npm install
```
8. Make sure you have sqlite DB in the root directory
9. Make sure you have a .env file in the application directory

    
SECRET_KEY=MY_SUPER_SECRET_KEY

FLASK_APP=wsgi.py

ENV=development


10. Run the application: 
```console
python wsgi.py
```
11. Username and Password (rehan@al-ansaar.ca, 123456789)

## Dependencies
- Python 3.10.0
- ODBD Driver 17 https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server?view=sql-server-ver16
- virtualenv


## Code Format
- black

To format the code, run this command in the terminal within your virtual enviornment

```console
pip install black
```
or is you aleady have black installed

```console
pip install update black
```

```console
black \application\
```
