// screen to display requests that have been sent to the guardian

import React, {useEffect, useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Icon, ListItem} from 'react-native-elements';

// firebase imports
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const Requests = ({navigation}) => {
  const [userID, setUserID] = useState(auth().currentUser.uid);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('Users')
      .doc(userID)
      .collection('Wards')
      .where('accepted', '==', false)
      .onSnapshot((documentSnapshot) => {
        console.log('REQUESTS SNAPSHOT', documentSnapshot);
        if (documentSnapshot.docs.length > 0) {
          setRequests(documentSnapshot.docs);
        } else {
          setRequests([]);
        }
      });
    return () => {
      unsubscribe();
    };
  }, [requests, userID]);

  const rejectRequest = (request) => {
    const guardianID = request.id;
    firestore()
      .collection('Users')
      .doc(userID)
      .collection('Wards')
      .doc(guardianID)
      .delete();

    firestore()
      .collection('Users')
      .doc(guardianID)
      .collection('Guardians')
      .doc(userID)
      .delete()
      .then(() => {
        console.log('Request rejected');
        navigation.navigate('Guardians');
      });
  };

  const acceptRequest = (request) => {
    const guardianID = request.id;
    firestore()
      .collection('Users')
      .doc(userID)
      .collection('Wards')
      .doc(guardianID)
      .update({
        accepted: true,
      });

    firestore()
      .collection('Users')
      .doc(guardianID)
      .collection('Guardians')
      .doc(userID)
      .update({
        accepted: true,
      })
      .then(() => {
        alert(`You are now ${request.data().name}'s guardian!`);
        navigation.navigate('Wards');
      });
  };

  return (
    <View style={styles.container}>
      {requests
        ? requests.map((request) => {
            return (
              <ListItem
                key={request.id}
                bottomDivider
                containerStyle={{
                  borderBottomColor: '#f95a25',
                  borderBottomWidth: 2,
                }}
                style={{width: '100%'}}>
                <ListItem.Content
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  <View accessible={true}>
                    <ListItem.Title>
                      {request.data().name} {request.data().phoneNumber}
                    </ListItem.Title>
                    <ListItem.Subtitle>
                      wants you to become their guardian!
                    </ListItem.Subtitle>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity
                      accessible={true}
                      accessibilityLabel={'Accept request'}
                      style={{paddingRight: 10}}
                      onPress={() => acceptRequest(request)}>
                      <Icon
                        color="green"
                        name="check-circle-outline"
                        type="MaterialCommunityIcons"
                        size={42}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      accessible={true}
                      accessibilityLabel={'Reject request'}
                      onPress={() => rejectRequest(request)}>
                      <Icon
                        color="red"
                        name="highlight-remove"
                        type="MaterialIcons"
                        size={42}
                      />
                    </TouchableOpacity>
                  </View>
                </ListItem.Content>
              </ListItem>
            );
          })
        : null}
    </View>
  );
};

export default Requests;

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
