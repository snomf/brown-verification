# Bruno Verifies 🐻

> The friendliest way to get verified on the Brown University Discord.

**Bruno Verifies** is a student-run verification service for the Brown University Discord community. It ensures that members are actual Brown students by verifying their `@brown.edu` email addresses safely and efficiently.

### 🤖 Vibe-Coding Disclaimer
*This project was made with the help of AI assistance to be simple, fast, and secure. It was built for transparency and ease-of-maintenance so anyone from anywhere could adopt it and pass it down without needing deep coding knowledge! See the Supabase settings configuration below to edit server parameters without diving into the code.*

## How It Works

1.  **User Login**: Users sign in with Discord via OAuth2.
2.  **Email Input**: Users provide their Brown University email.
3.  **Hashing**: The email is locally hashed using SHA-256 for privacy. We only store the hash.
4.  **Verification Mode**: Users can verify fast with a **Google Social Login** (@brown.edu requirement) or request a 6-digit email code.
5.  **Confirmation**: The user saves the code or approves OAuth.
6.  **Role Assignment**: The bot immediately assigns the verified class roles in Discord.

For a detailed breakdown of how students are categorized and which roles they receive, see our [Verification Flows & Sorting Logic Guide](VERIFICATION_FLOWS.md).

### 🚀 Login-less Verification Flow (Token Bypass)
To make verification as seamless as possible, we use a **One-Time Token (OTT)** system that allows users starting from Discord to bypass the website's Discord login requirement:
1.  **Bot Generation**: When a user runs `/verify` in Discord, the bot generates a secure, short-lived UUID token linked to that user's Discord ID.
2.  **Encrypted Link**: The "Sign in with Google" button contains this token: `.../verify?token=XYZ`.
3.  **Website Handoff**: The website detects the token and allows the user to proceed directly to Google Login without needing an active Discord session on the site.
4.  **Backend Verification**: Once the user authenticates with Google, the token is passed to our API. The API validates the token, retrieves the correct Discord ID, assigns the roles, and then destroys the token.
   *This ensures a 10-second verification flow even on mobile devices where users aren't logged into Discord on their browsers.*

## Features

*   **Privacy First**: Emails are hashed. We don't store plain-text emails for manual codes.
*   **Google OAuth**: Fast verification through `@brown.edu` Google accounts.
*   **Nice UI**: Featuring Bruno the Bear! 🐻
*   **Universal Configuration**: Modify Discord roles and channels straight from the Supabase database.
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

4.  **Database Configuration**:
    - Create a new project on [Supabase](https://supabase.com).
    - Go to the **SQL Editor** and run the contents of **`supabase/setup.sql`**. This creates all 4 required tables and sets up the universal configuration.
    - Go to **Authentication > Providers** and enable **Discord** and **Google**.

5.  **Environment Variables**:
    - Copy **`.env.example`** to a new file named **`.env`**.
    - Fill in all the missing values (Discord Bot Token, Supabase URL, etc).

6.  **Universal Customization**:
    Instead of editing code, open your **`server_settings`** table in Supabase to customize:
    - `bot_status_text`: Change what Bruno (or your mascot) says.
    - `admin_role_ids`: A comma-separated list of Role IDs for your admins.
    - `allowed_mod_role_ids`: A comma-separated list of Role IDs for your mods.
    - `role_2026-2030`: The graduation roles for your specific college.
    - `email_from_address`: The sender name/email for verification codes.

7.  **Run Development Server**:
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
