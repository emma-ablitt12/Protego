import 'react-native';
import React from 'react';
import Navigator from '../navigation/Navigator';
import Welcome from '../screens/Welcome';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import {render, fireEvent, waitFor} from '@testing-library/react-native';


it('renders correctly', async () => {
  renderer.create(<Welcome />);
});

