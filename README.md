📜 Features
✔ Create Time Capsules – Users can write messages, upload media, and lock their capsule until a set date.
✔ Open Capsules by Email – Users can retrieve their capsules using their email when the unlock date arrives.
✔ Public & Private Capsules – Public capsules are visible to all; private ones require a password.
✔ Media Uploads – Supports images, audio, and video (up to 5MB).
✔ Secure Storage – Passwords are encrypted using bcrypt.
✔ Email Confirmation – Users receive a confirmation email upon capsule creation.

🏗️ Tech Stack
Frontend: React.js, Axios, React Router
Backend: Node.js, Express.js
Database: MySQL
Authentication: Bcrypt (for password hashing)
Email Service: Nodemailer

🚀 Getting Started
1️⃣ Prerequisites
Ensure you have installed:

Node.js (v16+)
MySQL (running locally or on a server)
Nodemailer SMTP credentials (for email confirmations)

2️⃣ Clone the Repository
sh
Copy
Edit
git clone https://github.com/yourusername/virtual-time-capsule.git
cd virtual-time-capsule

3️⃣ Setup MySQL Database
Create a new MySQL database and import the provided SQL schema.

sql
Copy
Edit
CREATE DATABASE time_capsule_db;
USE time_capsule_db;

CREATE TABLE capsules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    capsule_type ENUM('public', 'private') NOT NULL,
    capsule_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    unlock_date DATE NOT NULL,
    message TEXT NOT NULL,
    public_preview TEXT NULL,
    password_hash VARCHAR(255) NULL,
    media_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE access_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(64) NOT NULL UNIQUE,
    capsule_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    FOREIGN KEY (capsule_id) REFERENCES capsules(id) ON DELETE CASCADE
);

4️⃣ Backend Setup
Install dependencies
sh
Copy
Edit
cd backend
npm install
Configure environment variables
Create a .env file in the backend folder:

sh
Copy
Edit
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=time_capsule_db

EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
Start the backend
sh
Copy
Edit
npm start

5️⃣ Frontend Setup
Install dependencies
sh
Copy
Edit
cd ../frontend
npm install
Start the frontend
sh
Copy
Edit
npm start

📌 API Endpoints
Create Capsule
POST /api/capsules

json
Copy
Edit
{
  "capsuleType": "private",
  "capsuleName": "My Future Self",
  "email": "user@example.com",
  "unlockDate": "2030-01-01",
  "message": "Hello future me!",
  "password": "secure123"
}
Open Capsule
POST /api/capsules/open

json
Copy
Edit
{
  "email": "user@example.com",
  "password": "secure123"
}

🎨 UI Components
CapsuleForm.js – Form to create a capsule
CapsuleOpen.js – Allows users to open their capsule
CapsuleGallery.js – Displays public capsules

📌 Future Improvements
✅ User authentication with JWT
✅ Allow users to edit or delete their capsules
✅ Support larger file uploads via cloud storage

🏆 Contributors
Your Name – Full Stack Developer