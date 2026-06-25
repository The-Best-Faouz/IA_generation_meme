import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ContextReaderScreen } from '../screens/create/ContextReaderScreen';
import { StatusRemixerScreen } from '../screens/create/StatusRemixerScreen';
import { PromptScreen } from '../screens/create/PromptScreen';
import { FaceSwapScreen } from '../screens/create/FaceSwapScreen';
import { GifEditorScreen } from '../screens/create/GifEditorScreen';
import { PreviewScreen } from '../screens/preview/PreviewScreen';
import { GalleryScreen } from '../screens/gallery/GalleryScreen';
import { MemeDetailScreen } from '../screens/gallery/MemeDetailScreen';
import { TelegramConnectScreen } from '../screens/telegram/TelegramConnectScreen';
import { TelegramFeedScreen } from '../screens/telegram/TelegramFeedScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

export type AppStackParamList = {
  MainTabs: undefined;
  ContextReader: undefined;
  StatusRemixer: undefined;
  Prompt: undefined;
  FaceSwap: undefined;
  GifEditor: undefined;
  Preview: { imageUrl: string; caption?: string; memeId?: string };
  MemeDetail: { id: string };
  TelegramConnect: undefined;
  TelegramFeed: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Gallery: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Gallery" component={GalleryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="ContextReader" component={ContextReaderScreen} />
      <Stack.Screen name="StatusRemixer" component={StatusRemixerScreen} />
      <Stack.Screen name="Prompt" component={PromptScreen} />
      <Stack.Screen name="FaceSwap" component={FaceSwapScreen} />
      <Stack.Screen name="GifEditor" component={GifEditorScreen} />
      <Stack.Screen name="Preview" component={PreviewScreen} />
      <Stack.Screen name="MemeDetail" component={MemeDetailScreen} />
      <Stack.Screen name="TelegramConnect" component={TelegramConnectScreen} />
      <Stack.Screen name="TelegramFeed" component={TelegramFeedScreen} />
    </Stack.Navigator>
  );
};
