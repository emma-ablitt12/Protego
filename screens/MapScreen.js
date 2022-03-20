// screen where the guardian can see the location of the user in sos mode

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import MapView, {
  AnimatedRegion,
  PROVIDER_GOOGLE,
  Animated,
} from 'react-native-maps';

import firestore from '@react-native-firebase/firestore';

const MapScreen = ({route}) => {
  const {ward} = route.params;
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [inSOSMode, setInSOSMode] = useState(false);
  const [address, setAddress] = useState('');

  // get location of ward
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('Users')
      .doc(ward.data().userID)
      .onSnapshot((snapshot) => {
        setLatitude(snapshot.data().latitude);
        setLongitude(snapshot.data().longitude);
        console.log('MAPSCREEN LONGITUDE', snapshot.data().longitude);
        if (snapshot.data().sosMode) {
          setInSOSMode(true);
          getLocation(snapshot.data().latitude, snapshot.data().longitude);
        } else {
          setInSOSMode(false);
        }
      });
    return () => {
      unsubscribe();
    };
  }, []);

  const getLocation = async (lat, lon) => {
    const addr = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=AIzaSyDPSgSk-eU4YVC81IWMeA6yUSoGHSHEWT8`,
    );
    const addrresp = await addr.json();
    console.log('ADDRESS', addrresp.results[0].formatted_address);
    setAddress(addrresp.results[0].formatted_address);
  };
  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
      }}>
      {console.log('MAPSCREEN LATITUDE', latitude)}
      {console.log('MAPSCREEN LONGITUDE', longitude)}
      <Animated
        style={{width: '100%', height: '100%'}}
        provider={PROVIDER_GOOGLE}
        showUserLocation={true}
        followUserLocation={true}
        loadingEnabled={true}
        showsMyLocationButton={true}
        region={
          new AnimatedRegion({
            latitude: Number(latitude),
            longitude: Number(longitude),
            latitudeDelta: 0.003,
            longitudeDelta: 0.003,
          })
        }>
        <MapView.Marker.Animated
          accessible={true}
          accessibilityLabel={'Press on marker'}
          coordinate={{latitude: latitude, longitude: longitude}}
          title={ward.data().name}
          description={address}
          opacity={0.9}
        />
      </Animated>
    </View>
  );
};

export default MapScreen;
