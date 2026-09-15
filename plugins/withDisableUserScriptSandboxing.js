// plugins/withDisableUserScriptSandboxing.js
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo config plugin that merges ENABLE_USER_SCRIPT_SANDBOXING = NO
 * into the first existing post_install block in ios/Podfile.
 */
function withDisableUserScriptSandboxing(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const iosPath = config.modRequest.platformProjectRoot;
      const podfilePath = path.join(iosPath, 'Podfile');

      if (!fs.existsSync(podfilePath)) {
        return config;
      }

      let podfile = fs.readFileSync(podfilePath, 'utf8');

      // If already patched, skip
      if (podfile.includes("ENABLE_USER_SCRIPT_SANDBOXING")) {
        return config;
      }

      const sandboxSnippet = `
    # Disable Xcode user script sandboxing for CocoaPods resource scripts
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_config|
        build_config.build_settings['ENABLE_USER_SCRIPT_SANDBOXING'] = 'NO'
      end
    end

    installer.generated_projects.each do |project|
      project.targets.each do |target|
        target.build_configurations.each do |build_config|
          build_config.build_settings['ENABLE_USER_SCRIPT_SANDBOXING'] = 'NO'
        end
      end
    end
`;

      // Find the first `post_install do |installer|` line
      const postInstallRegex = /^(\s*post_install\s+do\s+\|\s*installer\s*\|)/m;
      const match = podfile.match(postInstallRegex);

      if (!match) {
        // Fallback: append a new post_install if none exists
        podfile += `\n\npost_install do |installer|\n${sandboxSnippet}end\n`;
      } else {
        const insertIndex = match.index + match[1].length;
        podfile =
          podfile.slice(0, insertIndex) + '\n' + sandboxSnippet + podfile.slice(insertIndex);
      }

      fs.writeFileSync(podfilePath, podfile, 'utf8');
      return config;
    },
  ]);
}

module.exports = withDisableUserScriptSandboxing;