# Mobile (Android + iOS) — Flutter

Flutter client for InvesteRei backend.

Run:
```bash
cd mobile/investerei_app
flutter pub get
flutter run --dart-define=API_BASE=http://10.0.2.2:8080
```

Route parity test:
```bash
cd mobile/investerei_app
flutter test test/home_route_parity_test.dart
```

Mobile integration tests (deterministic fixtures, local fake API server):
```bash
cd mobile/investerei_app
flutter test test/integration
```

Run all mobile tests with CI parity:
```bash
cd mobile/investerei_app
flutter test test/home_route_parity_test.dart
flutter test test/integration
```

Manual enterprise smoke checklist:
- `docs/MOBILE_ENTERPRISE_SMOKE_CHECKLIST.md`
