// Emergency text screen to format an sms to 112
// ref https://www.112.ie/Sending_a_text_to_112/144

import React, {Component} from 'react';
import {StyleSheet, View, KeyboardAvoidingView} from 'react-native';
import {Button, Input} from 'react-native-elements';
import Geolocation from 'react-native-geolocation-service';
import SendSMS from 'react-native-sms';
import {Dropdown} from 'sharingan-rn-modal-dropdown';

// firebase imports
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default class EmergencyText extends Component {
  constructor() {
    super();
    this.state = {
      userID: auth().currentUser.uid,
      location: [],
      latitude: 0,
      longitude: 0,
      emergencyService: '',
      problem: '',
      county: '',
      address: '',
      info: '',
      registered112: false,
    };
  }

  componentDidMount() {
    this.checkIfRegistered();
    this.getLocation();
  }

  checkIfRegistered = () => {
    firestore()
      .collection('Users')
      .doc(auth().currentUser.uid)
      .get()
      .then((snapshot) => {
        console.log('REGISTERED', snapshot.data().registered112);
        if (snapshot.data().registered112) {
          this.setState({registered112: true});
        } else {
          this.setState({registered112: false});
        }
      });
  };

  register112 = () => {
    SendSMS.send(
      {
        body: 'register',
        recipients: ['112'],
        successTypes: ['sent'],
        allowAndroidSendWithoutReadPermission: true,
      },
      (completed, cancelled, error) => {
        console.log(
          'SMS Callback: completed: ' +
            completed +
            ' cancelled: ' +
            cancelled +
            'error: ' +
            error,
        );
        if (completed) {
          firestore()
            .collection('Users')
            .doc(auth().currentUser.uid)
            .update({registered112: true});
        }
      },
    );
  };

  sendMessage = () => {
    SendSMS.send(
      {
        body: `${this.state.emergencyService}. ${this.state.problem}. ${this.state.county}. ${this.state.address}. ${this.state.info}`,
        recipients: ['112'],
        successTypes: ['sent'],
        allowAndroidSendWithoutReadPermission: true,
      },
      (completed, cancelled, error) => {
        console.log(
          'SMS Callback: completed: ' +
            completed +
            ' cancelled: ' +
            cancelled +
            'error: ' +
            error,
        );
      },
    );
  };

  getLocation = async () => {
    Geolocation.getCurrentPosition(
      async (position) => {
        console.log(position);
        this.setState({location: position});
        this.setState({longitude: position.coords.longitude});
        this.setState({latitude: position.coords.latitude});
        const addr = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${this.state.latitude},${this.state.longitude}&key=AIzaSyDPSgSk-eU4YVC81IWMeA6yUSoGHSHEWT8`,
        );
        const addrresp = await addr.json();
        // console.log('ADDRESS', addrresp.results[0].formatted_address);
        this.setState({address: addrresp.results[0].formatted_address});
      },
      (error) => {
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  componentDidUpdate(prevProps, prevState) {
    {
      //if not registered to 112 prompt the register text
      !this.state.registered112 ? this.register112() : null;
    }
  }

  // page UI
  render() {
    return (
      <KeyboardAvoidingView style={styles.mainContainer}>
        <View style={{width: '100%', flex: 1}}>
          <Dropdown
            accessible={true}
            accessibilityLabel={'Select emergency service'}
            accessibilityRole={'combobox'}
            label="Which emergency service do you need?"
            data={[
              {label: 'Garda', value: 'Garda Síochána'},
              {label: 'Ambulance', value: 'Ambulance'},
              {label: 'Fire Brigade', value: 'Fire Brigade'},
              {label: 'Coast Guard', value: 'Coast Guard'},
            ]}
            value={this.state.emergencyService}
            onChange={(item) => this.setState({emergencyService: item})}
          />
        </View>
        <View
          style={{
            width: '100%',
            paddingBottom: 25,
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
          }}>
          <Input
            accessible={true}
            accessibilityLabel={'What is the emergency?'}
            placeholder={'What is the emergency?'}
            // label={'What is the emergency?'}
            value={this.state.problem}
            onChangeText={(problem) => {
              this.setState({problem});
            }}
          />
          <Input
            accessible={true}
            accessibilityLabel={'Which county are you in?'}
            placeholder={'Which county are you in?'}
            // label={'Which county are you in?'}
            value={this.state.county}
            onChangeText={(county) => {
              this.setState({county});
            }}
          />
          <Input
            accessible={true}
            accessibilityLabel={'Location'}
            placeholder={'Location'}
            // label={'Location'}
            value={this.state.address}
            onChangeText={(address) => {
              this.setState({address});
            }}
          />
          <Input
            accessible={true}
            accessibilityLabel={'Enter any additional information'}
            placeholder={'Enter any additional information'}
            // label={'Additional information'}
            value={this.state.info}
            onChangeText={(info) => {
              this.setState({info});
            }}
          />
          <Button
            accessible={true}
            accessibilityLabel={'Send Text'}
            accessibilityRole={'button'}
            title="Send Text"
            onPress={() => this.sendMessage()}
            buttonStyle={styles.buttonStyle}
            titleStyle={styles.titleStyle}
            containerStyle={{marginBottom: 50}}
            type="outline"
          />
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8F8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleStyle: {
    color: '#f95a25',
  },
  buttonStyle: {
    borderWidth: 2,
    borderColor: '#f95a25',
    width: 300,
    height: 50,
  },
});
