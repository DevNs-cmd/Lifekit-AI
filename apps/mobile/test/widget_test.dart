import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lifekit_mobile/src/app.dart';

void main() {
  testWidgets('LifeKit renders its home experience', (tester) async {
    await tester.pumpWidget(const ProviderScope(child: LifeKitApp()));
    await tester.pump();

    expect(find.text('Good morning, Alex.'), findsOneWidget);
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Missions'), findsOneWidget);
  });
}
