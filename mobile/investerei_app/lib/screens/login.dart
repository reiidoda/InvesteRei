import 'package:flutter/material.dart';
import '../services/api.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final email = TextEditingController();
  final password = TextEditingController();
  String msg = '';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('InvesteRei — Login')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Image.asset('assets/investerei-logo.png', width: 72, height: 72),
            const SizedBox(height: 12),
            TextField(controller: email, decoration: const InputDecoration(labelText: 'Email')),
            TextField(controller: password, decoration: const InputDecoration(labelText: 'Password'), obscureText: true),
            const SizedBox(height: 12),
            Row(
              children: [
                ElevatedButton(
                  onPressed: () async {
                    setState(() => msg = 'Registering...');
                    try { await Api.register(email.text, password.text); setState(() => msg = 'Registered'); if (mounted) Navigator.pop(context); }
                    catch (e) { setState(() => msg = e.toString()); }
                  },
                  child: const Text('Register'),
                ),
                const SizedBox(width: 12),
                OutlinedButton(
                  onPressed: () async {
                    setState(() => msg = 'Logging in...');
                    try { await Api.login(email.text, password.text); setState(() => msg = 'Logged in'); if (mounted) Navigator.pop(context); }
                    catch (e) { setState(() => msg = e.toString()); }
                  },
                  child: const Text('Login'),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(msg, style: const TextStyle(fontSize: 12, color: Colors.black54)),
          ],
        ),
      ),
    );
  }
}
