// screen to add a guardian by entering their phone number

import React, {useState, useLayoutEffect} from 'react';
import {StyleSheet, View, Alert} from 'react-native';
import {Button, Input, Icon} from 'react-native-elements';

// firebase imports
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const GuardiansAdd = ({navigation}) => {
  const [currentUserName, setCurrentUserName] = useState(
    auth().currentUser.displayName,
  );
  const [currentUserNumber, setCurrentUserNumber] = useState(
    auth().currentUser.phoneNumber,
  );
  const [currentUserID, setCurrentUserID] = useState(auth().currentUser.uid);
  const [guardianNumber, setGuardianNumber] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Add Guardian',
    });
  }, [navigation]);

  const addGuardian = () => {
    if (currentUserNumber === guardianNumber) {
      alert('You cannot add your own number');
    } else {
      firestore()
        .collection('Users')
        .where('phoneNumber', '==', guardianNumber)
        .get()
        .then((documentSnapshot) => {
          // console.log('DOCSNAPSHOT', documentSnapshot);
          if (documentSnapshot.size > 0) {
            documentSnapshot.docs.forEach((doc) => {
              console.log('GUARDIANS ADD DOCDATA', doc.data());
              const guardianID = doc.id;
              const guardianName = doc.data().name;
              console.log('GUARDIANID', guardianID);
              console.log('GUARDIANNUM', guardianNumber);
              console.log('GUARDIANAME', guardianName);
              firestore()
                .collection('Users')
                .doc(currentUserID)
                .collection('Guardians')
                .where('phoneNumber', '==', guardianNumber)
                .get()
                .then((documentSnapshot) => {
                  console.log(
                    'GUARDIANS ADD SNAPSHOTDOCS',
                    documentSnapshot.docs,
                  );
                  if (documentSnapshot.size > 0) {
                    documentSnapshot.docs.forEach((doc) => {
                      alert(`${guardianName} is already added as a guardian`);
                    });
                  } else {
                    console.log('Adding user to guardian list');
                    firestore()
                      .collection('Users')
                      .doc(currentUserID)
                      .collection('Guardians')
                      .doc(guardianID)
                      .set({
                        name: guardianName,
                        phoneNumber: guardianNumber,
                        userID: guardianID,
                        accepted: false,
                      })
                      .then(() => {
                        Alert.alert(
                          `${guardianName} was asked to become your guardian!`,
                        );
                      });
                    console.log('Adding user as ward');
                    firestore()
                      .collection('Users')
                      .doc(guardianID)
                      .collection('Wards')
                      .doc(currentUserID)
                      .set({
                        name: currentUserName,
                        phoneNumber: currentUserNumber,
                        userID: currentUserID,
                        accepted: false,
                        sosMode: false,
                      })
                      .then((user) => {
                        navigation.navigate('Guardians');
                      });
                  }
                });
            });
          } else {
            alert('User is not registered.');
          }
        });
    }
  };

  return (
    <View style={styles.container}>
      <Input
        accessible={true}
        accessibilityLabel="Enter phone number"
        placeholder="Phone number"
        value={guardianNumber}
        keyboardType="phone-pad"
        onChangeText={(text) => {
          setGuardianNumber(text);
        }}
        leftIcon={
          <Icon name="phone" type="font-awesome" size={24} color="#f95a25" />
        }
      />
      <Button
        accessible={true}
        accessibilityLabel="Add Guardian"
        accessibilityRole="button"
        titleStyle={styles.titleStyle}
        buttonStyle={styles.buttonStyle}
        title="Add Guardian"
        onPress={() => addGuardian()}
        type="outline"
      />
    </View>
  );
};

export default GuardiansAdd;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  titleStyle: {
    color: '#f95a25',
  },
  buttonStyle: {borderWidth: 2, borderColor: '#f95a25', width: 200},
});
