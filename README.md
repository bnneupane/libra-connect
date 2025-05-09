# 📚 Libra Connect - Online Library Management System

Libra Connect is a full-featured online library management web app built with **Node.js**, **Express**, **MongoDB**, and **Bootstrap**.

## ✨ Features

- 📖 User authentication (register, login, password reset via email OTP)
- 🔖 Bookmark books
- 📚 Borrow and return books
- 👤 Profile management with photo upload and password change
- 📬 Admin notifications to users
- 📊 Admin dashboard with filtering and exports
- 🛡 Role-based access (admin vs user)
- 🔐 Secure session and input validation

## 📁 Folder Structure

```
controllers/        # Route logic for admin, auth, books, profile
middlewares/        # Auth and flash middlewares
models/             # MongoDB schemas
routes/             # Express route definitions
views/pages/        # EJS templates
public/             # Static files (CSS, images, JS)
```

## 🛠 Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/libra-connect.git
   cd libra-connect
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file based on the `.env.example` provided.

4. **Run the app locally:**
   ```bash
   npm start
   ```

5. **Visit in browser:**
   ```
   http://localhost:5000
   ```

## 🌐 Demo
> Add your deployed URL here (e.g., Render/Glitch/Heroku/Netlify)

---

## 👨‍💻 Tech Stack

- Node.js / Express.js
- MongoDB (with Mongoose)
- EJS templating
- Bootstrap 5
- Nodemailer (for OTP emails)
