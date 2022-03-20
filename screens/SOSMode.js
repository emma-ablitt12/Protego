// where the user can enter sos mode, this will send location and notification to guardians.
// can only be disabled by entering password provided during registration

import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Alert} from 'react-native';
import {Icon, Button, Input, Text} from 'react-native-elements';

// firebase imports
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const SOSMode = ({route, navigation}) => {
  console.log('ROUTEPARAMS', route.params.sosMode);
  const [sosMode, setSosMode] = useState(route.params.sosMode);
  const [guardians, setGuardians] = useState([]);
  const [SOSPassword, setSOSPassword] = useState('');

  useEffect(() => {
    console.log('USEFFECT SOSMODE', sosMode);
    getGuardians();
    if (sosMode) {
      const unsubscribe = navigation.addListener('beforeRemove', (e) => {
        e.preventDefault();
      });
      navigation.setOptions({headerShown: false});
      return unsubscribe;
    } else {
      navigation.setOptions({headerShown: true});
    }
  }, [sosMode]);

  const activateSOS = async () => {
    console.log('ACTIVATE SOS FUNCTION USERID', auth().currentUser.uid);
    await firestore()
      .collection('Users')
      .doc(auth().currentUser.uid)
      .update({
        sosMode: true,
      })
      .then((user) => {
        console.log('SOS ACTIVATED');
        setSosMode(true);
      });
    guardians.forEach((guardian) => {
      firestore()
        .collection('Users')
        .doc(guardian.data().userID)
        .collection('Wards')
        .doc(auth().currentUser.uid)
        .update({sosMode: true});
    });
  };

  const deactivateSOS = async () => {
    console.log('DEACTIVATE SOS FUNCTION');
    await firestore()
      .collection('Users')
      .doc(auth().currentUser.uid)
      .get()
      .then((snapshot) => {
        console.log(snapshot.data());
        if (SOSPassword === snapshot.data().password) {
          console.log('PASSWORD MATCH');
          console.log('EXECUTING THIS');
          firestore().collection('Users').doc(auth().currentUser.uid).update({
            sosMode: false,
          });
          guardians.forEach((guardian) => {
            console.log('UPDATING GUARDIAN SOS INFO');
            firestore()
              .collection('Users')
              .doc(guardian.data().userID)
              .collection('Wards')
              .doc(auth().currentUser.uid)
              .update({sosMode: false});
          });
          setSOSPassword('');
          console.log('SET SOS MODE FALSE');
          setSosMode(false);
        } else {
          Alert.alert('Invalid password.');
        }
      });
  };

  const getGuardians = async () => {
    await firestore()
      .collection('Users')
      .doc(auth().currentUser.uid)
      .collection('Guardians')
      .where('accepted', '==', true)
      .get()
      .then((snapshot) => {
        console.log('SOSMODE GETGUARDIANS SNAPSHOT', snapshot.docs);
        if (snapshot.docs.length > 0) {
          setGuardians(snapshot.docs);
        } else {
          setGuardians([]);
          Alert.alert('You need to add a guardian, in order to use SOS mode.');
          navigation.goBack();
        }
      });
  };

  return (
    <View style={styles.container}>
      {!sosMode ? (
        <Button
          accessible={true}
          accessibilityLabel={'Activate SOS mode'}
          accessibilityRole={'button'}
          title="ENTER SOS MODE"
          titleStyle={{fontSize: 28, color: 'white'}}
          buttonStyle={styles.sosButton}
          onPress={() => activateSOS()}
        />
      ) : (
        <>
          <Text h1 accessibilityRole={'text'} style={{bottom: 100}}>
            SOS MODE ACTIVE
          </Text>
          <Input
            accessible={true}
            accessibilityLabel={'ENTER SOS PASSWORD'}
            placeholderTextColor="#ff6e6e"
            placeholder="ENTER SOS PASSWORD"
            inputStyle={{textAlign: 'center', fontSize: 20, paddingLeft: 20}}
            rightIcon={
              <Icon name="lock" type="font-awesome" size={30} color="red" />
            }
            secureTextEntry
            value={SOSPassword}
            onChangeText={(SOSPassword) => {
              setSOSPassword(SOSPassword);
            }}
          />
          <Button
            accessible={true}
            accessibilityLabel={'Deactivate SOS mode'}
            accessibilityRole={'button'}
            title="DEACTIVATE"
            titleStyle={{fontSize: 28, color: 'white'}}
            buttonStyle={styles.sosButton}
            onPress={() => deactivateSOS()}
          />
        </>
      )}
    </View>
  );
};

export default SOSMode;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    width: '100%',
  },
  sosButton: {
    width: 200,
    height: 100,
    fontSize: 10,
    borderWidth: 3,
    borderColor: '#bbbbbb',
    backgroundColor: 'red',
  },
});
