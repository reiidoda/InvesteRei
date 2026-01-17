import 'package:flutter/material.dart';
import 'screens/login.dart';
import 'screens/portfolio_lab.dart';
import 'screens/audit_log.dart';
import 'screens/market_data.dart';
import 'screens/auto_invest.dart';
import 'screens/simulation.dart';
import 'screens/ai.dart';
import 'screens/watchlists.dart';
import 'screens/alerts.dart';
import 'screens/statements.dart';
import 'screens/research.dart';
import 'screens/manual_trade.dart';

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
        '/audit': (_) => const AuditLogScreen(),
        '/market-data': (_) => const MarketDataScreen(),
        '/auto-invest': (_) => const AutoInvestScreen(),
        '/simulation': (_) => const SimulationScreen(),
        '/ai': (_) => const AiScreen(),
        '/watchlists': (_) => const WatchlistsScreen(),
        '/alerts': (_) => const AlertsScreen(),
        '/statements': (_) => const StatementsScreen(),
        '/research': (_) => const ResearchScreen(),
        '/manual-trade': (_) => const ManualTradeScreen(),
      },
      initialRoute: '/',
    );
  }
}
