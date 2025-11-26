const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return 'com.anonymous.rnshadcn.dev';
  }

  if (IS_PREVIEW) {
    return 'com.anonymous.rnshadcn.preview';
  }

  return 'com.anonymous.rnshadcn';
};

const getAppName = () => {
  if (IS_DEV) {
    return 'rn-shadcn (Dev)';
  }

  if (IS_PREVIEW) {
    return 'rn-shadcn (Preview)';
  }

  return 'rn-shadcn';
};

const getIosUrlScheme = () => {
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  if (iosClientId) {
    return `com.googleusercontent.apps.${iosClientId}`;
  }
  return undefined;
};

export default ({ config }) => {
  const expoConfig = config?.expo || {};

  const plugins = expoConfig.plugins?.map((plugin) => {
    if (Array.isArray(plugin) && plugin[0] === '@react-native-google-signin/google-signin') {
      const iosUrlScheme = getIosUrlScheme();
      if (iosUrlScheme) {
        return [
          plugin[0],
          {
            ...plugin[1],
            iosUrlScheme,
          },
        ];
      }
    }
    return plugin;
  });

  return {
    expo: {
      ...expoConfig,
      name: getAppName(),
      ...(plugins && { plugins }),
      ios: {
        ...expoConfig.ios,
        bundleIdentifier: getUniqueIdentifier(),
      },
      android: {
        ...expoConfig.android,
        package: getUniqueIdentifier(),
      },
    },
  };
};
