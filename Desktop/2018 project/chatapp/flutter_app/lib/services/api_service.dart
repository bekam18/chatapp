import 'dart:convert';
import 'package:http/http.dart' as http;
import '../utils/constants.dart';

class ApiService {
  String? _authToken;

  void setAuthToken(String token) => _authToken = token;
  void clearAuthToken() => _authToken = null;

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_authToken != null) 'Authorization': 'Bearer $_authToken',
      };

  Future<Map<String, dynamic>> _handleResponse(http.Response response) async {
    final body = jsonDecode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return {'success': true, 'data': body['data'] ?? body, 'message': body['message']};
    }
    return {'success': false, 'message': body['message'] ?? 'Request failed'};
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse(Constants.loginEndpoint),
      headers: _headers,
      body: jsonEncode({'email': email, 'password': password}),
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> register(String username, String email, String password) async {
    final response = await http.post(
      Uri.parse(Constants.registerEndpoint),
      headers: _headers,
      body: jsonEncode({'username': username, 'email': email, 'password': password}),
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> logout() async {
    final response = await http.post(Uri.parse('${Constants.apiUrl}/auth/logout'), headers: _headers);
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> getProfile() async {
    final response = await http.get(Uri.parse(Constants.profileEndpoint), headers: _headers);
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    final response = await http.put(
      Uri.parse(Constants.profileEndpoint),
      headers: _headers,
      body: jsonEncode(data),
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> getUsers() async {
    final response = await http.get(Uri.parse(Constants.usersEndpoint), headers: _headers);
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> getMessages(int userId) async {
    final response = await http.get(
      Uri.parse('${Constants.messagesEndpoint}/$userId'),
      headers: _headers,
    );
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> sendMessage(int receiverId, String message) async {
    final response = await http.post(
      Uri.parse(Constants.messagesEndpoint),
      headers: _headers,
      body: jsonEncode({'receiverId': receiverId, 'message': message, 'messageType': 'text'}),
    );
    return _handleResponse(response);
  }
}