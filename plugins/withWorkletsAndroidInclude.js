const fs = require("fs");
const path = require("path");
const configPlugins = (() => {
  try {
    return require("expo/config-plugins");
  } catch (_error) {
    return require("@expo/config-plugins");
  }
})();

const { withDangerousMod } = configPlugins;

const MARKER_START = "// @generated-worklets-include-start";
const MARKER_END = "// @generated-worklets-include-end";

const WORKLETS_BLOCK = `${MARKER_START}
def workletsDir = new File(rootDir, "../node_modules/react-native-worklets/android")
if (workletsDir.exists()) {
  include(":react-native-worklets")
  project(":react-native-worklets").projectDir = workletsDir
}
${MARKER_END}`;

module.exports = function withWorkletsAndroidInclude(config) {
  return withDangerousMod(config, [
    "android",
    async (mod) => {
      const androidProjectRoot = mod.modRequest.platformProjectRoot;
      const settingsGradlePath = path.join(androidProjectRoot, "settings.gradle");
      const content = fs.readFileSync(settingsGradlePath, "utf8");

      if (content.includes(MARKER_START)) {
        return mod;
      }

      const updated = `${content.trimEnd()}\n\n${WORKLETS_BLOCK}\n`;
      fs.writeFileSync(settingsGradlePath, updated, "utf8");
      return mod;
    },
  ]);
};
