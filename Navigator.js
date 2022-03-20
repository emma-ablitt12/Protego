import 'react-native-gesture-handler';
import React from 'react';
import Welcome from '../screens/Welcome';
import Home from '../screens/Home';
import Login from '../screens/Login';
import Registration from '../screens/Registration';
import ShowGuardians from '../screens/ShowGuardians';
import GuardiansAdd from '../screens/GuardiansAdd';
import ShowWards from '../screens/ShowWards';
import Requests from '../screens/Requests';
import Settings from '../screens/Settings';
import FakeCall from '../screens/FakeCall';
import MapScreen from '../screens/MapScreen';
import SOSMode from '../screens/SOSMode';
import EmergencyText from '../screens/EmergencyText';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const globalScreenOptions = {
  headerStyle: {backgroundColor: '#282a36'},
  headerTintColor: 'white',
  headerTitleAlign: 'center',
  headerTitleAllowFontScaling: true,
  headerBackAllowFontScaling: true,
};

const GuardianManager = (props) => {
  return (
    <Tab.Navigator
      tabBarOptions={{
        showLabel: true,
        style: {borderTopWidth: 2, borderTopColor: '#f95a25'},
        activeTintColor: '#f95a25',
        labelStyle: {fontSize: 20, padding: 15},
      }}>
      <Tab.Screen
        options={{headerShown: false}}
        name="Guardians"
        component={ShowGuardians}
      />
      <Tab.Screen
        options={{headerShown: false}}
        name="Wards"
        component={ShowWards}
      />
      <Tab.Screen
        options={{headerShown: false}}
        name="Requests"
        component={Requests}
      />
    </Tab.Navigator>
  );
};

const Navigator = (props) => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={globalScreenOptions}
        initialRouteName={'Welcome Screen'}>
        <Stack.Screen
          name={'Welcome'}
          component={Welcome}
          options={{
            headerBackAccessibilityLabel: 'Navigate back to welcome screen.',
          }}
        />
        <Stack.Screen name={'Home'} component={Home} />
        <Stack.Screen
          name={'Login'}
          component={Login}
          options={{
            headerBackAccessibilityLabel: 'Navigate back to welcome screen.',
          }}
        />
        <Stack.Screen
          name={'Registration'}
          component={Registration}
          options={{
            headerBackAccessibilityLabel: 'Navigate back to welcome screen.',
          }}
        />
        <Stack.Screen
          name={'Guardian Manager'}
          component={GuardianManager}
          options={{
            headerBackAccessibilityLabel: 'Navigate back to home screen.',
          }}
        />
        <Stack.Screen
          name={'Add Guardian'}
          component={GuardiansAdd}
          options={{
            headerBackAccessibilityLabel: 'Navigate back to guardian manager screen.',
          }}
        />
        <Stack.Screen
          name={'Settings'}
          component={Settings}
          options={{
            headerBackAccessibilityLabel: 'Navigate back to home screen.',
          }}
        />
        <Stack.Screen name={'Fake Call'} component={FakeCall} />
        <Stack.Screen
          name={'Map Screen'}
          component={MapScreen}
          options={{
            headerBackAccessibilityLabel: 'Navigate back to guardian manager screen.',
          }}
        />
        <Stack.Screen
          name={'Emergency Text'}
          component={EmergencyText}
          options={{
            headerBackAccessibilityLabel: 'Navigate back to home screen.',
          }}
        />
        <Stack.Screen
          name={'SOS Mode'}
          component={SOSMode}
          options={{
            headerBackAccessibilityLabel: 'Navigate back to home screen.',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigator;
