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
  final mfaCode = TextEditingController();
  String msg = '';
  bool mfaRequired = false;
  String? mfaToken;
  String? mfaTokenExpiresAt;

  @override
  void dispose() {
    email.dispose();
    password.dispose();
    mfaCode.dispose();
    super.dispose();
  }

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
                    setState(() {
                      msg = 'Registering...';
                      mfaRequired = false;
                      mfaToken = null;
                      mfaTokenExpiresAt = null;
                    });
                    try {
                      await Api.register(email.text, password.text);
                      setState(() => msg = 'Registered');
                      if (mounted) Navigator.pop(context);
                    }
                    catch (e) { setState(() => msg = e.toString()); }
                  },
                  child: const Text('Register'),
                ),
                const SizedBox(width: 12),
                OutlinedButton(
                  onPressed: () async {
                    setState(() {
                      msg = 'Logging in...';
                      mfaRequired = false;
                      mfaToken = null;
                      mfaTokenExpiresAt = null;
                    });
                    try {
                      final result = await Api.login(email.text, password.text);
                      if (result.mfaRequired) {
                        setState(() {
                          mfaRequired = true;
                          mfaToken = result.mfaToken;
                          mfaTokenExpiresAt = result.mfaTokenExpiresAt;
                          msg = 'MFA required. Enter your code.';
                        });
                        return;
                      }
                      setState(() => msg = 'Logged in');
                      if (mounted) Navigator.pop(context);
                    }
                    catch (e) { setState(() => msg = e.toString()); }
                  },
                  child: const Text('Login'),
                ),
              ],
            ),
            if (mfaRequired) ...[
              const SizedBox(height: 12),
              TextField(controller: mfaCode, decoration: const InputDecoration(labelText: 'MFA Code')),
              if (mfaTokenExpiresAt != null && mfaTokenExpiresAt!.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text('Expires at $mfaTokenExpiresAt', style: const TextStyle(fontSize: 12, color: Colors.black54)),
                ),
              const SizedBox(height: 8),
              OutlinedButton(
                onPressed: () async {
                  if (mfaToken == null || mfaToken!.isEmpty) {
                    setState(() => msg = 'Missing MFA token. Retry login.');
                    return;
                  }
                  setState(() => msg = 'Verifying MFA...');
                  try {
                    final result = await Api.verifyMfa(mfaCode.text, mfaToken: mfaToken);
                    if (result.token == null) {
                      setState(() => msg = 'MFA verification failed.');
                      return;
                    }
                    setState(() => msg = 'MFA verified');
                    if (mounted) Navigator.pop(context);
                  } catch (e) {
                    setState(() => msg = e.toString());
                  }
                },
                child: const Text('Verify MFA'),
              ),
            ],
            const SizedBox(height: 10),
            Text(msg, style: const TextStyle(fontSize: 12, color: Colors.black54)),
          ],
        ),
      ),
    );
  }
}
