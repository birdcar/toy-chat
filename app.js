require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
/**
 *
 * EXPRESS.JS LOGIC
 *
 */

// Instantiate Express app
const app = express();

// Add Express middleware
app.use(
  // helmet(),                  // Security
  express.json(), // JSON body parsing
  express.static("assets"), // Ensure that JS files can be requested by index.html
  morgan("dev") // Application request logging
);

/*
 * Root route
 *
 * when a request is made to the root route it returns index.html, which loads the client
 */
app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

// Gather PORT from environment if available, if not, set to 3000
const PORT = process.env.PORT || 3000;
// Start the server
app.listen(PORT, () => {
  console.info(`Server is up on port: ${PORT} `);
});
