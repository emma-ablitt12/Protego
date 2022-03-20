// fake call is a security feature allowing users to
// quickly exit uncomfortable situations

import React, {useState, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {Image} from 'react-native-elements';
import NotificationSounds, {
  playSampleSound,
  stopSampleSound,
} from 'react-native-notification-sounds';

const FakeCall = ({navigation}) => {
  const [activated, setActivated] = useState(true);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    navigation.setOptions({headerShown: false});
    if (activated) {
      playRingtone();
    }
    return () => {
      stopSampleSound();
    };
  }, [activated]);

  const playRingtone = () => {
    NotificationSounds.getNotifications('ringtone').then((soundsList) => {
      playSampleSound(soundsList[1]);
    });
  };

  return (
    <View style={styles.container}>
      <Image
        accessible={true}
        accessibilityLabel={'Fake Call image'}
        accessibilityHint={
          'Press to stop ringtone, Long Press to go back to home screen'
        }
        onPress={() => {
          setPressed(true);
          stopSampleSound();
        }}
        onLongPress={() => navigation.navigate('Home')}
        source={
          pressed
            ? require('../assets/fakeCall2.png')
            : require('../assets/fakeCall.png')
        }
        containerStyle={{width: '100%', height: '100%'}}
        style={{resizeMode: 'stretch', justifyContent: 'center'}}
        transition={true}
      />
    </View>
  );
};

export default FakeCall;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
