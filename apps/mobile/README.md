# LifeKit Mobile

Flutter client for LifeKit, targeting iOS 16+ and Android API 29+.

## Bootstrap

Flutter is not installed in the environment where this source was authored. On a
machine with Flutter 3.22 or newer, generate the native platform runners without
replacing `lib` or `pubspec.yaml`:

```sh
cd apps/mobile
flutter create --platforms=android,ios --org com.lifekit --project-name lifekit_mobile .
flutter pub get
flutter analyze
flutter test
flutter run --dart-define=API_URL=http://10.0.2.2:4000/api
```

For an iOS simulator, use `http://127.0.0.1:4000/api`. For a physical device,
use the development computer's LAN address and configure an HTTPS endpoint for
release builds.

## Included

- Material 3 light/dark themes matching the LifeKit design tokens
- GoRouter route tree and persistent five-tab shell
- Riverpod app, task, chat, authentication, and appearance state
- Dio API client with secure bearer-token injection and single-retry refresh
- Authentication and seven-step onboarding flows
- Home, missions, mission detail, tasks list/Kanban, AI Coach, profile,
  analytics, settings, planner, memory, opportunities, marketplace,
  notifications, agents, and support routes
- Responsive, backend-independent sample state for local UI development

The backend base URL is supplied using `--dart-define=API_URL=...`; no secret or
environment-specific hostname is committed to the application.
