// app.config.js
export default ({ config }) => {
  return {
    ...config,
    name: process.env.APP_NAME || 'GymFlow', // Nome do app
    slug: 'brainiac',
    version: '1.0.0',
    icon: process.env.APP_ICON || './assets/images/icon-gym.png', // Ícone do app
    scheme: 'brainiac',
    userInterfaceStyle: 'automatic',
    ios: {
      supportsTablet: true,
    },
    android: {
      package: process.env.APP_PACKAGE || 'brainiac.workout_.dev', // Package único para cada build
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      adaptiveIcon: {
        foregroundImage: './assets/images/icon-gym.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
        backgroundColor: '#E6F4FE',
        useNextNotificationsApi: true,
      },
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: 'ae564e5e-933c-4df7-ae5d-6d450cfc630a',
      },
    },
  };
};
