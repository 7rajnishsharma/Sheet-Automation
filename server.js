const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const GOOGLE_API_KEY_PATH = process.env.GOOGLE_API_KEY_PATH;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Function to authenticate with Google Sheets API
async function authenticateGoogle() {
  const auth = new google.auth.GoogleAuth({
    keyFile: GOOGLE_API_KEY_PATH, // Path to the service account key file
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return auth.getClient();
}

// Route: Home Page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// Route: Form Submission
app.post('/submit', async (req, res) => {
  const { name, email, age } = req.body;

  // Validation
  if (!name || !email || !age) {
    return res.status(400).send('<h1>Error: All fields are required.</h1>');
  }

  const status = age >= 60 ? 'Senior' : 'Junior'; // Determine status based on age
  const rowData = [[name, email, age, status]]; // Data to be appended

  try {
    const auth = await authenticateGoogle();
    const sheets = google.sheets({ version: 'v4', auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID, // Spreadsheet ID from .env
      range: 'Sheet1!A2:D', // Specify the sheet and range
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: rowData,
      },
    });
    // res.send('<h1>Form submitted successfully! Thank you for your submission.<a href="/">Submit Another Response</a></h1>');
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Success</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #d4edda;
            color: #155724;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
          }
          h1 {
            font-size: 1.5rem;
            text-align: center;
            margin-bottom: 1rem;
          }
          a {
            color: #155724;
            text-decoration: none;
            font-weight: bold;
            padding: 0.5rem 1rem;
            background-color: #c3e6cb;
            border: 1px solid #b1dfbb;
            border-radius: 5px;
            transition: background-color 0.3s ease;
          }
          a:hover {
            background-color: #b1dfbb;
          }
        </style>
      </head>
      <body>
        <h1>Form submitted successfully! Thank you for your submission.</h1>
        <a href="/">Submit Another Response</a>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error('Error submitting data to Google Sheets:', error.message);
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f8d7da;
            color: #721c24;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
          }
          h1 {
            font-size: 1.5rem;
            text-align: center;
            margin-bottom: 1rem;
          }
          a {
            color: #004085;
            text-decoration: none;
            font-weight: bold;
            padding: 0.5rem 1rem;
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            border-radius: 5px;
            transition: background-color 0.3s ease;
          }
          a:hover {
            background-color: #c6e0f5;
          }
        </style>
      </head>
      <body>
        <h1>Error submitting data to Google Sheets. Please try again later.</h1>
        <a href="/">Try Again</a>
      </body>
      </html>
    `);
    
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
