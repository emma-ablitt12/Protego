// screen to display the users guardians.

import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Alert, Pressable} from 'react-native';
import {Button, ListItem} from 'react-native-elements';

// firebase imports
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const ShowGuardians = ({navigation}) => {
  const [userID, setUserID] = useState(auth().currentUser.uid);
  const [guardians, setGuardians] = useState([]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('Users')
      .doc(userID)
      .collection('Guardians')
      .where('accepted', '==', true)
      .onSnapshot((documentSnapshot) => {
        console.log('SHOW GUARDIANS SNAP', documentSnapshot.docs);
        if (documentSnapshot.docs.length > 0) {
          setGuardians(documentSnapshot.docs);
        } else {
          setGuardians([]);
        }
      });
    return () => {
      unsubscribe();
    };
  }, []);

  const removeGuardian = (guardian) => {
    const guardianName = guardian.data().name;
    Alert.alert(`Do you want to remove ${guardianName}?`, '', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: () => {
          firestore()
            .collection('Users')
            .doc(userID)
            .collection('Guardians')
            .doc(guardian.id)
            .delete();

          firestore()
            .collection('Users')
            .doc(guardian.id)
            .collection('Wards')
            .doc(userID)
            .delete()
            .then(() => {
              console.log(`${guardianName} was deleted`);
              alert(`${guardianName} was deleted`);
            });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        {guardians
          ? guardians.map((guardian) => {
              return (
                <Pressable
                  key={guardian.id}
                  style={{width: '100%'}}
                  onLongPress={() => {
                    removeGuardian(guardian);
                  }}>
                  <ListItem
                    bottomDivider
                    containerStyle={{
                      borderBottomColor: '#f95a25',
                      borderBottomWidth: 2,
                    }}
                    style={{width: '100%'}}>
                    <ListItem.Content>
                      <ListItem.Title>{guardian.data().name}</ListItem.Title>
                      <ListItem.Subtitle>
                        {guardian.data().phoneNumber}
                      </ListItem.Subtitle>
                    </ListItem.Content>
                  </ListItem>
                </Pressable>
              );
            })
          : null}
      </View>
      <Button
        accessible={true}
        accessibilityLabel={'Add Guardian'}
        accessibilityRole={'button'}
        title="Add Guardian"
        onPress={() => navigation.navigate('Add Guardian')}
        titleStyle={styles.titleStyle}
        buttonStyle={styles.buttonStyle}
        containerStyle={{
          alignContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          alignSelf: 'center',
        }}
        type="outline"
      />
    </View>
  );
};

export default ShowGuardians;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    width: '100%',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#F8F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  titleStyle: {
    color: '#f95a25',
  },
  buttonStyle: {
    borderWidth: 2,
    borderColor: '#f95a25',
    height: 50,
    width: 200,
  },
});
