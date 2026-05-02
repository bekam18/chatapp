import 'package:flutter/material.dart';
import '../models/message_model.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';

class ChatProvider with ChangeNotifier {
  List<User> _users = [];
  List<Message> _messages = [];
  User? _selectedUser;
  bool _isLoading = false;
  String? _error;
  bool _isTyping = false;

  final ApiService _apiService = ApiService();

  List<User> get users => _users;
  List<Message> get messages => _messages;
  User? get selectedUser => _selectedUser;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isTyping => _isTyping;

  void setApiToken(String token) => _apiService.setAuthToken(token);

  Future<void> loadUsers() async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await _apiService.getUsers();
      if (response['success']) {
        final data = response['data'];
        final list = data is List ? data : (data['users'] ?? []);
        _users = (list as List).map((u) => User.fromJson(u)).toList();
      }
    } catch (e) {
      _error = 'Failed to load users';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadMessages(int userId) async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await _apiService.getMessages(userId);
      if (response['success']) {
        final data = response['data'];
        final list = data is List ? data : (data['messages'] ?? []);
        _messages = (list as List).map((m) => Message.fromJson(m)).toList();
      }
    } catch (e) {
      _error = 'Failed to load messages';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> sendMessage(int receiverId, String message) async {
    try {
      final response = await _apiService.sendMessage(receiverId, message);
      if (response['success']) {
        final data = response['data'];
        final newMsg = Message.fromJson(data is Map ? data : data['message']);
        _messages.add(newMsg);
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  void selectUser(User user) {
    _selectedUser = user;
    _messages = [];
    notifyListeners();
  }

  void addMessage(Message message) {
    _messages.add(message);
    notifyListeners();
  }

  void setTyping(bool typing) {
    _isTyping = typing;
    notifyListeners();
  }

  void updateUserOnlineStatus(int userId, bool isOnline) {
    final index = _users.indexWhere((u) => u.id == userId);
    if (index != -1) {
      _users[index] = _users[index].copyWith(isOnline: isOnline);
      notifyListeners();
    }
  }

  void clearMessages() {
    _messages = [];
    notifyListeners();
  }
}