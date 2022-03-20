// within settings users can change their password/phone number. Can also delete their account.

import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Alert, BackHandler} from 'react-native';

// firebase exports
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// https://reactnativeelements.com/docs/overlay/
import {Overlay, Button, Input, Icon} from 'react-native-elements';

const Settings = ({navigation, route}) => {
  const [userID, setUserID] = useState(auth().currentUser.uid);
  const [guardians, setGuardians] = useState([]);
  const [wards, setWards] = useState([]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [passwordOverlayVisible, setPasswordOverlayVisible] = useState(false);
  const [phoneOverlayVisible, setPhoneOverlayVisible] = useState(false);
  const [deleteOverlayVisible, setDeleteOverlayVisible] = useState(false);

  const togglePasswordOverlay = () => {
    setPasswordOverlayVisible(!passwordOverlayVisible);
  };
  const togglePhoneOverlay = () => {
    setPhoneOverlayVisible(!phoneOverlayVisible);
  };
  const toggleDeleteOverlay = () => {
    setDeleteOverlayVisible(!deleteOverlayVisible);
  };

  useEffect(() => {
    getWards();
    getGuardians();
    console.log('CONFIRM', confirm);
    console.log('PHONE', auth().currentUser.phoneNumber);
    navigation.setOptions({headerShown: true});
    // const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    // return subscriber; // unsubscribe on unmount
  }, [confirm, navigation]);

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
        }
      });
  };

  const getWards = async () => {
    await firestore()
      .collection('Users')
      .doc(auth().currentUser.uid)
      .collection('Wards')
      .where('accepted', '==', true)
      .get()
      .then((snapshot) => {
        console.log('SOSMODE GETWARDS SNAPSHOT', snapshot.docs);
        if (snapshot.docs.length > 0) {
          setWards(snapshot.docs);
        } else {
          setWards([]);
        }
      });
  };

  const verifyPhoneNumber = async () => {
    const confirmation = await auth().verifyPhoneNumber(newPhoneNumber);
    console.log('CONFIRMATION', confirmation);
    setConfirm(confirmation);
  };

  const confirmCode = async () => {
    try {
      const credential = auth.PhoneAuthProvider.credential(
        confirm.verificationId,
        code,
      );
      await auth().currentUser.updatePhoneNumber(credential);
      console.log(auth().currentUser.phoneNumber);
      console.log('USERID', userID);
      await firestore()
        .collection('Users')
        .doc(userID)
        .update({phoneNumber: auth().currentUser.phoneNumber})
        .then(console.log('Updated User Entry'));

      guardians.forEach(async (guardian) => {
        console.log('GUARDIAN', guardian.data());
        await firestore()
          .collection('Users')
          .doc(guardian.data().userID)
          .collection('Wards')
          .doc(userID)
          .update({phoneNumber: auth().currentUser.phoneNumber})
          .then(console.log('Updated Guardian'));
      });
      Alert.alert('You have updated your number.');
      navigation.replace('Settings');
    } catch (error) {
      if (error.code === 'auth/invalid-verification-code') {
        Alert.alert('Invalid code.');
        console.log('Invalid code.');
      } else {
        console.log('Account linking error', error);
      }
    }
  };

  const changePassword = async () => {
    try {
      if (newPassword !== '' && confirmNewPassword !== '') {
        if (newPassword === confirmNewPassword) {
          await firestore()
            .collection('Users')
            .doc(userID)
            .update({password: newPassword})
            .then(() => {
              Alert.alert('You have changed your password');
              navigation.replace('Settings');
            });
        } else {
          Alert.alert('Passwords must match.');
        }
      } else {
        Alert.alert('Password fields cannot be empty.');
      }
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  const getOTP = async () => {
    const confirmation = await auth().verifyPhoneNumber(
      auth().currentUser.phoneNumber,
    );
    console.log('CONFIRMATION', confirmation);
    setConfirm(confirmation);
  };

  const deleteAccount = async () => {
    try {
      if (code.length === 6) {
        const credential = auth.PhoneAuthProvider.credential(
          confirm.verificationId,
          code,
        );
        await auth().currentUser.reauthenticateWithCredential(credential);
        // remove user from ward list from each guardian
        guardians.forEach(async (guardian) => {
          console.log('GUARDIAN', guardian.data());
          await firestore()
            .collection('Users')
            .doc(guardian.data().userID)
            .collection('Wards')
            .doc(userID)
            .delete()
            .then(console.log('Removed from wards list'));

          await firestore()
            .collection('Users')
            .doc(userID)
            .collection('Guardians')
            .doc(guardian.data().userID)
            .delete()
            .then(console.log('Removed from guardian list'));
        });

        wards.forEach(async (ward) => {
          console.log('WARDS', ward.data());
          await firestore()
            .collection('Users')
            .doc(ward.data().userID)
            .collection('Guardians')
            .doc(userID)
            .delete()
            .then(console.log('Removed from wards list'));

          await firestore()
            .collection('Users')
            .doc(userID)
            .collection('Wards')
            .doc(ward.data().userID)
            .delete()
            .then(console.log('Removed from guardian list'));
        });

        // delete user data
        await firestore()
          .collection('Users')
          .doc(userID)
          .delete()
          .then(() => {
            console.log('REMOVED FROM AUTH');
            console.log('Removed from database');
          });
        toggleDeleteOverlay();
        await auth().currentUser.delete();
        BackHandler.exitApp();
        // navigation.replace('Welcome');
      } else {
        Alert.alert('Please enter a 6 digit OTP code.');
      }
    } catch (error) {
      if (error.code === 'auth/invalid-verification-code') {
        console.log('Invalid code.');
        Alert.alert('Invalid verification code');
      } else {
        console.log(error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={{width: 300}}>
        {/* change phone number */}
        <Button
          accessible={true}
          accessibilityLabel={'Change Phone Number'}
          accessibilityRole={'button'}
          containerStyle={{
            marginBottom: 10,
            justifyContent: 'space-between',
          }}
          buttonStyle={{backgroundColor: '#f95a25'}}
          iconContainerStyle={{right: 50}}
          icon={{
            name: 'phone',
            type: 'font-awesome',
            size: 24,
            color: 'white',
          }}
          iconRight
          title="Change Phone Number"
          onPress={togglePhoneOverlay}
        />
        <Overlay
          overlayStyle={{
            flex: 1,
            margin: '50%',
            width: 300,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          isVisible={phoneOverlayVisible}
          onBackdropPress={togglePhoneOverlay}>
          <Input
            accessible={true}
            accessibilityLabel={'Phone num. w/ country code'}
            leftIcon={
              <Icon
                name="phone"
                type="font-awesome"
                size={24}
                color="#f95a25"
              />
            }
            placeholder="Phone num. w/ country code"
            keyboardType="phone-pad"
            value={newPhoneNumber}
            onChangeText={setNewPhoneNumber}
            maxLength={15}
          />
          <Input
            accessible={true}
            accessibilityLabel={
              confirm ? 'Enter Verification code' : 'Press Send Code'
            }
            placeholder={
              confirm ? 'Enter Verification code' : 'Press Send Code'
            }
            leftIcon={
              <Icon
                name="key"
                type="font-awesome-5"
                size={24}
                color="#f95a25"
              />
            }
            value={code}
            keyboardType="numeric"
            onChangeText={setCode}
            maxLength={6}
            editable={confirm ? true : false}
          />
          <Button
            accessible={true}
            accessibilityLabel={confirm ? 'Verify Code' : 'Send Code'}
            accessibilityRole={'button'}
            containerStyle={styles.buttonContainer}
            titleStyle={styles.titleStyle}
            buttonStyle={styles.buttonStyle}
            type="outline"
            title={confirm ? 'Verify Code' : 'Send Code'}
            onPress={confirm ? confirmCode : verifyPhoneNumber}
          />
        </Overlay>
        {/* change password */}
        <Button
          accessible={true}
          accessibilityLabel={'Change Password'}
          accessibilityRole={'button'}
          containerStyle={{marginTop: 10, justifyContent: 'space-between'}}
          buttonStyle={{backgroundColor: '#f95a25'}}
          iconContainerStyle={{right: 50}}
          icon={{
            name: 'lock',
            type: 'font-awesome',
            size: 24,
            color: 'white',
          }}
          iconRight
          title="Change SOS Password"
          onPress={togglePasswordOverlay}
        />
        <Overlay
          overlayStyle={{
            flex: 1,
            margin: '30%',
            width: 300,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          isVisible={passwordOverlayVisible}
          onBackdropPress={togglePasswordOverlay}>
          <Input
            accessible={true}
            accessibilityLabel={'Enter New Password'}
            leftIcon={
              <Icon name="lock" type="font-awesome" size={24} color="#f95a25" />
            }
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <Input
            accessible={true}
            accessibilityLabel={'Confirm New Password'}
            leftIcon={
              <Icon name="lock" type="font-awesome" size={24} color="#f95a25" />
            }
            placeholder="Confirm Password"
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
          />
          <Button
            accessible={true}
            accessibilityLabel={'Change password'}
            accessibilityRole={'button'}
            containerStyle={styles.buttonContainer}
            titleStyle={styles.titleStyle}
            buttonStyle={styles.buttonStyle}
            type="outline"
            title="Change password"
            onPress={changePassword}
          />
        </Overlay>
        {/* delete account */}
        <Button
          accessible={true}
          accessibilityLabel={'Delete Account'}
          accessibilityRole={'button'}
          containerStyle={{marginTop: 100, justifyContent: 'space-between'}}
          iconContainerStyle={{right: 50}}
          titleStyle={{color: 'red'}}
          buttonStyle={styles.buttonStyle}
          icon={{
            name: 'warning',
            type: 'font-awesome',
            size: 24,
            color: 'red',
          }}
          type="outline"
          raised
          iconRight
          title="Delete Account"
          onPress={toggleDeleteOverlay}
        />
        <Overlay
          overlayStyle={{
            flex: 1,
            margin: '50%',
            width: 300,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          isVisible={deleteOverlayVisible}
          onBackdropPress={toggleDeleteOverlay}>
          <Input
            placeholder={
              confirm ? 'Enter Verification code' : 'Press Send Code'
            }
            leftIcon={
              <Icon
                name="key"
                type="font-awesome-5"
                size={24}
                color="#f95a25"
              />
            }
            value={code}
            keyboardType="numeric"
            onChangeText={setCode}
            maxLength={6}
            editable={confirm ? true : false}
          />
          <Button
            accessible={true}
            accessibilityLabel={confirm ? 'DELETE ACCOUNT' : 'Send Code'}
            accessibilityRole={'button'}
            containerStyle={styles.buttonContainer}
            titleStyle={confirm ? {color: 'white'} : styles.titleStyle}
            buttonStyle={
              confirm
                ? {
                    backgroundColor: 'red',
                    borderWidth: 4,
                    borderColor: '#5D0914',
                  }
                : styles.buttonStyle
            }
            type={confirm ? 'solid' : 'outline'}
            raised
            title={confirm ? 'DELETE ACCOUNT' : 'Send Code'}
            onPress={confirm ? deleteAccount : getOTP}
          />
        </Overlay>
      </View>
    </View>
  );
};
export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  titleStyle: {
    color: '#f95a25',
  },
  buttonContainer: {width: '75%'},
  buttonStyle: {borderWidth: 2, borderColor: '#f95a25'},
  deleteTitleStyle: {color: 'red'},
  deleteButtonStyle: {borderWidth: 2, borderColor: 'red'},
});
