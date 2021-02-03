require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const morgan = require("morgan");
const ngrok = require("ngrok");
const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const chatServiceSid = process.env.TWILIO_CHAT_SERVICE_SID;
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
    serviceSid: chatServiceSid,
  });

  const token = new AccessToken(
    accountSid,
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
  const identity = req.body.identity;
  const token = TokenGenerator(identity);

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
 */
app.post("/events", bodyParser.urlencoded(), (req, res) => {
  console.log(req.body);
  return res.status(201).end();
});

// Gather PORT from environment if available, if not, set to 3000
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, async () => {
  // Create an ngrok endpoint and forward it to the same port as the express server
  const url = await ngrok.connect({ addr: PORT });

  // Instantiate a Twilio client
  const client = require("twilio")(accountSid, authToken);

  // Update the ToyChat service to add the new ngrok URL &
  // specify which events we want to subscribe to.
  await client.chat.services(chatServiceSid).update({
    preWebhookUrl: `${url}/events`,
    postWebhookUrl: `${url}/events`,
    webhookMethod: "POST",
    webhookFilters: [
      "onChannelAdded",
      "onChannelUpdated",
      "onChannelDestroyed",
      "onMemberAdd",
      "onMemberAdded",
      "onMemberUpdate",
      "onMemberUpdated",
      "onMemberRemove",
      "onMemberRemoved",
      "onMessageSent",
    ],
  });

  console.log(
    `open your browser and visit http://localhost:${PORT}/ to run the application locally\n`
  );

  console.log(`Webhooks will be sent to ${url}/events`);
});

module.exports = app;
