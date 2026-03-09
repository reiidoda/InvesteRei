import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  static const _items = <_NavItem>[
    _NavItem('Login', '/login', Icons.login),
    _NavItem('Portfolio Lab', '/portfolio-lab', Icons.analytics_outlined),
    _NavItem('Portfolio Builder', '/portfolio-builder', Icons.account_tree_outlined),
    _NavItem('Market Data', '/market-data', Icons.show_chart),
    _NavItem('Manual Trade', '/manual-trade', Icons.swap_horiz),
    _NavItem('Auto Invest', '/auto-invest', Icons.auto_graph),
    _NavItem('Banking', '/banking', Icons.account_balance),
    _NavItem('Funding / Statements', '/statements', Icons.receipt_long),
    _NavItem('Wealth Plan', '/wealth-plan', Icons.savings_outlined),
    _NavItem('Screeners', '/screeners', Icons.tune),
    _NavItem('Research', '/research', Icons.article_outlined),
    _NavItem('Watchlists', '/watchlists', Icons.bookmark_border),
    _NavItem('Alerts', '/alerts', Icons.notifications_active),
    _NavItem('Rewards', '/rewards', Icons.card_giftcard),
    _NavItem('Best Execution', '/best-execution', Icons.speed_outlined),
    _NavItem('Surveillance', '/surveillance', Icons.shield_outlined),
    _NavItem('Audit Log', '/audit', Icons.history),
    _NavItem('Simulation', '/simulation', Icons.timeline),
    _NavItem('AI', '/ai', Icons.psychology),
    _NavItem('Org Admin', '/org-admin', Icons.admin_panel_settings_outlined),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('InvesteRei — Mobile Hub')),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _items.length,
        separatorBuilder: (_, __) => const Divider(height: 1),
        itemBuilder: (context, index) {
          final item = _items[index];
          return ListTile(
            leading: Icon(item.icon),
            title: Text(item.label),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => Navigator.pushNamed(context, item.route),
          );
        },
      ),
    );
  }
}

class _NavItem {
  final String label;
  final String route;
  final IconData icon;

  const _NavItem(this.label, this.route, this.icon);
}
