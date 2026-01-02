import 'dart:convert';
import 'package:flutter/material.dart';
import '../services/api.dart';

class PortfolioLabScreen extends StatefulWidget {
  const PortfolioLabScreen({super.key});
  @override
  State<PortfolioLabScreen> createState() => _PortfolioLabScreenState();
}

class _PortfolioLabScreenState extends State<PortfolioLabScreen> {
  final muCtrl = TextEditingController(text: '[0.10, 0.07, 0.04]');
  final covCtrl = TextEditingController(text: '[[0.20,0.05,0.02],[0.05,0.12,0.01],[0.02,0.01,0.06]]');
  String msg = 'Tap Login to authenticate.';
  Map<String, dynamic>? result;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('InvesteRei — Portfolio Lab'),
        actions: [IconButton(icon: const Icon(Icons.login), onPressed: () => Navigator.pushNamed(context, '/login'))],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: ListView(
          children: [
            const Text('Simulation-first optimizer (educational).', style: TextStyle(color: Colors.black54)),
            const SizedBox(height: 12),
            TextField(controller: muCtrl, maxLines: 2, decoration: const InputDecoration(labelText: 'mu (JSON array)')),
            const SizedBox(height: 8),
            TextField(controller: covCtrl, maxLines: 3, decoration: const InputDecoration(labelText: 'cov (JSON matrix)')),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: () async {
                setState(() { msg = 'Running...'; result = null; });
                try {
                  final mu = (jsonDecode(muCtrl.text) as List).map((e) => (e as num).toDouble()).toList();
                  final cov = (jsonDecode(covCtrl.text) as List).map((row) =>
                      (row as List).map((e) => (e as num).toDouble()).toList()).toList();
                  final r = await Api.optimize(mu, cov);
                  setState(() { result = r; msg = 'Done.'; });
                } catch (e) {
                  setState(() => msg = e.toString());
                }
              },
              child: const Text('Run Optimizer'),
            ),
            const SizedBox(height: 8),
            Text(msg, style: const TextStyle(fontSize: 12, color: Colors.black54)),
            if (result != null) ...[
              const SizedBox(height: 12),
              Text(const JsonEncoder.withIndent('  ').convert(result)),
            ]
          ],
        ),
      ),
    );
  }
}
