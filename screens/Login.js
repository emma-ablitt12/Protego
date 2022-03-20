// screen to login

import React, {Component} from 'react';
import {StyleSheet, View, Alert, KeyboardAvoidingView} from 'react-native';
import {Button, Input, Text, Icon} from 'react-native-elements';

// firebase imports
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phoneNumber: '',
      returnedResult: null,
      verificationCode: '',
    };
  }

  validatePhoneNumber = () => {
    const phoneNumber = this.state.phoneNumber;
    var regexp = /^\+[0-9]?()[0-9](\s|\S)(\d[0-9]{8,16})$/;
    return regexp.test(phoneNumber);
  };

  handleVerifyCode = () => {
    // Request for OTP verification
    if (this.state.verificationCode.length === 6) {
      this.state.returnedResult
        .confirm(this.state.verificationCode)
        .then((user) => {
          // alert(`Verified! ${auth().currentUser.uid}`);
          this.props.navigation.navigate('Home');
        })
        .catch((error) => {
          alert('Invalid OTP code.');
          console.log(error);
        });
    } else {
      alert('Please enter a 6 digit OTP code.');
    }
  };

  signIn = () => {
    if (this.validatePhoneNumber()) {
      const phoneNumber = this.state.phoneNumber;
      firestore()
        .collection('Users')
        .where('phoneNumber', '==', phoneNumber)
        .get()
        .then((documentSnapshot) => {
          console.log('PHONESNAP', documentSnapshot);
          if (documentSnapshot.size > 0) {
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
          } else {
            Alert.alert('This phone number is not registered');
          }
        });
    }
  };

  render() {
    return (
      <KeyboardAvoidingView behaviour="padding" style={styles.container}>
        <View>
          <Text
            h1
            accessibilityRole={'text'}
            style={{
              marginTop: 50,
              alignSelf: 'center',
            }}>
            Protego
          </Text>
          <Text
            accessibilityRole={'text'}
            style={{
              textAlign: 'center',
              fontSize: 24,
            }}>
            Login
          </Text>
        </View>
        <View style={styles.inputContainer}>
          <Input
            accessible={true}
            accessibilityLabel={'Phone number input'}
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
            accessible={true}
            accessibilityLabel={'Verification code input'}
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
            accessible={true}
            accessibilityLabel={
              this.state.returnedResult ? 'Verify Code' : 'Send Code'
            }
          />
        </View>
        <View style={{height: 100}} />
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  inputContainer: {paddingTop: 100, width: 300},
  titleStyle: {
    color: '#f95a25',
  },
  buttonStyle: {borderWidth: 2, borderColor: '#f95a25'},
});
