class Constants {
  // API Configuration
  static const String baseUrl = 'http://10.0.2.2:5000'; // Android emulator
  // static const String baseUrl = 'http://localhost:5000'; // iOS simulator
  // static const String baseUrl = 'https://your-backend-url.herokuapp.com'; // Production
  
  static const String apiUrl = '$baseUrl/api';
  static const String socketUrl = baseUrl;
  
  // API Endpoints
  static const String loginEndpoint = '$apiUrl/auth/login';
  static const String registerEndpoint = '$apiUrl/auth/register';
  static const String profileEndpoint = '$apiUrl/auth/profile';
  static const String usersEndpoint = '$apiUrl/users';
  static const String messagesEndpoint = '$apiUrl/messages';
  static const String groupsEndpoint = '$apiUrl/groups';
  static const String uploadEndpoint = '$apiUrl/upload';
  
  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
  static const String themeKey = 'theme_mode';
  static const String notificationsKey = 'notifications_enabled';
  
  // App Configuration
  static const String appName = 'ChatApp';
  static const String appVersion = '1.0.0';
  
  // UI Constants
  static const double defaultPadding = 16.0;
  static const double smallPadding = 8.0;
  static const double largePadding = 24.0;
  
  static const double defaultRadius = 8.0;
  static const double largeRadius = 12.0;
  
  // Animation Durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 300);
  static const Duration longAnimation = Duration(milliseconds: 500);
  
  // Message Types
  static const String textMessage = 'text';
  static const String imageMessage = 'image';
  static const String fileMessage = 'file';
  static const String voiceMessage = 'voice';
  
  // Socket Events
  static const String connectEvent = 'connect';
  static const String disconnectEvent = 'disconnect';
  static const String joinRoomEvent = 'join_room';
  static const String leaveRoomEvent = 'leave_room';
  static const String sendMessageEvent = 'send_message';
  static const String receiveMessageEvent = 'receive_message';
  static const String typingEvent = 'typing';
  static const String stopTypingEvent = 'stop_typing';
  static const String userOnlineEvent = 'user_online';
  static const String userOfflineEvent = 'user_offline';
  
  // Error Messages
  static const String networkError = 'Network error. Please check your connection.';
  static const String serverError = 'Server error. Please try again later.';
  static const String authError = 'Authentication failed. Please login again.';
  static const String validationError = 'Please check your input and try again.';
  
  // Success Messages
  static const String loginSuccess = 'Login successful!';
  static const String registerSuccess = 'Registration successful!';
  static const String messageSent = 'Message sent successfully!';
  
  // Validation
  static const int minPasswordLength = 6;
  static const int maxMessageLength = 1000;
  static const int maxUsernameLength = 30;
  
  // File Upload
  static const int maxFileSize = 10 * 1024 * 1024; // 10MB
  static const List<String> allowedImageTypes = ['jpg', 'jpeg', 'png', 'gif'];
  static const List<String> allowedFileTypes = ['pdf', 'doc', 'docx', 'txt'];
}