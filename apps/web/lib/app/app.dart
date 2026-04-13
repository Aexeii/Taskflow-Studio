import 'package:flutter/material.dart';

import 'router.dart';
import 'theme.dart';

class WebApp extends StatelessWidget {
  const WebApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Aero Music Web',
      debugShowCheckedModeBanner: false,
      theme: buildWebTheme(),
      onGenerateRoute: buildWebRoute,
      initialRoute: '/',
    );
  }
}
