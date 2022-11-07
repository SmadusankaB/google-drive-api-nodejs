const {
  google
} = require('googleapis');
const url = require('url');
const express = require('express');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Required constants
const CLIENT_ID = '<replace with your client ID>';
const CLIENT_SECRET = '<replace with your client secret>';
const REDIRECT_URI = 'http://localhost:3000/auth';

// // Initialize OAuth2 Client
const authClient = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const scopes = [
  'https://www.googleapis.com/auth/drive'
];

// Generate authorizationUrl
const authorizationUrl = authClient.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent',
  include_granted_scopes: true
});

// Menu
app.get('/', (req, res) => {
  res.send("<a href='http://localhost:3000/grant'>grant</a> to grant required permissions with Google <br><a href='http://localhost:3000/files'>files</a> to print list of files in drive <br><a href='http://localhost:3000/sheet'>sheet</a> to print contents of the test sheet in drive");
});

// Redirect to authorizationUrl
app.get('/grant', async (req, res) => {
  res.redirect(authorizationUrl)
});

// Callback API once user granted permission
app.get('/auth', async (req, res) => {
  console.log(req);

  if (req.url.startsWith('/auth')) {
    let q = url.parse(req.url, true).query;
    console.log(q)
    let {
      tokens
    } = await authClient.getToken(q.code);
    console.log(tokens);
    // store refresh token in your persistance storage. Check this doc to see how to use refresh token
    // https://developers.google.com/identity/protocols/oauth2/web-server#offline
    authClient.setCredentials(tokens);
  }
  res.redirect('/')
});

// Get files from google drive
app.get('/files', async (req, res) => {

  const googleDrive = google.drive({
    version: "v3",
    auth: authClient
  });

  let myFiles = "";
  try {
    googleDrive.files.list({
      pageSize: 4,
      fields: 'nextPageToken, files(id, name)',
    }, (err, response) => {
      if (err) return res.send(`Error: ${err} <br> <a href='http://localhost:3000/'>menu</a>`);
      if (response.data.files.length) {
        response.data.files.map((file) => {
          console.log(`${file.name} (${file.id})`);
          myFiles = myFiles + `${file.name} (${file.id}) <br>`
        });
        res.send(myFiles + "<br> <a href='http://localhost:3000/'>menu</a>");
      } else {
        res.send("No data found in google sheet <br> <a href='http://localhost:3000/'>menu</a>");
      }
    });

  } catch (error) {
    res.send(`Error: ${error.message} <br> <a href='http://localhost:3000/'>menu</a>`);
  }

});

// Read spreadsheets
app.get('/sheet', async (req, res) => {

  const sheets = google.sheets({
    version: 'v4',
    auth: authClient
  });

  let sheet = "";
  try {
    sheets.spreadsheets.values.get({
      spreadsheetId: '1v0axJ5n0f1byTVO9tpAvDQmbCm6UYcZLc2viL6pnYsY',
      range: 'A:B',
    }, (err, response) => {
      if (err) return res.send(`Error: ${err} <br> <a href='http://localhost:3000/'>menu</a>`);
      const rows = response.data.values;
      if (rows.length) {
        rows.map((row) => {
          console.log(`${row[0]}, ${row[1]}`);
          sheet = sheet + `${row[0]}, ${row[1]} <br>`
        });
        res.send(sheet + "<br> <a href='http://localhost:3000/'>menu</a>");
      } else {
        res.send("No data found in google sheet <br> <a href='http://localhost:3000/'>menu</a>");
      }
    });
  } catch (error) {
    res.send(`Error: ${error.message} <br> <a href='http://localhost:3000/'>menu</a>`);
  }
});

// Listening to Server
app.listen(PORT, function (err) {
  if (err) console.log(err);
  console.log("Server listening on PORT", PORT);
});