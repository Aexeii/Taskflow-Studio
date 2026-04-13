import 'package:flutter/material.dart';

import 'router.dart';
import 'theme.dart';

class MobileApp extends StatelessWidget {
  const MobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Music Player Mobile',
      theme: buildMobileTheme(),
      onGenerateRoute: buildMobileRoute,
      initialRoute: '/',
    );
  }
}
