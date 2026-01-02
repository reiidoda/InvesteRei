import 'package:flutter/material.dart';
import 'screens/login.dart';
import 'screens/portfolio_lab.dart';

void main() {
  runApp(const InvesteReiApp());
}

class InvesteReiApp extends StatelessWidget {
  const InvesteReiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'InvesteRei',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF111111)),
        useMaterial3: true,
      ),
      routes: {
        '/': (_) => const PortfolioLabScreen(),
        '/login': (_) => const LoginScreen(),
      },
      initialRoute: '/',
    );
  }
}
