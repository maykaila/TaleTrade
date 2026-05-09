import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  SafeAreaView, Alert, ScrollView, KeyboardAvoidingView, 
  Platform, StatusBar as RNStatusBar, Image,
  Linking, PermissionsAndroid 
} from 'react-native';
import { ChevronLeft, User, Trash2, Save, Camera, CheckCircle, AlignLeft, LogOut } from 'lucide-react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { updateUserInDb, getUserProfile, updateUserBio, updateUserProfileImage } from '../services/userService';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  primaryBlue: '#4A68BE',
  softPurple: '#7E6FB0',
  creamBg: '#F5E9CF',
  white: '#FFFFFF',
  danger: '#FF6B6B',
  inputBg: '#F9F7F2',
  success: '#4CAF50',
  divider: '#EEE'
};

const SettingScreen = ({ navigation }: any) => {
  const [newName, setNewName] = useState('');
  const [newBio, setNewBio] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const user = auth().currentUser;
    if (user) {
      const userData = await getUserProfile(user.uid);
      if (userData) {
        setNewName(userData.username || '');
        setNewBio(userData.bio || '');
        // Get image from Firestore instead of AsyncStorage
        if (userData.photoURL) {
          setProfileImage(userData.photoURL);
          setTempImage(userData.photoURL);
        }
      }
    }
  };

  const requestGalleryPermission = async () => {
    if (Platform.OS === 'ios') return true;
    if (Platform.OS === 'android') {
      try {
        const permission = Platform.Version >= 33 
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES 
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        const granted = await PermissionsAndroid.request(permission);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) { return false; }
    }
    return false;
  };

  const handlePickImage = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      Alert.alert("Permission Denied", "Open settings to allow gallery access.", 
        [{ text: "Cancel" }, { text: "Open Settings", onPress: () => Linking.openSettings() }]
      );
      return;
    }

    launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, (response) => {
      if (response.assets && response.assets[0].uri) {
        setTempImage(response.assets[0].uri);
      }
    });
  };

  const handleSavePhoto = async () => {
    const user = auth().currentUser;
    if (tempImage && user) {
      try {
        // Save to Firestore instead of AsyncStorage
        await updateUserProfileImage(user.uid, tempImage);
        setProfileImage(tempImage);
        Alert.alert("Success! ✨", "Profile picture updated in the cloud.");
      } catch (error) {
        Alert.alert("Error", "Failed to save image.");
      }
    }
  };

  const handleUpdateProfile = async () => {
    const user = auth().currentUser;
    if (!user) return;
    
    if (newName.trim().length < 3) {
      Alert.alert("Error", "Username is too short!");
      return;
    }

    try {
      await updateUserInDb(user.uid, newName.trim());
      await updateUserBio(user.uid, newBio.trim());
      
      Alert.alert("Success!", "Profile updated ✨", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure? 🥺", [
      { text: "Stay", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: () => auth().signOut() }
    ]);
  };

  const handleDeleteAccount = () => {
    const user = auth().currentUser;
    if (!user) return;
    Alert.alert("Wait! 🥺", "This will delete your account permanently. Proceed?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete Everything", style: "destructive", onPress: async () => {
        try {
          await firestore().collection('Users').doc(user.uid).delete();
          await AsyncStorage.removeItem('user_profile_image');
          await user.delete();
        } catch (e) { 
          Alert.alert("Security Check", "Please log out and log back in before deleting."); 
        }
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backCircle}>
          <ChevronLeft color={COLORS.primaryBlue} size={26} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={{ width: 45 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* PHOTO SECTION */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconWrapper}><Camera color={COLORS.softPurple} size={20} /></View>
              <Text style={styles.sectionTitle}>Profile Picture</Text>
            </View>
            <View style={styles.imagePickerContainer}>
              <View style={styles.imageWrapper}>
                {tempImage ? (
                  <Image source={{ uri: tempImage }} style={styles.previewImage} />
                ) : (
                  <View style={[styles.previewImage, styles.placeholderImage]}>
                    <User color={COLORS.softPurple} size={40} />
                  </View>
                )}
              </View>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.imagePickerBtn} onPress={handlePickImage}>
                  <Text style={styles.imagePickerBtnText}>Change Photo</Text>
                </TouchableOpacity>
                {tempImage !== profileImage && (
                  <TouchableOpacity style={styles.savePhotoBtn} onPress={handleSavePhoto}>
                    <CheckCircle color={COLORS.white} size={16} />
                    <Text style={styles.savePhotoBtnText}>Save</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* BIO & NAME SECTION */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconWrapper}><AlignLeft color={COLORS.softPurple} size={20} /></View>
              <Text style={styles.sectionTitle}>Public Bio</Text>
            </View>
            
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="Your display name"
              placeholderTextColor="#AAA"
            />

            <Text style={styles.label}>About Me</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              value={newBio}
              onChangeText={setNewBio}
              placeholder="Tell us about your favorite books..."
              placeholderTextColor="#AAA"
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={handleUpdateProfile}>
              <Save color={COLORS.white} size={18} />
              <Text style={styles.btnText}>Save Profile</Text>
            </TouchableOpacity>
          </View>

          {/* DANGER COLUMN: Vertically stacked buttons */}
          <View style={styles.dangerColumn}>
            <TouchableOpacity style={[styles.dangerBtn, styles.logoutBtn]} onPress={handleLogout}>
              <LogOut color={COLORS.danger} size={18} />
              <Text style={styles.dangerBtnText}>Log Out of Account</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.dangerBtn, styles.deleteBtn]} onPress={handleDeleteAccount}>
              <Trash2 color={COLORS.danger} size={18} />
              <Text style={styles.dangerBtnText}>Permanently Delete Account</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.creamBg },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) + 15 : 10, 
    paddingBottom: 15 
  },
  backCircle: { 
    backgroundColor: COLORS.white, 
    width: 45, height: 45, 
    borderRadius: 22.5, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 4 
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: COLORS.primaryBlue },
  scrollContent: { padding: 25, paddingBottom: 120 },
  sectionCard: { backgroundColor: COLORS.white, borderRadius: 30, padding: 20, marginBottom: 25, elevation: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconWrapper: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F3F1FB', justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primaryBlue, marginLeft: 12 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.softPurple, marginBottom: 8 },
  input: { backgroundColor: COLORS.inputBg, padding: 15, borderRadius: 18, fontSize: 16, color: '#444', marginBottom: 15 },
  primaryBtn: { flexDirection: 'row', backgroundColor: COLORS.primaryBlue, padding: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
  imagePickerContainer: { alignItems: 'center' },
  imageWrapper: { width: 110, height: 110, borderRadius: 55, overflow: 'hidden', backgroundColor: COLORS.inputBg, marginBottom: 15, borderWidth: 3, borderColor: '#F3F1FB' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderImage: { justifyContent: 'center', alignItems: 'center' },
  buttonRow: { flexDirection: 'row', gap: 10 },
  imagePickerBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12, backgroundColor: '#F3F1FB' },
  imagePickerBtnText: { color: COLORS.primaryBlue, fontWeight: '700', fontSize: 14 },
  savePhotoBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12, backgroundColor: COLORS.success },
  savePhotoBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  
  // Danger Column Styles
  dangerColumn: { 
    marginTop: 10,
    gap: 15, 
    marginBottom: 30 
  },
  dangerBtn: { 
    width: '100%',
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 18, 
    borderRadius: 22, 
    borderWidth: 2, 
    borderColor: COLORS.danger, 
    gap: 10, 
  },
  dangerBtnText: { color: COLORS.danger, fontWeight: '800', fontSize: 16 },
  logoutBtn: { 
    backgroundColor: 'rgba(255, 107, 107, 0.05)', 
    borderStyle: 'solid' 
  },
  deleteBtn: { 
    borderStyle: 'dashed',
    opacity: 0.6 
  },
});

export default SettingScreen;