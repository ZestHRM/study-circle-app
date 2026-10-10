const path = require('path');
const { AndroidConfig, withFinalizedMod } = require('@expo/config-plugins');

const FIREBASE_NOTIFICATION_COLOR =
  'com.google.firebase.messaging.default_notification_color';

function withFirebaseNotificationColorOverride(config) {
  return withFinalizedMod(config, [
    'android',
    async (config) => {
      const manifestPath = path.join(
        config.modRequest.platformProjectRoot,
        'app/src/main/AndroidManifest.xml',
      );
      const manifest = await AndroidConfig.Manifest.readAndroidManifestAsync(manifestPath);
      const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
      const notificationColor = application?.['meta-data']?.find(
        (item) => item.$?.['android:name'] === FIREBASE_NOTIFICATION_COLOR,
      );

      if (notificationColor) {
        AndroidConfig.Manifest.ensureToolsAvailable(manifest);
        notificationColor.$['tools:replace'] = 'android:resource';
        await AndroidConfig.Manifest.writeAndroidManifestAsync(manifestPath, manifest);
      }

      return config;
    },
  ]);
}

module.exports = withFirebaseNotificationColorOverride;
