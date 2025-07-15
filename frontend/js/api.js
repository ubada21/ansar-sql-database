const API_URL = 'http://localhost:3000/api';

async function postData(url = '', data = {}) {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

async function getData(url = '') {
  const res = await fetch(url, {
    credentials: 'include'
  });
  return res.json();
}

