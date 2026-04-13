import 'package:flutter/material.dart';

import 'router.dart';
import 'theme.dart';

class DesktopApp extends StatelessWidget {
  const DesktopApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Music Player Desktop',
      theme: buildDesktopTheme(),
      onGenerateRoute: buildDesktopRoute,
      initialRoute: '/',
    );
  }
}
