# 📚 Libra Connect

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-lightgrey?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://www.mongodb.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple?logo=bootstrap)](https://getbootstrap.com/)

---

## 🗂 Project Overview

Libra Connect is a modern online library management system with full admin/user support.  
Built with the MERN stack (minus React), it features user authentication, book borrowing, bookmarks, admin notifications, and real-time dashboard stats.

## ✨ Features

- 🧑‍💼 Admin & User Roles
- 📚 Borrow and return books
- 🔖 Bookmark system
- 📨 OTP password reset
- 📊 Admin dashboard with charts/export
- 👤 Profile picture & password change
- 🔐 Session-secured authentication

## 🚀 Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/libra-connect.git
cd libra-connect
npm install
```

Create a `.env` file using `.env.example`, then:

```bash
npm start
```

Visit: `http://localhost:5000`

## 📁 Folder Structure

```
📦libra-connect
 ┣ 📂controllers       → Route logic (admin, auth, books, profile)
 ┣ 📂middlewares       → Auth & flash middleware
 ┣ 📂models            → Mongoose schemas
 ┣ 📂routes            → Express route handling
 ┣ 📂views/pages       → EJS frontend templates
 ┣ 📂public            → Static files (CSS, images)
 ┣ 📄server.js         → Entry point
 ┣ 📄package.json
 ┣ 📄.env.example
```

## 🌐 Live Demo

[https://libra-connect.onrender.com](https://libra-connect.onrender.com)


## 💬 Contact

Made with ❤️ by [Barun Neupane](mailto:your.bnneupane2001@gmail.com)

---

## 📜 License

MIT License (Free to use and modify)

