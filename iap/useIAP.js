// src/iap/useIAP.js
import { Platform } from 'react-native';
import * as RNIapReal from 'react-native-iap';
import * as RNIapMock from './mockIAP';

export const IAP = __DEV__ ? RNIapMock : RNIapReal;
