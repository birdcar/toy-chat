# Toy Chat

A basic Twilio Chat application.

## Setup

1. Duplicate the `.env.example` file and name it `.env`
2. Copy your Twilio account's Account SID and paste it into your `.env` file as the value for `TWILIO_ACCOUNT_SID`
3. Copy your Twilio account's Auth Token and paste it into your `.env` file as the value for `TWILIO_AUTH_TOKEN`
4. Create a [Programmable Chat](https://www.twilio.com/console/chat/dashboard) service in one of your Twilio accounts, SID for that Chat Service, and paste it into your `.env` file as the value for `TWILIO_CHAT_SERVICE_SID`
5. [Create a new API Key](https://www.twilio.com/console/chat/project/api-keys) for this chat service (standard key type is fine), copy the API Key and API Secret provided by Twilio, and then paste them into your `.env` file as the values for `TWILIO_API_KEY` and `TWILIO_API_SECRET`.

## Usage

After setup above is complete, run `npm run server` in your terminal and open your web browser to http://localhost:3000/.

Setup messages and important information will be output to the console.
