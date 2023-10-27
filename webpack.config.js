const createExpoWebpackConfigAsync = require("@expo/webpack-config");

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      resolve: {
        extensions: ["*", ".mjs", ".js", ".json"],
      },
      watchOptions: {
        ignored: /node_modules/,
      },
      watch: false,
      module: {
        rules: [
          {
            test: /\.mjs$/,
            include: /node_modules/,
            type: "javascript/auto",
          },
        ],
      },
      babel: {
        dangerouslyAddModulePathsToTranspile: ["@rjsf/material-ui"],
      },
    },
    argv
  );
  return config;
};
