export const brunoMessages = {
  greetings: [
    "Hi there! I'm Bruno (hope you already knew that) the Bear. Pls log in with discord!",
    "Roar! (That means 'Welcome' in Bear). Pls log in with discord!",
    "Halt! Who goes there? A Brown student? Just log in!",
    "Welcome to the den! Verify to enter.",
    "I check every ID personally. Log in with discord!"
  ],
  loggedIn: [
    "Ah, {name}! I see you're back. Ready to verify?",
    "Hi, {name}! Let's get you that checkmark (accepted role).",
    "{name}, is that you? Show me your Brown email and let's get you that role!",
    "Great to see you, {name}. Do you have your @brown.edu email?"
  ],
  codeSent: [
    "I sent my pigeon friend to {email}! Check your inbox.",
    "Go check {email}! The secret code is there, just give it back to me pls.",
    "Sent! Now bring me back the code from {email}, pls. I will wait!",
    "Inbox checking time! Look for {email}. The code is there."
  ],
  success: [
    "You're verified! Have fun, {name} in the server!",
    "Success! You're officially a Bruno-approved student. Wait, is that what Brunonians are?",
    "Role given. Welcome to the family, Brunonian {name}!",
    "Roar! You're in. Enjoy your role!"
  ],
  error: [
    "That email doesn't look like a Brown one... Don't scam me!",
    "Hmm, I can't verify that. Try again?",
    "Oops! Check your spelling and try again.",
    "ROAR... something went wrong. One more try?"
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
