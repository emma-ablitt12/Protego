// const mockModule = jest.mock('@react-navigation/bottom-tabs');
// module.exports = mockModule;

// const mockModule = jest.mock('@react-navigation/bottom-tabs', () => {
//   return {
//     createAppContainer: jest
//       .fn()
//       .mockReturnValue(function NavigationContainer(props) {
//         return null;
//       }),
//     createDrawerNavigator: jest.fn(),
//     createBottomTabNavigator: jest.fn(),
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
