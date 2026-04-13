import 'dart:convert';

import 'package:http/http.dart' as http;

import 'api_config.dart';
import 'session_models.dart';

class AuthApi {
  const AuthApi();

  Future<AuthSession> register({
    required String email,
    required String password,
    required String displayName,
  }) async {
    final http.Response response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/auth/register'),
      headers: <String, String>{'Content-Type': 'application/json'},
      body: jsonEncode(<String, dynamic>{
        'email': email,
        'password': password,
        'display_name': displayName,
      }),
    );
    return _parseSession(response);
  }

  Future<AuthSession> login({
    required String email,
    required String password,
  }) async {
    final http.Response response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/auth/login'),
      headers: <String, String>{'Content-Type': 'application/json'},
      body: jsonEncode(<String, dynamic>{
        'email': email,
        'password': password,
      }),
    );
    return _parseSession(response);
  }

  AuthSession _parseSession(http.Response response) {
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('Auth failed: ${response.body}');
    }
    return AuthSession.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
  }
}
