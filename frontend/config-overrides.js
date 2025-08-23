// This configuration tells Create React App to output the build to the 'docs' folder at the root.
module.exports = {
  webpack: function(config, env) {
    config.output.path = require('path').resolve(__dirname, '../docs');
    return config;
  }
};
