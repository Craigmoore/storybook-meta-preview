/** @type {import('@storybook/html-webpack5').StorybookConfig} */
const config = {
  stories: [
    '../src/altspace-ui/atoms/**/*.stories.js',
    '../src/altspace-ui/molecules/**/*.stories.js',
    '../src/altspace-ui/organisms/**/*.stories.js',
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
