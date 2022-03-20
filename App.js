import React, {Component} from 'react';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import Navigator from './navigation/Navigator';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: '',
    };
  }

  checkPermissions() {
    check(PERMISSIONS.IOS.LOCATION_ALWAYS)
      .then((result) => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            console.log(
              'IOS UNAVAILABLE This feature is not available (on this device / in this context)',
            );
            request(PERMISSIONS.IOS.LOCATION_ALWAYS).then((result) => {
              // console.log('result', result);
            });
            break;
          case RESULTS.DENIED:
            console.log(
              'IOS DENIED The permission has not been requested / is denied but requestable',
            );
            request(PERMISSIONS.IOS.LOCATION_ALWAYS).then((result) => {
              // console.log('result', result);
            });
            break;
          case RESULTS.LIMITED:
            console.log(
              'IOS LIMITED The permission is limited: some actions are possible',
            );
            break;
          case RESULTS.GRANTED:
            console.log('IOS GRANTED The permission is granted');
            break;
          case RESULTS.BLOCKED:
            console.log(
              'IOS BLOCKED The permission is denied and not requestable anymore',
            );
            break;
        }
      })
      .catch((error) => {
        // …
      });

    check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
      .then((result) => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            console.log(
              'ANDROID UNAVAILABLE ACCESS_FINE_LOCATION This feature is not available (on this device / in this context)',
            );
            request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then((result) => {
              console.log('result', result);
            });
            break;
          case RESULTS.DENIED:
            console.log(
              'ANDROID DENIED ACCESS_FINE_LOCATION The permission has not been requested / is denied but requestable',
            );
            request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then((result) => {
              console.log('result', result);
            });
            break;
          case RESULTS.LIMITED:
            console.log(
              'ANDROID LIMITED ACCESS_FINE_LOCATIONThe permission is limited: some actions are possible',
            );
            break;
          case RESULTS.GRANTED:
            console.log(
              'ANDROID GRANTED ACCESS_FINE_LOCATION The permission is granted',
            );
            break;
          case RESULTS.BLOCKED:
            console.log(
              'ANDROID BLOCKED ACCESS_FINE_LOCATION The permission is denied and not requestable anymore',
            );
            break;
        }
      })
      .catch((error) => {
        // …
      });

    check(PERMISSIONS.ANDROID.BACKGROUND_LOCATION)
      .then((result) => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            console.log(
              'ANDROID UNAVAILABLE BACKGROUND_LOCATION This feature is not available (on this device / in this context)',
            );
            request(PERMISSIONS.ANDROID.BACKGROUND_LOCATION).then((result) => {
              console.log('result', result);
            });
            break;
          case RESULTS.DENIED:
            console.log(
              'ANDROID DENIED BACKGROUND_LOCATION The permission has not been requested / is denied but requestable',
            );
            request(PERMISSIONS.ANDROID.BACKGROUND_LOCATION).then((result) => {
              console.log('result', result);
            });
            break;
          case RESULTS.LIMITED:
            console.log(
              'ANDROID LIMITED BACKGROUND_LOCATION The permission is limited: some actions are possible',
            );
            break;
          case RESULTS.GRANTED:
            console.log(
              'ANDROID GRANTED BACKGROUND_LOCATION The permission is granted',
            );
            break;
          case RESULTS.BLOCKED:
            console.log(
              'ANDROID BLOCKED BACKGROUND_LOCATION The permission is denied and not requestable anymore',
            );
            break;
        }
      })
      .catch((error) => {
        // …
      });
  }

  async componentDidMount() {
    this.checkPermissions();
  }

  render() {
    return <Navigator />;
  }
}
