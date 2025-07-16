# Hack4Health - SanjeevniAI

**SanjeevniAI** is a full-stack health emergency response and management system designed to provide intelligent, real-time assistance during medical crises. It combines a secure user interface, emergency tools, and the power of a locally hosted Ollama Mistral LLM to deliver critical decision-making support, medical triage, and context-aware guidance.

---

## Overview

SanjeevniAI serves as a first-line medical AI support system in emergencies. It can provide real-time CPR instructions, assess symptom severity, and guide users through appropriate first-aid steps before professional help arrives. The system leverages the Mistral 7B language model, hosted locally using Ollama, to offer intelligent responses without the need for cloud-based APIs. This ensures data privacy and offline capability.

---

## Features

- User registration and authentication with JWT
- Emergency response dashboard with location awareness
- Panic button with real-time guidance
- Integration with local Ollama Mistral LLM for medical support
- Secure storage of personal medical information
- Emergency contact management
- MongoDB-based backend for persistent data
- Modern frontend using React and Vite

---

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn
- Ollama installed locally
- Mistral 7B model pulled via Ollama

---

## Installation and Setup

### 1. Clone/Extract the project
Extract the zip file and navigate to the project directory.

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory with:
```
MONGODB_URI=mongodb://localhost:27017/hack4health
JWT_SECRET=Tech-Mavericks
PORT=5000
```

Start the backend server:
```bash
npm start
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
npm run dev
```

### 4. Database Setup

Make sure MongoDB is running on your system. The application will create the necessary collections automatically.

## Usage

1. Start the backend server (it will run on http://localhost:5000)
2. Start the frontend development server (it will run on http://localhost:5173)
3. Open your browser and navigate to http://localhost:5173
4. Register a new account or login with existing credentials
5. After successful authentication, you'll be redirected to the dashboard

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user information
- `PUT /api/auth/profile` - Update user profile

## Project Structure

```
hack4health/
├── backend/
│   ├── server.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── auth.js
│   ├── middleware/
│   │   └── auth.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── Dashboard.jsx
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- CORS for cross-origin requests

### Frontend
- React
- React Router DOM
- Axios for API calls
- CSS for styling
- Vite for development

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Protected routes
- Input validation
- CORS configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please contact Team - Tech Mavericks
