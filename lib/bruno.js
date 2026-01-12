export const brunoMessages = {
  greetings: [
    "Hi! Please log in with Discord to verify!",
    "Roar! Log in to get verified.",
    "Bears need verification too! Log in?",
    "Welcome to the den! Log in to start.",
    "Ready to verify? Let's go!"
  ],
  loggedIn: [
    "Great, let's verify. What is your Brown email?",
    "Welcome back! Email, please?",
    "I'm ready when you are! What's your email?",
    "Let's get you set up. Email?"
  ],
  codeSent: [
    "Sent you a code! Check your inbox.",
    "Code is on the way! Don't keep me waiting.",
    "I sent it! Go check your email.",
    "Inbox check! sent you a code."
  ],
  success: [
    "You're verified! Roar!",
    "Success! Welcome to the sleuth.",
    "All done! You're official now.",
    "Verified! Go have fun in Discord."
  ],
  error: [
    "That email is not Brown... try again?",
    "Hmm, that didn't work. Try again!",
    "Oops! Check that and retry.",
    "Grr... something's wrong. Try again?"
  ]
};

export function getRandomMessage(type) {
  const messages = brunoMessages[type];
  if (!messages) return "Roar?";
  return messages[Math.floor(Math.random() * messages.length)];
}
