require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const twilio = require("twilio");
const AccessToken = twilio.jwt.AccessToken;
const ChatGrant = AccessToken.ChatGrant;

/**
 *
 * TokenGenerator helper function
 *
 * Takes an identity and performs the work necessary to return an access token for the chat service sid
 * specified in your .env file
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

/**
 * Token route
 *
 * Expects a request from the client with a JSON body containing an `identity` key signifying a user identifier, e.g.
 *
 * {
 *   "identity": "ncannariato"
 * }
 */
app.post("/token", (req, res) => {
  identity = req.body.identity;
  console.log(identity);
  token = TokenGenerator(identity);

  return res.json({
    identity: identity,
    token: token.toJwt(),
  });
});

/**
 * Events route
 *
 * Will be used by chat's webhooks service to recieve events and log them out.
 *
 * Currently just logs the entire request body as a table.
 *
 * Requires ngrok to be run locally.
 */
app.post("/events", (req, res) => {
  console.table(req.body);
});

// Gather PORT from environment if available, if not, set to 3000
const PORT = process.env.PORT || 3000;
// Start the server
app.listen(PORT, () => {
  console.info(`Server is up on port: ${PORT} `);
  console.log(
    `open your browser and visit http://localhost:${PORT}/ to run the application`
  );
});
