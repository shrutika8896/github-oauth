require('dotenv').config();
const axios = require('axios');
const express = require('express');
const path = require('path');

const app = express();

app.use(express.static('static'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/static/index.html'));
});

app.get('/auth', (req, res) => {
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`,
  );
});

app.get('/oauth-callback', getUserDetails);


async function getUserDetails (req, res) {
  try {
    const body = {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_SECRET,
      code: req.query.code
    };
    const opts = { headers: { accept: 'application/json' } };
    const response = await axios
      .post('https://github.com/login/oauth/access_token', body, opts)
    const token = response.data.access_token
    let userDetails = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: 'token ' + token
      }
    })
    console.log('userDetails', userDetails.data);
    res.redirect(`/?token=${token}`);
  } catch (err) {
    res.status(500).json({ err: err.message })
  }
}
app.listen(3000);
// eslint-disable-next-line no-console
console.log('App listening on port 3000');