const withCSS = require('@zeit/next-css');

module.exports = withCSS({
  reactStrictMode: true,
  webpack: (config) => {
    // Fixes npm packages that depend on `fs` module
    config.node = {
      fs: 'empty'
    }
    return config
  },
  exportPathMap: function() {
    return {
      '/': { page: '/' }
    }
  }
});
