# 🐻 Bruno Verifies: Verification Logic & Sorting

This document explains how Bruno distinguishes between different types of students and how roles are automatically assigned in Discord.

## 1. Verification Methods (The "How")
Every verification record in the database includes a `verification_method` to track where the student came from:

| Method | Description |
| :--- | :--- |
| `website` | Student verified via the website using a 6-digit email code. |
| `command` | Student verified directly in Discord using the `/confirm` command with an email code. |
| `website_google` | Student verified on the website using Google OAuth2 (@brown.edu). |
| `command_google` | Student verified via Google OAuth2 after clicking the "Sign in with Google" button in the Discord bot. |

## 2. Verification Types (The "What")
When a student is saved to the `verifications` table, they are assigned a `type`. This is used to track their status:

*   **`accepted`**: The default type for any student.
*   **`alumni`**: Assigned if the user verifies as an alumni.
*   **`2026`, `2027`, etc.**: Assigned if the user selects a specific graduation year.

## 3. The "Sorting" Logic (Role Assignment)
When a verification is successful, Bruno checks his "Universal Configuration" in Supabase to see which roles to give. The logic follows these rules:

### A. General Roles (Everyone Gets These)
Regardless of class year or alumni status, every successfully verified user receives:
-   **`@ACCEPTED`**: The base verification role (the "Checkmark").
-   **`@CERTIFIED`**: The role for students who have verified a Brown email address.

### B. Student vs. Alumni Sorting
-   **Current Students**: Receive the **`@STUDENT`** role.
-   **Alumni**: Receive the **`@ALUMNI`** role. *Note: Alumni do NOT receive the @STUDENT role.*

### C. Class Year Sorting
If a student selects a graduation year (e.g., 2028), Bruno checks the config:
-   If a role ID exists for that specific year (e.g., `role_2028`), it is assigned.
-   **Special Case (Class of 2030)**: Currently, these users receive the `@STUDENT`, `@ACCEPTED`, and `@CERTIFIED` roles.

### Summary Table

| User Category | Roles Assigned |
| :--- | :--- |
| **Common Student** | `@ACCEPTED`, `@CERTIFIED`, `@STUDENT` |
| **Class Year Student** | `@ACCEPTED`, `@CERTIFIED`, `@STUDENT`, `@20XX` |
| **Alumni** | `@ACCEPTED`, `@CERTIFIED`, `@ALUMNI` |

---

## 🛠️ How to Customize
You can change the IDs for these roles without touching any code. 
1. Open your **Supabase Dashboard**.
2. Go to the **`server_settings`** table.
3. Edit the Snowflake IDs in the `role_accepted`, `role_student`, `role_2028`, etc., columns.
4. **Restart the Bot** to sync the new role logic!
