const { google } = require('googleapis');

// required constants
const CLIENT_ID = 'replace with your client id';
const CLIENT_SECRET = 'replace with your client secret';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = 'replace with your refresh token';

// initialize OAuth2 Client
const authClient = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// set credentials
authClient.setCredentials({refresh_token: REFRESH_TOKEN});

const googleDrive = google.drive({
  version: "v3",
  auth: authClient
});

function readSheet(auth) {
  const sheets = google.sheets({
    version: 'v4',
    auth: authClient
  });
  sheets.spreadsheets.values.get({
    spreadsheetId: '1_go4ANnxoav4GVriBZYrreSbMJPuITguKw6MUDRTRXQ',
    range: 'A:B',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      rows.map((row) => {
        console.log(`${row[0]}, ${row[1]}`);
      });
    } else {
      console.log('No data found in google sheet');
    }
  });
}


function printFile() {
  try {
    googleDrive.files.list({
      pageSize: 10,
      fields: 'nextPageToken, files(id, name)',
    }, (err, res) => {
      if (err) return console.log('API error: ' + err);
      const myFiles = res.data.files;
      if (myFiles.length) {
        myFiles.map((file) => {
          console.log(`${file.name} (${file.id})`);
        });
      } else {
        console.log('No files found in drive');
      }
    });

  } catch (error) {
    console.log(error.message);
    
  }
}

printFile();

readSheet();

