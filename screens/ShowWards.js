// screen to display a guardian's wards (users that can enter sos mode).

import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Alert, Pressable} from 'react-native';
import {ListItem, Icon} from 'react-native-elements';

// firebase imports
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const ShowWards = ({navigation}) => {
  const [userID, setUserID] = useState(auth().currentUser.uid);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('Users')
      .doc(userID)
      .collection('Wards')
      .where('accepted', '==', true)
      .onSnapshot((documentSnapshot) => {
        console.log('SHOW WARDS SNAP DOCS', documentSnapshot.docs);
        if (documentSnapshot.docs.length > 0) {
          setWards(documentSnapshot.docs);
        } else {
          setWards([]);
        }
      });
    return () => {
      unsubscribe();
    };
  }, []);

  const removeWard = (ward) => {
    const wardName = ward.data().name;
    Alert.alert(`Do you want to remove ${wardName}?`, '', [
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
            .collection('Wards')
            .doc(ward.id)
            .delete();

          firestore()
            .collection('Users')
            .doc(ward.id)
            .collection('Guardians')
            .doc(userID)
            .delete()
            .then(() => {
              console.log(`${wardName} was deleted`);
              alert(`${wardName} was deleted`);
            });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {wards
        ? wards.map((ward) => {
            return (
              <Pressable
                key={ward.id}
                style={{width: '100%'}}
                onPress={() => {
                  navigation.navigate('Map Screen', {ward});
                }}
                onLongPress={() => {
                  removeWard(ward);
                }}>
                {ward.data().sosMode ? (
                  <ListItem
                    style={{
                      width: '100%',
                      paddingBottom: 5,
                    }}
                    containerStyle={{borderColor: 'red', borderWidth: 2}}>
                    <ListItem.Content>
                      <ListItem.Title style={{color: 'red'}}>
                        {ward.data().name}
                      </ListItem.Title>
                      <ListItem.Subtitle>
                        {ward.data().phoneNumber}
                      </ListItem.Subtitle>
                    </ListItem.Content>
                    <Icon
                      name="exclamation-triangle"
                      type={'font-awesome'}
                      size={40}
                      color="red"
                    />
                  </ListItem>
                ) : (
                  <ListItem
                    bottomDivider
                    containerStyle={{
                      borderBottomColor: '#f95a25',
                      borderBottomWidth: 2,
                    }}
                    style={{width: '100%', paddingBottom: 5}}>
                    <ListItem.Content>
                      <ListItem.Title>{ward.data().name}</ListItem.Title>
                      <ListItem.Subtitle>
                        {ward.data().phoneNumber}
                      </ListItem.Subtitle>
                    </ListItem.Content>
                  </ListItem>
                )}
              </Pressable>
            );
          })
        : null}
    </View>
  );
};

export default ShowWards;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    width: '100%',
  },
});
