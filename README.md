Here’s a detailed **`README.md`** template for your project:

---

# AutoSheet  

### Automating Form Submission with Google Sheets  

## 🚀 About the Project  

**AutoSheet** is a web application that automates the process of capturing form submissions and storing them directly into a Google Sheets document. The project integrates **Node.js** with Google Sheets API to create a seamless, efficient data handling system.  

### Key Features  
- **Dynamic Data Submission**: Submits form data to Google Sheets in real-time.  
- **Age Categorization**: Classifies users as "Senior" or "Junior" based on age.  
- **Success and Error Feedback**: Displays success or error pages based on submission status.  
- **Responsive Design**: Ensures optimal usability across devices.  

---

## ✍️ Spreadsheet AppScript Code and Implementation  

To enable integration with Google Sheets, a **Service Account** is created, and the Sheets API is enabled. Below are the steps to set up the Google Sheet:  

### 1. **Setup**  
- Create a new Google Spreadsheet.  
- Share the spreadsheet with the service account email (from `credentials.json`) and grant **Editor** permissions.  

### 2. **AppScript Code**  
(Optional, for custom actions) You can also use Google AppScript to enhance the functionality of the sheet. Here's a sample script:  

```javascript
// Function to create headers in the spreadsheet
function createHeaders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const headers = ["Name", "Email", "Age", "Status"];
  
  // Set headers in the first row
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1); // Freeze header row
}

// Function to update the "Status" column based on "Age"
function updateStatus() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();

  // Loop through rows starting from the second row (skip headers)
  for (let i = 1; i < data.length; i++) {
    const age = data[i][2]; // Age column (Index 2)
    if (age) {
      if (age >= 60) {
        sheet.getRange(i + 1, 4).setValue("Senior"); // Status column (Index 4)
      } else {
        sheet.getRange(i + 1, 4).setValue("Junior");
      }
    }
  }
}

// Trigger function to call updateStatus on edit
function onEdit(e) {
  updateStatus();
}

```
- Add this script to the **AppScript Editor** in your Google Sheet.  

---

## 💻 Node.js Code and Explanation  

The backend is built using **Node.js** to handle form submissions and integrate with Google Sheets API.  

### **Code Breakdown**  

- **Setting up Express Server**:  
  The server listens for form submissions and processes requests via routes.  

- **Google Sheets API Integration**:  
  Authentication and data submission are handled using the `googleapis` library.  

### **Main Code**:  

```javascript
const express = require('express');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const authenticateGoogle = async () => {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return auth.getClient();
};

app.post('/submit', async (req, res) => {
  const { name, email, age } = req.body;

  if (!name || !email || !age) {
    return res.status(400).redirect('/error.html');
  }

  const status = age >= 60 ? 'Senior' : 'Junior';
  const rowData = [[name, email, age, status]];

  try {
    const auth = await authenticateGoogle();
    const sheets = google.sheets({ version: 'v4', auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Sheet1!A2:D',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: rowData },
    });

    res.redirect('/success.html');
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).redirect('/error.html');
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
```

---

## 🛠️ Working of the Project  

### 1. **Form Submission**  
- Users submit their **name**, **email**, and **age** via a form.  

#### Screenshot: Form Page  
*(Insert a screenshot of your form here)*  

### 2. **Success Page**  
- After successful data submission, users are redirected to a confirmation page.  

#### Screenshot: Success Page  
*(Insert a screenshot of your success page here)*  

### 3. **Error Page**  
- If validation fails or an error occurs, users are redirected to an error page.  

#### Screenshot: Error Page  
*(Insert a screenshot of your error page here)*  

---

## 📜 Prerequisites  

1. Node.js and npm installed.  
2. Google Cloud Project with Sheets API enabled.  
3. Environment variables set in `.env` file:  

```env
PORT=3000
SPREADSHEET_ID=your-google-spreadsheet-id
GOOGLE_CREDENTIALS={"type":"service_account","project_id":...} // Paste your credentials here
```

---

## 🤝 Contributing  

Feel free to fork this repository and submit a pull request. Contributions are welcome!  

---

## 🧑‍💻 Author  

**[Your Name]**  
Connect with me on [LinkedIn](#).  

--- 

Does this structure meet your needs? Let me know if you'd like further modifications!
