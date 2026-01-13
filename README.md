# Bruno Verifies 🐻

> The friendliest way to get verified on the Brown University Discord.

**Bruno Verifies** is a student-run verification service for the Brown University Discord community. It ensures that members are actual Brown students by verifying their `@brown.edu` email addresses without storing them permanently.

## How It Works

1.  **User Login**: Users sign in with Discord via OAuth2.
2.  **Email Input**: Users provide their Brown University email.
3.  **Hashing**: The email is locally hashed using SHA-256 for privacy. We only store the hash.
4.  **Verification Code**: A 6-digit code is sent to the provided Brown email.
5.  **Confirmation**: The user saves the code.
6.  **Role Assignment**: Upon valid code entry, the bot assigns the verified role in Discord.

## Features

*   **Privacy First**: Emails are hashed. We don't store plain-text emails after verification.
*   **Cute UI**: Featuring Bruno the Bear! 🐻
*   **Dual Interface**: Verify via the website or the Discord bot commands (`/verify`).

## Tech Stack

*   **Frontend**: Next.js 14, TailwindCSS, Lucide Icons.
*   **Backend**: Next.js API Routes, Supabase (PostgreSQL).
*   **Bot**: Discord.js.
*   **Email**: Resend API.

## Getting Started

1.  **Clone the repo**:
    ```bash
    git clone https://github.com/snomf/brown-verification.git
    cd brown-verification
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file with the keys listed in `.env.example`.

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## Contributing

We love contributions! If you have ideas for a cuter bear, better accessibility, or security improvements:

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Not officially affiliated with Brown University.*
