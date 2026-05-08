import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'; 

// Navigators & Screens
import { AuthNavigator } from './src/navigation/AuthNavigator';
import TabNavigator from './src/navigation/TabNavigator';
import PickAGenreScreen from './src/screens/PickAGenreScreen';
import GenreDetailScreen from './src/screens/GenreDetailScreen';
import BookDetailScreen from './src/screens/BookDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen'; // Ensure this path is correct

const RootStack = createNativeStackNavigator();

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    const authSubscriber = auth().onAuthStateChanged((userState) => {
      setUser(userState);
      if (initializing) setInitializing(false);
    });

    const userSubscriber = auth().onUserChanged((userState) => {
      if (userState) setUser(userState);
    });

    return () => {
      authSubscriber();
      userSubscriber();
    };
  }, [initializing]);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A68BE" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          !user.displayName ? (
            <RootStack.Screen 
              name="Onboarding" 
              component={PickAGenreScreen} 
              key="onboarding-screen"
            />
          ) : (
            <>
              <RootStack.Screen 
                name="AppTabs" 
                component={TabNavigator} 
                key="main-app-tabs"
              />
              
              {/* THE MISSING PIECE: Register UserProfileView here */}
              <RootStack.Screen 
                name="UserProfileView" 
                component={ProfileScreen} 
                options={{ 
                    headerShown: true, 
                    title: 'Reader Profile',
                    headerTintColor: '#6C63FF',
                    headerStyle: { backgroundColor: '#F5E9CF' }
                }} 
                key="user-profile-view"
              />

              <RootStack.Screen 
                name="GenreDetail" 
                component={GenreDetailScreen} 
                options={{ 
                    headerShown: true, 
                    title: 'Explore',
                    headerTintColor: '#6C63FF' 
                }} 
                key="genre-detail-screen"
              />

              <RootStack.Screen 
                name="BookDetail" 
                component={BookDetailScreen} 
                options={{ 
                  headerShown: true, 
                  title: 'Book Details',
                  headerTintColor: '#6C63FF' 
                }} 
                key="book-detail-screen"
              />
            </>
          )
        ) : (
          <RootStack.Screen 
            name="Auth" 
            component={AuthNavigator} 
            key="auth-stack"
          />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, 
    backgroundColor: '#ad9154', 
    justifyContent: 'center', 
    alignItems: 'center'
  }
});

export default App;