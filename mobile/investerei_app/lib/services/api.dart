import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config.dart';
import 'token_store.dart';

class Api {
  static Uri _u(String path) => Uri.parse('${Config.apiBase}$path');

  static Future<void> register(String email, String password) async {
    final res = await http.post(_u('/api/v1/auth/register'),
      headers: {'Content-Type':'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    if (res.statusCode >= 200 && res.statusCode < 300) {
      final j = jsonDecode(res.body);
      await TokenStore.setToken(j['token']);
      return;
    }
    throw Exception(res.body);
  }

  static Future<void> login(String email, String password) async {
    final res = await http.post(_u('/api/v1/auth/login'),
      headers: {'Content-Type':'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    if (res.statusCode >= 200 && res.statusCode < 300) {
      final j = jsonDecode(res.body);
      await TokenStore.setToken(j['token']);
      return;
    }
    throw Exception(res.body);
  }

  static Future<Map<String, dynamic>> optimize(List<double> mu, List<List<double>> cov) async {
    final token = await TokenStore.getToken();
    final res = await http.post(_u('/api/v1/portfolio/optimize'),
      headers: {'Content-Type':'application/json', 'Authorization':'Bearer ${token ?? ''}'},
      body: jsonEncode({'mu': mu, 'cov': cov, 'riskAversion': 6, 'maxWeight': 0.6, 'minWeight': 0.0}),
    );
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return jsonDecode(res.body);
    }
    throw Exception(res.body);
  }

  static Future<Map<String, dynamic>> riskMetrics(List<double> returns) async {
    final token = await TokenStore.getToken();
    final res = await http.post(_u('/api/v1/risk/metrics'),
      headers: {'Content-Type':'application/json', 'Authorization':'Bearer ${token ?? ''}'},
      body: jsonEncode({'returns': returns, 'confidence': 0.95, 'riskFree': 0.0}),
    );
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return jsonDecode(res.body);
    }
    throw Exception(res.body);
  }
}
