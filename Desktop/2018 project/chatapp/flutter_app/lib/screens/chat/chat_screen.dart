import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/chat_provider.dart';
import '../../providers/socket_provider.dart';
import '../../models/user_model.dart';
import '../../models/message_model.dart';
import '../../utils/app_theme.dart';
import 'conversation_screen.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _initialize());
  }

  void _initialize() {
    final auth = context.read<AuthProvider>();
    final chat = context.read<ChatProvider>();
    final socket = context.read<SocketProvider>();

    if (auth.user != null) {
      chat.setApiToken(auth.user!.id.toString());
      chat.loadUsers();

      socket.connect(
        auth.user!.id.toString(),
        onMessage: (Message msg) {
          chat.addMessage(msg);
        },
        onUserStatus: (int userId, bool isOnline) {
          chat.updateUserOnlineStatus(userId, isOnline);
        },
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        flexibleSpace: Container(decoration: const BoxDecoration(gradient: AppTheme.primaryGradient)),
        title: const Text('ChatApp'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              context.read<SocketProvider>().disconnect();
              await context.read<AuthProvider>().logout();
              if (mounted) Navigator.pushReplacementNamed(context, '/login');
            },
          ),
        ],
      ),
      body: Consumer<ChatProvider>(
        builder: (context, chat, _) {
          if (chat.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (chat.users.isEmpty) {
            return const Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.people_outline, size: 64, color: Colors.grey),
                  SizedBox(height: 16),
                  Text('No users found', style: TextStyle(color: Colors.grey, fontSize: 16)),
                  SizedBox(height: 8),
                  Text('Register more users to start chatting',
                      style: TextStyle(color: Colors.grey, fontSize: 14)),
                ],
              ),
            );
          }

          return ListView.separated(
            itemCount: chat.users.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final user = chat.users[index];
              final currentUser = context.read<AuthProvider>().user;
              if (user.id == currentUser?.id) return const SizedBox.shrink();
              return _UserTile(user: user);
            },
          );
        },
      ),
    );
  }
}

class _UserTile extends StatelessWidget {
  final User user;
  const _UserTile({required this.user});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Stack(
        children: [
          CircleAvatar(
            backgroundColor: AppTheme.primaryColor,
            child: Text(user.username[0].toUpperCase(),
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
          if (user.isOnline)
            Positioned(
              right: 0,
              bottom: 0,
              child: Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  color: Colors.green,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 2),
                ),
              ),
            ),
        ],
      ),
      title: Text(user.username, style: const TextStyle(fontWeight: FontWeight.w600)),
      subtitle: Text(user.isOnline ? 'Online' : 'Offline',
          style: TextStyle(color: user.isOnline ? Colors.green : Colors.grey, fontSize: 12)),
      onTap: () {
        context.read<ChatProvider>().selectUser(user);
        Navigator.push(context, MaterialPageRoute(builder: (_) => ConversationScreen(user: user)));
      },
    );
  }
}