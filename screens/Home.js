// screen showed when user is logged in
/* referring to the following:
https://rnfirebase.io/firestore/usage
https://rnfirebase.io/firestore/auth
*/

import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Alert,
  TouchableOpacity,
  Pressable,
  StatusBar,
} from 'react-native';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {Text, Icon} from 'react-native-elements';
import PushNotification from 'react-native-push-notification';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

export default class Home extends Component {
  constructor() {
    super();
    this.state = {
      // userID: auth().currentUser.uid,
      user: null,
      sosMode: false,
    };
  }

  getWards = () => {
    console.log(auth().currentUser.uid);
    this.unsubscribeWards = firestore()
      .collection('Users')
      .doc(auth().currentUser.uid)
      .collection('Wards')
      .where('sosMode', '==', true)
      .onSnapshot((snapshot) => {
        snapshot.forEach((snap) => {
          console.log('APPJS GET WARDS', snap.data().userID);
          PushNotification.localNotification({
            channelId: 'notifications',
            message: `${snap.data().name} IS IN SOS MODE!`,
            soundName: 'default',
            vibrate: true,
          });
        });
      });
  };

  checkUser = async () => {
    const user = await auth().currentUser;
    if (user) {
      this.setState({user: user});
      console.log('YES USER', this.state.user);
    } else {
      this.setState({user: null});
      console.log('NO USER', this.state.user);
    }
  };

