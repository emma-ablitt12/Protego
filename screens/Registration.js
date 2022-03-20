// screen to register a new user

import React, {Component} from 'react';
import {StyleSheet, View, Alert, KeyboardAvoidingView} from 'react-native';
import {Button, Input, Text, Icon} from 'react-native-elements';

// firebase imports
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default class Registration extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      phoneNumber: '',
      userID: '',
      password: '',
      returnedResult: null,
      verificationCode: '',
    };
  }

  validatePhoneNumber = () => {
    const phoneNumber = this.state.phoneNumber;
    var regexp = /^\+[0-9]?()[0-9](\s|\S)(\d[0-9]{8,16})$/;
    return regexp.test(phoneNumber);
  };

  signIn = () => {
    if (this.state.password.length === 0) {
      alert('Please enter a password.');
      console.log('PASSWORD');
    } else {
      if (this.validatePhoneNumber()) {
        const phoneNumber = this.state.phoneNumber;
        firestore()
          .collection('Users')
          .where('phoneNumber', '==', phoneNumber)
          .get()
          .then((documentSnapshot) => {
            console.log('PHONESNAP', documentSnapshot.docs);
            // console.log('DOCSNAPSHOT', documentSnapshot);
            if (documentSnapshot.size > 0) {
              Alert.alert('This number is already registered.');
            } else {
              auth()
                .signInWithPhoneNumber(phoneNumber)
                .then((returnedResult) => {
                  console.log('returnedResult', returnedResult);
                  this.setState({returnedResult});
                })
                .catch((error) => {
                  Alert.alert(
                    'Protego Registration is uncomplete.',
                    'An error has occurred please try again.',
                  );
                  console.log(error);
                });
            }
          });
      }
    }
  };

  handleVerifyCode = () => {
    // Request for OTP verification
    if (this.state.verificationCode.length === 6) {
      this.state.returnedResult
        .confirm(this.state.verificationCode)
        .then((user) => {
          this.createUser();
          // alert(`Verified! userid: ${auth().currentUser.uid}`);
        })
        .catch((error) => {
          alert('Invalid OTP code.');
          console.log(error);
        });
    } else {
      alert('Please enter a 6 digit OTP code.');
    }
  };

  createUser = () => {
    const name = this.state.name;
    const phoneNumber = this.state.phoneNumber;
    const password = this.state.password;
    const userID = auth().currentUser.uid;
    firestore()
      .collection('Users')
      .doc(userID)
      .set({
        name: name,
        phoneNumber: phoneNumber,
        userID: userID,
        password: password,
        registered112: false,
        sosMode: false,
        latitude: 0,
        longitude: 0,
      })
      .then(() => {
        auth().currentUser.updateProfile({
          displayName: name,
        });
        this.props.navigation.navigate('Home');
        console.log('User added! Home');
      });
  };

  render() {
    return (
      <KeyboardAvoidingView style={styles.container}>
        <View>
          <Text
            h1
            style={{
              marginTop: -50,
              alignSelf: 'center',
            }}>
            Protego
          </Text>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 24,
            }}>
            Create an Account
          </Text>
        </View>
        <View style={styles.inputContainer}>
          <Input
            leftIcon={
              <Icon
                name="pencil"
                type="font-awesome"
                size={24}
                color="#f95a25"
              />
            }
            placeholder="Name"
            type="text"
            value={this.state.name}
            onChangeText={(name) => this.setState({name})}
          />
          <Input
            leftIcon={
              <Icon
                name="phone"
                type="font-awesome"
                size={24}
                color="#f95a25"
              />
            }
            placeholder="Phone no. w/ country code"
            keyboardType="phone-pad"
            value={this.state.phoneNumber}
            onChangeText={(phoneNumber) => {
              this.setState({phoneNumber});
            }}
            maxLength={15}
          />
          <Input
            leftIcon={
              <Icon name="lock" type="font-awesome" size={24} color="#f95a25" />
            }
            placeholder="SOS Password"
            secureTextEntry
            value={this.state.password}
            onChangeText={(password) => {
              this.setState({password});
            }}
          />
          <Input
            placeholder={
              this.state.returnedResult
                ? 'Enter Verification code'
                : 'Press Send Code'
            }
            leftIcon={
              <Icon
                name="key"
                type="font-awesome-5"
                size={24}
                color="#f95a25"
              />
            }
            value={this.state.verificationCode}
            keyboardType="numeric"
            onChangeText={(verificationCode) => {
              this.setState({verificationCode});
            }}
            maxLength={6}
            editable={this.state.returnedResult ? true : false}
          />
          <Button
            titleStyle={styles.titleStyle}
            buttonStyle={styles.buttonStyle}
            type="outline"
            title={this.state.returnedResult ? 'Verify Code' : 'Send Code'}
            onPress={
              this.state.returnedResult ? this.handleVerifyCode : this.signIn
            }
          />
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  inputContainer: {paddingTop: 10, width: 300, height: '50%'},
  titleStyle: {
    color: '#f95a25',
  },
  buttonStyle: {borderWidth: 2, borderColor: '#f95a25'},
});
