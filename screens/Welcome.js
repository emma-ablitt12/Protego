// welcome screen when a not logged in user opens the app.

import React, {useState, useEffect} from 'react';
import {StyleSheet, View, StatusBar, KeyboardAvoidingView} from 'react-native';
import {Button, Text} from 'react-native-elements';

// firebase imports
import auth from '@react-native-firebase/auth';

const Welcome = ({navigation}) => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  console.log('INITIAL', initializing);

  // https://rnfirebase.io/auth/usage#listening-to-authentication-state
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    console.log('USER BEFORE', user);
    navigation.setOptions({headerShown: false});
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);

    console.log('USER AFTER', user);
    return subscriber && subscriber(); // unsubscribe on unmount
  }, [navigation]);

  if (initializing) {
    setInitializing(false);
    return null;
  }

  if (!user || user === undefined || auth().currentUser === null) {
    console.log('WELCOME NO USER', user);
    return (
      <KeyboardAvoidingView behaviour="padding" style={styles.container}>
        <StatusBar
          barStyle="default"
          backgroundColor="transparent"
          translucent={true}
        />
        <View>
          <Text
            h1
            style={{
              marginBottom: 10,
              alignSelf: 'center',
            }}>
            Protego
          </Text>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 24,
            }}>
            Personal Safety Application
          </Text>
        </View>
        <View style={styles.inputContainer}>
          <Button
            accessible={true}
            accessibilityLabel={'Login'}
            accessibilityRole={'button'}
            onPress={() => navigation.navigate('Login')}
            titleStyle={styles.titleStyle}
            buttonStyle={styles.buttonStyle}
            containerStyle={{marginBottom: 10}}
            type="outline"
            title="Login"
          />
          <Button
            accessible={true}
            accessibilityLabel={'Register'}
            accessibilityRole={'button'}
            onPress={() => navigation.navigate('Registration')}
            titleStyle={styles.titleStyle}
            buttonStyle={styles.buttonStyle}
            containerStyle={{marginTop: 10}}
            type="outline"
            title="Register"
          />
        </View>
        <View style={{height: 100}} />
      </KeyboardAvoidingView>
    );
  }
  if (user) {
    navigation.navigate('Home');
  }
  return <View></View>;
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  inputContainer: {paddingTop: 100, width: 300},
  titleStyle: {
    color: '#f95a25',
  },
  buttonStyle: {borderWidth: 2, borderColor: '#f95a25', height: 60},
});
