/** @type {import('@storybook/html-webpack5').StorybookConfig} */
const config = {
  stories: [
    '../src/sdf2d/atoms/**/*.stories.js',
    '../src/sdf2d/molecules/**/*.stories.js',
    '../src/sdf2d/organisms/**/*.stories.js',
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
