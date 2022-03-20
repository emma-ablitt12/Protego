// const mockModule = jest.mock('@react-navigation/native');
// module.exports = mockModule;

// const mockModule = jest.mock('@react-navigation/native', () => {
//   return {
//     createAppContainer: jest
//       .fn()
//       .mockReturnValue(function NavigationContainer(props) {
//         return null;
//       }),
//     createDrawerNavigator: jest.fn(),
//     createStackNavigator: jest.fn(),
//     StackActions: {
//       replace: jest
//         .fn()
//         .mockImplementation((x) => ({...x, type: 'Navigation/REPLACE'})),
//       reset: jest.fn(),
//     },
//     navigation: {
//       navigate: jest.fn().mockImplementation((x) => x),
//       setOptions: jest.fn(),
//     },
//   };
// });
// module.exports = mockModule;
