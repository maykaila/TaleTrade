import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TabBar from '../component/TabBar'; 
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SearchScreen from '../screens/SearchScreen';
import SettingScreen from '../screens/SettingScreen';
import WishlistScreen from '../screens/WishlistScreen';
import MyBooksScreen from '../screens/MyBooksScreen';
import GenreDetailScreen from '../screens/GenreDetailScreen';
import BookDetailScreen from '../screens/BookDetailScreen';

import { Book } from '../types'; 

export type RootStackParamList = {
  MainTabs: undefined;
  GenreDetail: { genre: string }; 
  BookDetail: { bookData: Book };
  UserProfileView: { userId: string }; 
};

const MainStack = createNativeStackNavigator<RootStackParamList>();

export const MainNavigator = () => {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="MainTabs" component={TabNavigator} />
      
      <MainStack.Screen 
        name="UserProfileView" 
        component={ProfileScreen} 
        options={{ 
          headerShown: true, 
          title: 'Reader Profile', 
          headerTintColor: '#6C63FF',
          headerStyle: { backgroundColor: '#F5E9CF' } 
        }} 
      />

      <MainStack.Screen name="GenreDetail" component={GenreDetailScreen} options={{ headerShown: true }} />
      <MainStack.Screen name="BookDetail" component={BookDetailScreen} options={{ headerShown: true }} />
    </MainStack.Navigator>
  );
};

const ProfileStack = createNativeStackNavigator();

const ProfileStackScreen = () => {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingScreen} />
    </ProfileStack.Navigator>
  );
};

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="My Books" component={MyBooksScreen} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;