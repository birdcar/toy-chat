require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const twilio = require("twilio");

const AccessToken = twilio.jwt.AccessToken;
const ChatGrant = AccessToken.ChatGrant;

/**
 *
 * HELPER FUNCTIONS
 *
 */

function TokenGenerator(identity) {
  const appName = "ToyChat";

  const chatGrant = new ChatGrant({
    serviceSid: process.env.TWILIO_CHAT_SERVICE_SID,
  });

  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET
  );

  token.addGrant(chatGrant);
  token.identity = identity;

  return token;
}

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
