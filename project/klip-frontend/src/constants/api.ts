import { Platform } from 'react-native';
import Config from 'react-native-config';

const LOCAL_DEV_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000'
    : 'http://localhost:3000';

export const API_URL = Config.API_URL || LOCAL_DEV_URL;
