const CracoLessPlugin = require('craco-less');

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: { '@primary-color': '#111',  'border-radius-base': '112px' },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};