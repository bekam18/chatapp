import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'dart:convert';

import '../models/user_model.dart';
import '../services/api_service.dart';
import '../utils/constants.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  bool _isLoading = false;
  bool _isAuthenticated = false;
  String? _error;
  
  final ApiService _apiService = ApiService();
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();
  
  // Getters
  User? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;
  String? get error => _error;
  
  // Initialize auth state
  Future<void> initializeAuth() async {
    _setLoading(true);
    
    try {
      final token = await _secureStorage.read(key: Constants.tokenKey);
      if (token != null) {
        _apiService.setAuthToken(token);
        await _loadUserProfile();
      }
    } catch (e) {
      print('Auth initialization error: $e');
      await logout();
    } finally {
      _setLoading(false);
    }
  }
  
  // Login
  Future<bool> login(String email, String password) async {
    _setLoading(true);
    _clearError();
    
    try {
      final response = await _apiService.login(email, password);
      
      if (response['success']) {
        final userData = response['data'];
        final token = userData['token'];
        final user = User.fromJson(userData['user']);
        
        // Store token securely
        await _secureStorage.write(key: Constants.tokenKey, value: token);
        
        // Store user data
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(Constants.userKey, jsonEncode(user.toJson()));
        
        // Set auth state
        _apiService.setAuthToken(token);
        _user = user;
        _isAuthenticated = true;
        
        notifyListeners();
        return true;
      } else {
        _setError(response['message'] ?? 'Login failed');
        return false;
      }
    } catch (e) {
      _setError('Network error. Please check your connection.');
      return false;
    } finally {
      _setLoading(false);
    }
  }
  
  // Register
  Future<bool> register(String username, String email, String password) async {
    _setLoading(true);
    _clearError();
    
    try {
      final response = await _apiService.register(username, email, password);
      
      if (response['success']) {
        final userData = response['data'];
        final token = userData['token'];
        final user = User.fromJson(userData['user']);
        
        // Store token securely
        await _secureStorage.write(key: Constants.tokenKey, value: token);
        
        // Store user data
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(Constants.userKey, jsonEncode(user.toJson()));
        
        // Set auth state
        _apiService.setAuthToken(token);
        _user = user;
        _isAuthenticated = true;
        
        notifyListeners();
        return true;
      } else {
        _setError(response['message'] ?? 'Registration failed');
        return false;
      }
    } catch (e) {
      _setError('Network error. Please check your connection.');
      return false;
    } finally {
      _setLoading(false);
    }
  }
  
  // Logout
  Future<void> logout() async {
    try {
      // Call logout API
      await _apiService.logout();
    } catch (e) {
      print('Logout API error: $e');
    }
    
    // Clear local storage
    await _secureStorage.delete(key: Constants.tokenKey);
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(Constants.userKey);
    
    // Clear auth state
    _apiService.clearAuthToken();
    _user = null;
    _isAuthenticated = false;
    _clearError();
    
    notifyListeners();
  }
  
  // Load user profile
  Future<void> _loadUserProfile() async {
    try {
      final response = await _apiService.getProfile();
      
      if (response['success']) {
        _user = User.fromJson(response['data']);
        _isAuthenticated = true;
        
        // Update stored user data
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(Constants.userKey, jsonEncode(_user!.toJson()));
      } else {
        throw Exception('Failed to load profile');
      }
    } catch (e) {
      print('Profile load error: $e');
      await logout();
    }
  }
  
  // Update user profile
  Future<bool> updateProfile(Map<String, dynamic> userData) async {
    _setLoading(true);
    _clearError();
    
    try {
      final response = await _apiService.updateProfile(userData);
      
      if (response['success']) {
        _user = User.fromJson(response['data']);
        
        // Update stored user data
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(Constants.userKey, jsonEncode(_user!.toJson()));
        
        notifyListeners();
        return true;
      } else {
        _setError(response['message'] ?? 'Update failed');
        return false;
      }
    } catch (e) {
      _setError('Network error. Please try again.');
      return false;
    } finally {
      _setLoading(false);
    }
  }
  
  // Helper methods
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }
  
  void _setError(String error) {
    _error = error;
    notifyListeners();
  }
  
  void _clearError() {
    _error = null;
    notifyListeners();
  }
  
  void clearError() {
    _clearError();
  }
}