const express = require('express');
const multer = require('multer');
const path = require('path');
const clamav = require('clamav.js');
const mime = require('mime-types');

const app = express();
const PORT = 3000;

// Configure Multer for file uploads
const upload = multer({
  dest: 'uploads/', // Temporary storage folder
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/webp', 'image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only WEBP, JPG, PNG, and PDF are allowed.'));
    }
  },
});

// ClamAV Scan Function
const scanFileForMalware = (filePath) => {
  return new Promise((resolve, reject) => {
    const scanner = clamav.createScanner(3310, 'localhost'); // Default ClamAV daemon settings

    scanner.scanFile(filePath, (err, good) => {
      if (err) {
        reject(`Error scanning file: ${err.message}`);
      } else if (!good) {
        resolve(false); // Malware detected
      } else {
        resolve(true); // File is clean
      }
    });
  });
};

// Route for multiple file uploads
app.post('/upload', upload.array('files', 100), async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    const results = [];

    for (const file of files) {
      try {
        const isClean = await scanFileForMalware(file.path);

        if (isClean) {
          results.push({
            filename: file.originalname,
            status: 'Uploaded Successfully',
          });
        } else {
          results.push({
            filename: file.originalname,
            status: 'Malware Detected - Upload Rejected',
          });
        }

        // Delete the file after scanning to save space
        require('fs').unlinkSync(file.path);
      } catch (err) {
        results.push({
          filename: file.originalname,
          status: `Error: ${err}`,
        });
      }
    }

    res.status(200).json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  res.status(400).json({ error: err.message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`File upload service running on http://localhost:${PORT}`);
});





//+++++++++++++++++++++++++++++++++++++++



// sudo systemctl start clamav-daemon






















first_name VARCHAR(100) NOT NULL,              -- First name
last_name VARCHAR(100),                        -- Last name (optional)
phone VARCHAR(15) UNIQUE,                      -- Unique phone number

gender CHAR(1) CHECK (gender IN ('M', 'F', 'O')), -- Gender validation
blood_group CHAR(3) CHECK (blood_group IN       -- Blood group validation
    ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')
),
birthday DATE,                                 -- Date of birth
address TEXT,                                 -- Full address
chronic_disease TEXT,                         -- Chronic disease details
 