  componentDidMount() {
    const user = auth().currentUser;
    // this.checkUser();
    // this.setState({user: user});
    // this.setState(function (prevState, props) {
    //   return {user: user};
    // });
    console.log('CURRENT USER', auth().currentUser);
    if (user) {
      this.getWards();
      console.log('YES USER');
      this.unsub = firestore()
        .collection('Users')
        .doc(auth().currentUser.uid)
        .onSnapshot((snapshot) => {
          if (snapshot.data().sosMode === true) {
            console.log('SOSMODE?', this.state.sosMode);
            this.setState(function (prevState, props) {
              return {sosMode: true};
            });
          } else {
            this.setState(function (prevState, props) {
              return {sosMode: false};
            });
          }
        });

      this.props.navigation.setOptions(
        {
          title: 'Protego',
          headerLeft: () => (
            <View style={{marginLeft: 20}}>
              <Pressable
                accessible={true}
                accessibilityRole="button"
                onPress={this.signOutUser}>
                <Text style={{color: 'white'}}>Sign Out</Text>
              </Pressable>
            </View>
          ),
        },
        // disable swiping back
        // this.props.navigation.addListener('beforeRemove', (e) => {
        //   e.preventDefault();
        //   Alert.alert('Sign out?', 'Do you want to sign out?', [
        //     {text: 'No', style: 'cancel', onPress: () => {}},
        //     {
        //       text: 'Yes',
        //       style: 'destructive',
        //       onPress: () => this.props.navigation.dispatch(e.data.action),
        //     },
        //   ]);
        // }),
      );

      // ref https://github.com/mauron85/react-native-background-geolocation
      BackgroundGeolocation.configure({
        desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
        stationaryRadius: 3,
        distanceFilter: 3,
        notificationTitle: 'SOS Mode',
        notificationText:
          'Your location is being transmitted to your guardians.',
        debug: false,
        startOnBoot: false,
        stopOnTerminate: true,
        locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
        interval: 5000,
        fastestInterval: 12000,
        activitiesInterval: 10000,
        stopOnStillActivity: false,
      });

      BackgroundGeolocation.on('location', (loc) => {
        // handle your locations here
        // to perform long running operation on iOS
        // you need to create background task
        BackgroundGeolocation.startTask((taskKey) => {
          firestore().collection('Users').doc(auth().currentUser.uid).update({
            latitude: loc.latitude,
            longitude: loc.longitude,
          });

          const location = loc;
          const latitude = loc.latitude;
          const longitude = loc.longitude;
          this.setState({location: loc});
          this.setState({latitude: loc.latitude});
          this.setState({longitude: loc.longitude});
          console.log('LOCATION', location);
          console.log('LATITUDE', latitude);
          console.log('LONGITUDE', longitude);
          // execute long running task
          // eg. ajax post location
          // IMPORTANT: task has to be ended by endTask
          BackgroundGeolocation.endTask(taskKey);
        });
      });

      BackgroundGeolocation.on('error', (error) => {
        console.log('[ERROR] BackgroundGeolocation error:', error);
      });

      BackgroundGeolocation.on('start', () => {
        console.log('[INFO] BackgroundGeolocation service has been started');
      });

      BackgroundGeolocation.on('stop', () => {
        console.log('[INFO] BackgroundGeolocation service has been stopped');
      });

      BackgroundGeolocation.on('authorization', (status) => {
        console.log(
          '[INFO] BackgroundGeolocation authorization status: ' + status,
        );
        if (status !== BackgroundGeolocation.AUTHORIZED) {
          // we need to set delay or otherwise alert may not be shown
          setTimeout(
            () =>
              Alert.alert(
                'App requires location tracking permission',
                'Would you like to open app settings?',
                [
                  {
                    text: 'Yes',
                    onPress: () => BackgroundGeolocation.showAppSettings(),
                  },
                  {
                    text: 'No',
                    onPress: () => console.log('No Pressed'),
                    style: 'cancel',
                  },
                ],
              ),
            1000,
          );
        }
      });

      BackgroundGeolocation.on('background', () => {
        console.log('[INFO] App is in background');
      });

      BackgroundGeolocation.on('foreground', () => {
        console.log('[INFO] App is in foreground');
      });

      BackgroundGeolocation.on('abort_requested', () => {
        console.log('[INFO] Server responded with 285 Updates Not Required');

        // Here we can decide whether we want stop the updates or not.
        // If you've configured the server to return 285, then it means the server does not require further update.
        // So the normal thing to do here would be to `BackgroundGeolocation.stop()`.
        // But you might be counting on it to receive location updates in the UI, so you could just reconfigure and set `url` to null.
      });

      BackgroundGeolocation.on('http_authorization', () => {
        console.log('[INFO] App needs to authorize the http requests');
      });

      BackgroundGeolocation.checkStatus((status) => {
        console.log(
          '[INFO] BackgroundGeolocation service is running',
          status.isRunning,
        );
        console.log(
          '[INFO] BackgroundGeolocation services enabled',
          status.locationServicesEnabled,
        );
        console.log(
          '[INFO] BackgroundGeolocation auth status: ' + status.authorization,
        );

        // you don't need to check status before start (this is just the example)
        // if (!status.isRunning) {
        //   BackgroundGeolocation.start(); //triggers start on start event
        // }
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const user = auth().currentUser;
    if (user) {
      if (this.state.sosMode) {
        BackgroundGeolocation.start();
      } else {
        BackgroundGeolocation.stop();
      }
    }
  }

  componentWillUnmount() {
    const user = auth().currentUser;
    if (user) {
      this.unsub();
      this.unsubscribeWards();
      BackgroundGeolocation.removeAllListeners();
    }
    // if (!user) {
    //   this.props.navigation.replace('Welcome');
    // }
  }

  signOutUser = async () => {
    await auth()
      .signOut()
      .then(() => {
        this.props.navigation.replace('Welcome');
      });
  };

  // page UI
  render() {
    return (
      <View style={styles.mainContainer}>
        <StatusBar
          barStyle="default"
          backgroundColor="transparent"
          translucent={true}
        />
        <TouchableOpacity
          accessible={true}
          accessibilityRole="button"
          onPress={() =>
            this.props.navigation.navigate('SOS Mode', {
              sosMode: this.state.sosMode,
            })
          }>
          <View>
            <Icon
              name="exclamationcircle"
              type="antdesign"
              size={50}
              color="#f95a25"
              reverse
            />
            <Text style={styles.textStyle}>SOS Mode</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          accessible={true}
          accessibilityRole="button"
          onPress={() => this.props.navigation.navigate('Guardian Manager')}>
          <View>
            <Icon
              name="person-circle-outline"
              type="ionicon"
              size={50}
              color="#f95a25"
              reverse
            />
            <Text style={styles.textStyle}>Guardians</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          accessible={true}
          accessibilityRole="button"
          onPress={() => this.props.navigation.navigate('Fake Call')}>
          <View>
            <Icon
              name="call"
              type="ionicon"
              size={50}
              color="#f95a25"
              reverse
            />
            <Text style={styles.textStyle}>Fake Call</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          accessible={true}
          accessibilityRole="button"
          onPress={() => this.props.navigation.navigate('Emergency Text')}>
          <View>
            <Icon
              name="sms"
              type="font-awesome-5"
              size={50}
              color="#f95a25"
              reverse
            />
            <Text style={styles.textStyle}>Emergency Text</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          accessible={true}
          accessibilityRole="button"
          onPress={() => this.props.navigation.navigate('Settings')}>
          <View>
            <Icon
              name="settings"
              type="feather"
              size={50}
              color="#f95a25"
              reverse
            />
            <Text style={styles.textStyle}>Settings</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    backgroundColor: '#F8F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
  },
  textStyle: {
    fontSize: 18,
    textAlign: 'center',
  },
});
