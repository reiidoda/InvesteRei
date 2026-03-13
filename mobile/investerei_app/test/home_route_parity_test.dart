import 'package:flutter_test/flutter_test.dart';
import 'package:investerei_app/main.dart';
import 'package:investerei_app/screens/home.dart';

void main() {
  test('all enterprise routes are reachable from mobile home catalog', () {
    final appRouteSet = appRoutes.keys
        .where((route) => route != '/' && route != '/home')
        .toSet();
    final homeRouteSet = homeNavItems.map((item) => item.route).toSet();

    expect(homeNavItems.length, homeRouteSet.length, reason: 'home route entries must be unique');
    expect(homeRouteSet, appRouteSet);
  });
}
