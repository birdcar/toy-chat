/**
 * This is just an example IIFE to show how a token can be requested by the browser using the Fetch API
 *
 * You'll likely need to store the returned JWT token in localStorage so you can instantiate a chat client.
 *
 * Alternatively you can just instantiate the client etc. from the returned data and keep everything stateless
 */
(async () => {
  const rawResponse = await fetch("/token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ identity: "birdcar" }),
  });
  const content = await rawResponse.json();

  console.log(content);
})();
