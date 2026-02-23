const fs = require("fs");
const path = require("path");
const configPlugins = (() => {
  try {
    return require("expo/config-plugins");
  } catch (_error) {
    return require("@expo/config-plugins");
  }
})();
const { withAndroidManifest, withDangerousMod } = configPlugins;

function buildNetworkSecurityXml(domains) {
  const uniqueDomains = Array.from(
    new Set(
      (domains || [])
        .map((item) => String(item || "").trim())
        .filter((item) => item.length > 0)
    )
  );

  const safeDomains = uniqueDomains.length > 0 ? uniqueDomains : ["crmapi.v3rii.com"];

  const domainLines = safeDomains
    .map((domain) => `        <domain includeSubdomains="true">${domain}</domain>`)
    .join("\n");

  return `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true" />
    <domain-config cleartextTrafficPermitted="true">
${domainLines}
    </domain-config>
</network-security-config>
`;
}

module.exports = function withAndroidNetworkSecurityConfig(config, props = {}) {
  const domains = Array.isArray(props.domains) ? props.domains : [];

  config = withAndroidManifest(config, (mod) => {
    const application = mod.modResults?.manifest?.application?.[0];
    if (!application) return mod;

    application.$ = application.$ || {};
    application.$["android:networkSecurityConfig"] = "@xml/network_security_config";
    application.$["android:usesCleartextTraffic"] = "true";

    return mod;
  });

  config = withDangerousMod(config, [
    "android",
    async (mod) => {
      const androidProjectRoot = mod.modRequest.platformProjectRoot;
      const targetFile = path.join(
        androidProjectRoot,
        "app",
        "src",
        "main",
        "res",
        "xml",
        "network_security_config.xml"
      );

      fs.mkdirSync(path.dirname(targetFile), { recursive: true });
      fs.writeFileSync(targetFile, buildNetworkSecurityXml(domains), "utf8");
      return mod;
    },
  ]);

  return config;
};
