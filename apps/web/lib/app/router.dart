import 'package:flutter/material.dart';

import '../features/home/presentation/home_page.dart';

Route<dynamic> buildWebRoute(RouteSettings settings) {
  return MaterialPageRoute<void>(
    builder: (_) => const HomePage(),
    settings: settings,
  );
}
