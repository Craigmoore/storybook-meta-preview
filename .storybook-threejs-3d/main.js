/** @type {import('@storybook/html-webpack5').StorybookConfig} */
const config = {
  stories: [
    '../src/threejs-3d/atoms/**/*.stories.js',
    '../src/threejs-3d/molecules/**/*.stories.js',
  ],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/html-webpack5',
    options: {},
  },
  webpackFinal: async (config) => {
    config.devServer = {
      ...config.devServer,
      client: {
        ...config.devServer?.client,
        webSocketURL: 'auto://0.0.0.0:0/ws',
      },
    };
    return config;
  },
};

export default config;
