class Message {
  final int id;
  final int senderId;
  final int? receiverId;
  final int? groupId;
  final String message;
  final String messageType;
  final bool isRead;
  final DateTime createdAt;
  final String? senderUsername;

  Message({
    required this.id,
    required this.senderId,
    this.receiverId,
    this.groupId,
    required this.message,
    this.messageType = 'text',
    this.isRead = false,
    required this.createdAt,
    this.senderUsername,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['id'] ?? 0,
      senderId: json['sender_id'] ?? json['senderId'] ?? 0,
      receiverId: json['receiver_id'] ?? json['receiverId'],
      groupId: json['group_id'] ?? json['groupId'],
      message: json['message'] ?? '',
      messageType: json['message_type'] ?? json['messageType'] ?? 'text',
      isRead: json['is_read'] ?? json['isRead'] ?? false,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : json['createdAt'] != null
              ? DateTime.parse(json['createdAt'])
              : DateTime.now(),
      senderUsername: json['sender_username'] ?? json['senderUsername'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'sender_id': senderId,
      'receiver_id': receiverId,
      'group_id': groupId,
      'message': message,
      'message_type': messageType,
      'is_read': isRead,
      'created_at': createdAt.toIso8601String(),
      'sender_username': senderUsername,
    };
  }
}