abstract class SettingsRepository {
  Future<void> saveVolume(double volume);
  Future<double?> loadVolume();
}
