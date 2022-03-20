import 'react-native-gesture-handler/jestSetup';
jest.useFakeTimers();


jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  Reanimated.default.call = () => {};

  return Reanimated;
});

jest.mock('@react-navigation/stack', () => {
  return {
    createDrawerNavigator: jest.fn(),
    createStackNavigator: jest.fn(),
    setOptions: jest.fn(),
    useNavigation: jest.fn(),
    navigation: {
      navigate: jest.fn().mockImplementation((x) => x),
      setOptions: jest.fn(),
    },
    Navigator: jest.fn(),
  };
});

jest.mock('@react-navigation/native', () => {
  return {
    createAppContainer: jest
      .fn()
      .mockReturnValue(function NavigationContainer(props) {
        return null;
      }),
    createDrawerNavigator: jest.fn(),
    createStackNavigator: jest.fn(),
    setOptions: jest.fn(),
    useNavigation: jest.fn(),
    StackActions: {
      replace: jest
        .fn()
        .mockImplementation((x) => ({...x, type: 'Navigation/REPLACE'})),
      reset: jest.fn(),
    },
    Navigator: jest.fn(),
    navigation: {
      navigate: jest.fn().mockImplementation((x) => x),
      setOptions: jest.fn(),
    },
  };
});

jest.mock('@react-navigation/bottom-tabs', () => {
  return {
    createAppContainer: jest
      .fn()
      .mockReturnValue(function NavigationContainer(props) {
        return null;
      }),
    createDrawerNavigator: jest.fn(),
    createBottomTabNavigator: jest.fn(),
    createStackNavigator: jest.fn(),
    setOptions: jest.fn(),
    useNavigation: jest.fn(),
    StackActions: {
      replace: jest
        .fn()
        .mockImplementation((x) => ({...x, type: 'Navigation/REPLACE'})),
      reset: jest.fn(),
    },
    
    Navigator: jest.fn(),
    navigation: {
      navigate: jest.fn().mockImplementation((x) => x),
      setOptions: jest.fn(),
    },
  };
});

// jest.mock('@react-navigation/native', () => {
//   const actualNav = jest.requireActual('@react-navigation/native');
//   return {
//     ...actualNav,
//     useNavigation: () => ({}),
//   };
// });

// jest.mock('@react-navigation/stack', () => {
//   const actualNav = jest.requireActual('@react-navigation/stack');
//   return {
//     ...actualNav,
//     createStackNavigator: () => ({}),
//   };
// });
