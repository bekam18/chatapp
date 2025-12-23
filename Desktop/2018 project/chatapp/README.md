# 📱 Flutter Chat Application

A modern, real-time chat application built with Flutter for mobile and Node.js for the backend.

## 🚀 Project Overview

This is a cross-platform mobile chat application that demonstrates modern mobile development practices using Flutter and Dart, with a robust Node.js backend for real-time messaging.

## 📁 Project Structure

```
chatapp/
├── flutter_app/         ← Flutter mobile application
│   ├── lib/
│   │   ├── main.dart
│   │   ├── models/
│   │   ├── providers/
│   │   ├── screens/
│   │   ├── services/
│   │   ├── utils/
│   │   └── widgets/
│   └── pubspec.yaml
├── server.js            ← Node.js backend server
├── routes/              ← API routes
├── database/            ← Database schema and setup
├── config/              ← Configuration files
├── middleware/          ← Express middleware
└── socket/              ← Socket.IO handlers
```

## 🛠️ Technology Stack

### Frontend (Mobile)
- **Flutter** - Cross-platform mobile framework
- **Dart** - Programming language
- **Material Design 3** - UI components
- **Provider** - State management
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **MySQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

## 🚀 Getting Started

### Prerequisites
- Flutter SDK (3.0+)
- Node.js (16+)
- MySQL (8.0+)
- Android Studio (for Android development)
- Xcode (for iOS development - Mac only)

### Backend Setup
```bash
# Install dependencies
npm install

# Setup database
npm run setup-db

# Start server
npm run server
```

### Flutter App Setup
```bash
# Navigate to Flutter app
cd flutter_app

# Install dependencies
flutter pub get

# Run on device/emulator
flutter run
```

## 📱 Features

### Core Features
- ✅ User authentication (login/register)
- ✅ Real-time messaging
- ✅ Group chat functionality
- ✅ Message reactions
- ✅ Media sharing (images, files)
- ✅ Online status indicators
- ✅ Typing indicators
- ✅ Message read receipts

### Mobile-Specific Features
- ✅ Native performance (60fps)
- ✅ Material Design UI
- ✅ Dark/Light theme support
- ✅ Push notifications
- ✅ Offline message storage
- ✅ Camera integration
- ✅ File picker
- ✅ Biometric authentication ready

### Advanced Features
- ✅ Message editing and deletion
- ✅ User blocking and reporting
- ✅ Starred messages
- ✅ Custom themes
- ✅ Notification settings
- ✅ Privacy controls

## 🏗️ Architecture

### Mobile App (Flutter)
```
lib/
├── main.dart              # App entry point
├── models/                # Data models
│   ├── user_model.dart
│   ├── message_model.dart
│   └── group_model.dart
├── providers/             # State management
│   ├── auth_provider.dart
│   ├── chat_provider.dart
│   └── socket_provider.dart
├── screens/               # UI screens
│   ├── auth/
│   ├── chat/
│   └── settings/
├── services/              # API and business logic
│   ├── api_service.dart
│   └── socket_service.dart
├── utils/                 # Utilities and constants
│   ├── app_theme.dart
│   └── constants.dart
└── widgets/               # Reusable UI components
```

### Backend API
```
routes/
├── auth.js               # Authentication endpoints
├── users.js              # User management
├── messages.js           # Message handling
├── groups.js             # Group chat
├── reactions.js          # Message reactions
├── settings.js           # User settings
└── upload.js             # File upload
```

## 📱 Building and Deployment

### Debug Build
```bash
flutter build apk --debug
```

### Release Build
```bash
flutter build apk --release
flutter build appbundle --release  # For Google Play Store
flutter build ios --release        # For App Store (Mac only)
```

### Backend Deployment
- **Heroku** - Easy deployment with Git
- **Railway** - Modern deployment platform
- **Render** - Free tier available
- **AWS/GCP** - Production-grade hosting

## 🎓 Academic Project Highlights

### Technical Skills Demonstrated
- **Mobile Development** - Flutter/Dart expertise
- **Backend Development** - Node.js/Express API design
- **Database Design** - MySQL schema and relationships
- **Real-time Systems** - Socket.IO implementation
- **Authentication** - JWT and secure storage
- **State Management** - Provider pattern in Flutter
- **API Integration** - RESTful services
- **Cross-platform Development** - Single codebase for iOS/Android

### Modern Development Practices
- **Clean Architecture** - Separation of concerns
- **State Management** - Reactive programming
- **Security** - Authentication and authorization
- **Performance** - Optimized for mobile devices
- **User Experience** - Material Design principles
- **Testing Ready** - Structured for unit/widget tests

## 📞 Support

For questions or issues:
1. Check the Flutter documentation
2. Review the API documentation
3. Test the backend endpoints
4. Verify database connections

## 🎉 Success Metrics

This project demonstrates:
- ✅ **Full-stack development** capabilities
- ✅ **Mobile app development** with Flutter
- ✅ **Real-time application** architecture
- ✅ **Database design** and management
- ✅ **API development** and integration
- ✅ **Modern development** practices
- ✅ **Cross-platform** expertise

Perfect for academic presentations, job interviews, and portfolio demonstrations!