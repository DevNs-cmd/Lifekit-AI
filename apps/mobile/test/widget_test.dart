import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lifekit_mobile/src/app.dart';

void main() {
  testWidgets('LifeKit renders landing experience', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: LifeKitApp()));
    await tester.pump(const Duration(milliseconds: 500));

    expect(find.text('LifeKit'), findsWidgets);
    expect(find.text('THE AI-POWERED LIFE OS'), findsOneWidget);
  });
}
