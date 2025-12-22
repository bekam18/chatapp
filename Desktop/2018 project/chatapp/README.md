# Real-Time Chat Application

A modern, secure real-time chat application built with React.js, Node.js, Socket.IO, and MySQL. Features include user authentication, real-time messaging, online status indicators, typing indicators, and message read receipts.

## 🚀 Features

### Core Features
- ✅ User Registration & Login
- ✅ JWT Authentication
- ✅ Secure Password Hashing (Bcrypt)
- ✅ Real-Time One-to-One Messaging
- ✅ Online/Offline User Status
- ✅ Typing Indicators
- ✅ Message Read Status
- ✅ Persistent Chat History
- ✅ Responsive Design (Mobile-friendly)

### Security Features
- 🔐 JWT-based Authentication
- 🔐 Bcrypt Password Hashing
- 🔐 SQL Injection Prevention
- 🔐 XSS Protection
- 🔐 Rate Limiting
- 🔐 CORS Configuration

### Technical Features
- ⚡ Real-time WebSocket Communication
- 📱 Mobile-responsive UI
- 🔄 Auto-reconnection
- 💾 Message Persistence
- 🔍 User Search
- 📊 Connection Status Indicators

## 🛠 Tech Stack

### Frontend
- **React.js** - UI Framework
- **Socket.IO Client** - Real-time Communication
- **Axios** - HTTP Client
- **React Router** - Navigation
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **Socket.IO** - WebSocket Server
- **JWT** - Authentication
- **Bcrypt.js** - Password Hashing

### Database
- **MySQL** - Primary Database
- **mysql2** - MySQL Driver

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MySQL** (v8.0 or higher)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd realtime-chat-app
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 4. Database Setup

#### Create MySQL Database
```sql
CREATE DATABASE chat_app;
```

#### Run Database Schema
```bash
mysql -u root -p chat_app < database/schema.sql
```

Or manually execute the SQL commands from `database/schema.sql`

### 5. Environment Configuration

#### Backend Environment (.env)
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=chat_app
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

#### Frontend Environment (client/.env)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SERVER_URL=http://localhost:5000
```

### 6. Start the Application

#### Development Mode (Both Frontend & Backend)
```bash
npm run dev:full
```

#### Or Start Separately

**Backend:**
```bash
npm run dev
```

**Frontend:**
```bash
npm run client
```

### 7. Access the Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

## 📁 Project Structure

```
realtime-chat-app/
├── client/                     # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Auth.css
│   │   │   ├── Chat.css
│   │   │   ├── Chat.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── UserList.js
│   │   │   ├── UserList.css
│   │   │   ├── MessageList.js
│   │   │   ├── MessageList.css
│   │   │   ├── MessageInput.js
│   │   │   └── MessageInput.css
│   │   ├── context/            # React contexts
│   │   │   ├── AuthContext.js
│   │   │   └── SocketContext.js
│   │   ├── services/           # API services
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   └── .env
├── config/                     # Backend configuration
│   └── database.js
├── middleware/                 # Express middleware
│   └── auth.js
├── routes/                     # API routes
│   ├── auth.js
│   ├── users.js
│   └── messages.js
├── socket/                     # Socket.IO handlers
│   └── socketHandler.js
├── database/                   # Database files
│   └── schema.sql
├── server.js                   # Main server file
├── package.json
├── .env
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile

### Users
- `GET /api/users` - Get all users
- `GET /api/users/search?q=query` - Search users
- `GET /api/users/:id` - Get user by ID

### Messages
- `GET /api/messages/:userId` - Get conversation messages
- `POST /api/messages` - Send message
- `GET /api/messages` - Get conversations list
- `PUT /api/messages/:userId/read` - Mark messages as read

## 🔌 Socket.IO Events

### Client to Server
- `joinConversation` - Join a conversation room
- `leaveConversation` - Leave a conversation room
- `sendMessage` - Send a message
- `typing` - Send typing indicator
- `markAsRead` - Mark messages as read

### Server to Client
- `receiveMessage` - Receive new message
- `newMessage` - New message notification
- `userStatusUpdate` - User online/offline status
- `onlineUsers` - List of online users
- `userTyping` - Typing indicator
- `messagesRead` - Message read confirmation
- `messageError` - Message sending error

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    status ENUM('online', 'offline') DEFAULT 'offline',
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Messages Table
```sql
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    message_type ENUM('text', 'image', 'file') DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🧪 Testing

### Manual Testing Steps

1. **Registration:**
   - Navigate to `/register`
   - Create a new account
   - Verify JWT token storage

2. **Login:**
   - Navigate to `/login`
   - Login with credentials
   - Verify redirect to chat

3. **Real-time Messaging:**
   - Open two browser windows
   - Login with different accounts
   - Send messages between users
   - Verify real-time delivery

4. **Features Testing:**
   - Test typing indicators
   - Test online/offline status
   - Test message read receipts
   - Test mobile responsiveness

## 🚀 Deployment

### Production Environment Variables

#### Backend (.env)
```env
PORT=5000
DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_NAME=chat_app
JWT_SECRET=your_super_secure_production_jwt_secret
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

#### Frontend (.env.production)
```env
REACT_APP_API_URL=https://your-api-domain.com
REACT_APP_SERVER_URL=https://your-api-domain.com
```

### Build Commands
```bash
# Build frontend
cd client && npm run build

# Start production server
npm start
```

## 🔧 Configuration

### CORS Configuration
Update `server.js` with your production domains:
```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  credentials: true
};
```

### Rate Limiting
Current limits (configurable in `server.js`):
- General API: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify MySQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **Socket Connection Issues**
   - Check CORS configuration
   - Verify server URL in client `.env`
   - Check firewall settings

3. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Clear localStorage and re-login

4. **Port Already in Use**
   ```bash
   # Kill process on port 5000
   npx kill-port 5000
   
   # Or change PORT in .env file
   ```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Built with ❤️ using React.js, Node.js, Socket.IO, and MySQL**