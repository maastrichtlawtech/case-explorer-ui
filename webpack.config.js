var createExpoWebpackConfigAsync = require("@expo/webpack-config");
module.exports = async function (env, argv) {
  var defaultConfig = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ["@ui-kitten/components"],
      },
    },
    argv
  );
  return defaultConfig;
};