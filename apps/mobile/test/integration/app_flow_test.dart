import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lifekit_mobile/src/app.dart';

void main() {
  group('Critical User Journey Integration Test', () {
    testWidgets('Full navigation flow from Landing to Auth', (tester) async {
      await tester.pumpWidget(const ProviderScope(child: LifeKitApp()));
      await tester.pump(const Duration(milliseconds: 500));

      // Verify Landing Screen Brand
      expect(find.text('THE AI-POWERED LIFE OS'), findsOneWidget);

      // Tap Sign in button
      final signInBtn = find.text('Sign in');
      expect(signInBtn, findsOneWidget);
      await tester.tap(signInBtn);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 350));

      // Verify navigation to Auth / Sign In screen
      expect(find.text('Welcome back'), findsOneWidget);
    });
  });
}
