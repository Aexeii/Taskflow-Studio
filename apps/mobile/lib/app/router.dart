import 'package:flutter/material.dart';

import '../features/library/presentation/library_page.dart';

Route<dynamic> buildMobileRoute(RouteSettings settings) {
  return MaterialPageRoute<void>(
    builder: (_) => const LibraryPage(),
    settings: settings,
  );
}
