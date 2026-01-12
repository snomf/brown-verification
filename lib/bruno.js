export const brunoMessages = {
  greetings: [
    "Hi there! I'm Bruno. Do you have your ID?",
    "Roar! (That means 'Welcome' in Bear). ID please?",
    "Halt! Who goes there? A Brown student?",
    "Welcome to the den! Verify to enter.",
    "I check every ID personally. Show me yours!"
  ],
  loggedIn: [
    "Ah, {name}! I see you're back. Ready to verify?",
    "Welcome back, {name}! Let's get you that checkmark.",
    "{name}, is that you? Show me your Brown email!",
    "Great to see you, {name}. Do you have your @brown.edu email?"
  ],
  codeSent: [
    "I sent a pigeon to {email}! Check your inbox.",
    "Go check {email}! The secret code is there.",
    "Sent! Now bring me back the code from {email}.",
    "Inbox checking time! Look for {email}."
  ],
  success: [
    "You're verified! Have fun, {name}!",
    "Success! You're officially a Bruno-approved student.",
    "Access granted. Welcome to the family, {name}!",
    "Roar! You're in. Go enjoy the server."
  ],
  error: [
    "That email doesn't look like a Brown one...",
    "Hmm, I can't verify that. Try again?",
    "Oops! Check your spelling and try again.",
    "Grr... something went wrong. One more try?"
  ]
};

export function getRandomMessage(type, params = {}) {
  const messages = brunoMessages[type];
  if (!messages) return "Roar?";

  const rawMessage = messages[Math.floor(Math.random() * messages.length)];

  // Replace placeholders
  let finalMessage = rawMessage;
  Object.keys(params).forEach(key => {
    finalMessage = finalMessage.replace(`{${key}}`, params[key]);
  });

  return finalMessage;
}
