import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../utils/constants.dart';
import '../models/message_model.dart';

class SocketProvider with ChangeNotifier {
  IO.Socket? _socket;
  bool _isConnected = false;

  bool get isConnected => _isConnected;

  void connect(String token, {
    Function(Message)? onMessage,
    Function(int, bool)? onUserStatus,
    Function(int)? onTyping,
    Function(int)? onStopTyping,
  }) {
    _socket = IO.io(Constants.socketUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
      'auth': {'token': token},
    });

    _socket!.connect();

    _socket!.onConnect((_) {
      _isConnected = true;
      notifyListeners();
    });

    _socket!.onDisconnect((_) {
      _isConnected = false;
      notifyListeners();
    });

    _socket!.on('receiveMessage', (data) {
      if (onMessage != null) {
        onMessage(Message.fromJson(data));
      }
    });

    _socket!.on('newMessage', (data) {
      if (onMessage != null) {
        onMessage(Message.fromJson(data));
      }
    });

    _socket!.on('userStatusUpdate', (data) {
      if (onUserStatus != null) {
        onUserStatus(data['userId'], data['status'] == 'online');
      }
    });

    _socket!.on('userTyping', (data) {
      if (onTyping != null) onTyping(data['userId']);
    });

    _socket!.on('userStopTyping', (data) {
      if (onStopTyping != null) onStopTyping(data['userId']);
    });
  }

  void joinConversation(int userId) {
    _socket?.emit('joinConversation', {'userId': userId});
  }

  void sendMessage(int receiverId, String message) {
    _socket?.emit('sendMessage', {'receiverId': receiverId, 'message': message});
  }

  void sendTyping(int receiverId) {
    _socket?.emit('typing', {'receiverId': receiverId});
  }

  void sendStopTyping(int receiverId) {
    _socket?.emit('stop_typing', {'receiverId': receiverId});
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
    _isConnected = false;
    notifyListeners();
  }
}