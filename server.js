const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware to parse JSON data
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Endpoint to handle form submission
app.post('/submit-story', (req, res) => {
  const storyData = req.body;

  // Path to the JSON file
  const filePath = path.join(__dirname, 'stories.json');

  // Read existing data, append the new story, and save it
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') {
      return res.status(500).send('Error reading file');
    }

    const stories = data ? JSON.parse(data) : [];
    stories.push(storyData);

    fs.writeFile(filePath, JSON.stringify(stories, null, 2), (err) => {
      if (err) {
        return res.status(500).send('Error writing file');
      }
      res.status(200).send('Story submitted successfully');
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});