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
	 body: JSON.stringify({ identity: "user-identifier-goes-here" }),
  });
  const content = await rawResponse.json();
  window.localStorage.setItem('x-auth-token', content.token);
  window.localStorage.setItem('x-auth-identity', content.identity);
  console.log('Identity:', content.identity);
  console.log('Token:', content.token);
})();



// Get an access token for the current user on page load from local storage
window.onload = async function() {
  const token = window.localStorage.getItem('x-auth-token');
  const identity = window.localStorage.getItem('x-auth-identity');

  // Initialize the Chat Client
  let chatClient = await Twilio.Chat.Client.create(token);
  if (chatClient === undefined) {
	 console.log('Chat Client is not initialized!');
	 return;
  }
  else {
  	console.log('Chat Client is initialized!');
  	chatClient.getSubscribedChannels().then(createOrJoinGeneralChannel);
  }

  // Get a general chat channel if exists or else create one
  function createOrJoinGeneralChannel() {
	 console.log('Attempting to join "general" chat channel!');
	 // Find general channel by unique name
	 chatClient.getChannelByUniqueName('general')
	 .then(function(channel) {
		generalChannel = channel;
		console.log('Found general channel:', generalChannel.friendlyName);
		setupChannel();
	 }).catch(function() {
		// If it doesn't exist, let's create it
		console.log('Creating general channel');
		chatClient.createChannel({
		  uniqueName: 'general',
		  friendlyName: 'Toy Chat Channel'
		}).then(function(channel) {
		  console.log('Created general channel:', channel.friendlyName);
		  generalChannel = channel;
		  setupChannel();
		}).catch(function(channel) {
		  console.log('Channel could not be created:', channel.friendlyName);
		});
	 });
  }

  // Set up channel after it has been found
  function setupChannel() {
	 // Join the general channel
	 generalChannel.join().then(function(channel) {
		console.log('Joined channel as ', identity);
	 });
	 // After joining the channel, set the status to active
	 generalChannel.updateAttributes({state: 'active'});

	 // Listen for new messages sent to the channel
	 generalChannel.on('messageAdded', function(message) {
		console.log(message.author, message.body);
		var $user = $('<span class="username">').text(message.author + ': ');
		var $chatWindow = $('#messages');
		var $message = $('<span class="message">').text(message.body);
		var $container = $('<div class="message-container">');
		$container.append($user).append($message);
		$chatWindow.append($container);
		$chatWindow.scrollTop($chatWindow[0].scrollHeight);
	 });
  }
  
};

$(document).ready(function(){

  // Delete the channel on the button click
  $('#chat-end').click(function(){
	 generalChannel.delete();
	 console.log('Channel Deleted!');
	});

	// Send a new message to the general channel
  var $input = $('#chat-input');
  $input.on('keydown', function(e) {

	 if (e.keyCode == 13) {
		if (generalChannel === undefined) {
		  print('The Chat Service is not configured. Please check your .env file.', false);
		  return;
		}
		generalChannel.sendMessage($input.val())
		$input.val('');
	 }
  });
})