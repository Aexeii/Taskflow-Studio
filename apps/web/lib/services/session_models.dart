class SessionUser {
  final int id;
  final String email;
  final String displayName;

  const SessionUser({
    required this.id,
    required this.email,
    required this.displayName,
  });

  factory SessionUser.fromJson(Map<String, dynamic> json) {
    return SessionUser(
      id: json['id'] as int,
      email: json['email'] as String,
      displayName: json['display_name'] as String,
    );
  }
}

class AuthSession {
  final String accessToken;
  final SessionUser user;

  const AuthSession({
    required this.accessToken,
    required this.user,
  });

  factory AuthSession.fromJson(Map<String, dynamic> json) {
    return AuthSession(
      accessToken: json['access_token'] as String,
      user: SessionUser.fromJson(json['user'] as Map<String, dynamic>),
    );
  }
}
