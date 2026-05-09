import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const LaunchScreen = ({ navigation }: any) => {
  return (
    <Pressable 
      style={styles.container} 
      onPress={() => navigation.replace('Login')}
    >

      {/* LOGO SECTION */}
      <View style={styles.logoContainer}>
        
        {/* Top Row: Tale + Logo */}
        <View style={styles.topRow}>
          <Image
            source={require('../assets/logoNoBg.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* WAVE */}
      <View style={styles.waveContainer}>
        <Svg height="320" width="100%" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <Path
            fill="#6C63A8"
            d="
              M0,240 
              C200,100 500,100 720,240 
              C850,50 1300,50 1440,120 
              L1440,320 
              L0,320 
              Z
            "
          />
        </Svg>
      </View>

      <Text style={styles.tapText}>Tap anywhere</Text>

    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#E8DDC7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  tale: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#6C63A8',
    marginRight: 5,
  },

  trade: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#4A4A4A',
  },

  logoImage: {
    width: 600,
    height: 500,
    marginLeft: 5,
  },

  waveContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },

  tapText: { 
    position: 'absolute',
    bottom: 20,
    color: '#999',
    fontSize: 12,
  },
});

export default LaunchScreen;