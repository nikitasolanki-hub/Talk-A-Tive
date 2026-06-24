# TALK-A-TIVE

TALK-A-TIVE is a real-time MERN stack chat application built with modern frontend and backend technologies. It supports user authentication, one-to-one chats, group chats, real-time messaging, typing indicators, profile images, and protected API routes.

## Tech Stack

### Frontend

- React 19
- Vite
- React Router DOM v7
- Chakra UI v3
- Socket.IO Client
- Axios
- React Icons
- Lottie React
- React Scrollable Feed

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- Socket.IO
- Cloudinary image upload

## Features

- User signup and login
- JWT-based authentication
- Password hashing using bcryptjs
- Upload profile image using Cloudinary
- Default profile image support
- Search users
- Create one-to-one chats
- Create group chats
- Rename group chats
- Add users to group chats
- Remove users from group chats
- Leave group chats
- Real-time messaging using Socket.IO
- Typing indicator animation
- Message notifications
- Responsive UI using Chakra UI v3

## Project Structure

```txt
frontend/
  src/
    main.jsx
    App.jsx
    App.css
    Context/
      ChatProvider.jsx
    pages/
      HomePage.jsx
      ChatPage.jsx
    components/
      ChatBox.jsx
      ChatLoading.jsx
      MyChats.jsx
      SingleChat.jsx
      ScrollableChat.jsx
      Authentication/
        Login.jsx
        Signup.jsx
      miscellaneous/
        SideDrawer.jsx
        ProfileModal.jsx
        GroupChatModal.jsx
        UpdateGroupChatModal.jsx
      userAvatar/
        UserListItem.jsx
        UserBadgeItem.jsx
    config/
      ChatLogics.jsx
    animations/
      typing.json

backend/
  config/
    db.js
    generateToken.js
  controllers/
    userControllers.js
    chatControllers.js
    messageControllers.js
  middleware/
    authMiddleware.js
    errorMiddleware.js
  models/
    userModel.js
    chatModel.js
    messageModel.js
  routes/
    userRoutes.js
    chatRoutes.js
    messageRoutes.js
  server.js
  .env
```

## Environment Variables

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## Cloudinary Configuration

This project uses Cloudinary unsigned upload for profile images.

Cloudinary upload URL:

```txt
https://api.cloudinary.com/v1_1/dq17pkuwg/image/upload
```

Unsigned upload preset:

```txt
chat-app
```

Default profile image:

```txt
https://res.cloudinary.com/dq17pkuwg/image/upload/v1782277226/20250619_151950_ef57eu.jpg
```

Only the Cloudinary `secure_url` should be stored in MongoDB as the user's `pic`.

## Installation

### Backend Setup

```bash
cd backend
npm install
npm run server
```

Required backend packages:

```bash
npm install express mongoose dotenv cors bcryptjs jsonwebtoken express-async-handler socket.io
npm install --save-dev nodemon
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Required frontend packages:

```bash
npm install @chakra-ui/react @emotion/react react-router-dom axios socket.io-client react-icons lottie-react react-scrollable-feed
```

## API Base URL

Because this project uses Vite, CRA-style proxy should not be used.

Use full API URLs in frontend:

```js
http://localhost:5000/api/user
http://localhost:5000/api/chat
http://localhost:5000/api/message
```

## Backend Routes

```js
app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
```

## Authentication Flow

1. User signs up or logs in.
2. Backend validates credentials.
3. Backend returns user data with JWT token.
4. Frontend stores user data in localStorage as `userInfo`.
5. Protected API requests send token in headers:

```js
Authorization: Bearer <token>
```

## Socket.IO Flow

### Backend

```js
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
  },
});
```

### Frontend

```js
const ENDPOINT = "http://localhost:5000";
socket = io(ENDPOINT);
```

## Common Fixes Used In This Project

- Use `useNavigate` instead of `useHistory`.
- Use Chakra UI v3 imports from `@chakra-ui/react`.
- Do not use old Chakra imports like:
  - `@chakra-ui/layout`
  - `@chakra-ui/button`
  - `@chakra-ui/icons`
  - `@chakra-ui/avatar`
  - `@chakra-ui/tooltip`
- Use `Dialog` instead of old `Modal`.
- Use `colorPalette` instead of `colorScheme`.
- Use `display="flex"` instead of `d="flex"`.
- Use `react-icons` instead of `@chakra-ui/icons`.
- Use full backend URLs with Vite.
- Use `module.exports`, not `module.export`.
- Use `$options`, not `$option`.
- Use `process.env.MONGO_URI` consistently.

## Run Project

Start backend:

```bash
cd backend
npm run server
```

Start frontend:

```bash
cd frontend
npm run dev
```

Frontend runs on:

```txt
http://localhost:5173
```

Backend runs on:

```txt
http://localhost:5000
```

## Author

Built as a modern MERN real-time chat application using React, Vite, Chakra UI v3, Node.js, Express, MongoDB, JWT, and Socket.IO.
