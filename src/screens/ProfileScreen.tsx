import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  ScrollView, Platform, StatusBar, Image, Linking, Alert 
} from 'react-native';
import { Settings, BookOpen, ChevronRight, Send, Mail } from 'lucide-react-native';
import auth from '@react-native-firebase/auth';
import { useIsFocused } from '@react-navigation/native';
import { getUserProfile } from '../services/userService';

const COLORS = { 
  primaryBlue: '#4A68BE', 
  softPurple: '#7E6FB0', 
  creamBg: '#F5E9CF', 
  white: '#FFFFFF' 
};

const ProfileScreen = ({ navigation, route }: any) => {
  const isFocused = useIsFocused();
  
  const [userName, setUserName] = useState('...');
  const [bio, setBio] = useState('...');
  const [initials, setInitials] = useState('??');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [socialLink, setSocialLink] = useState<string | null>(null);

  const visitedUserId = route?.params?.userId;
  const currentUid = auth().currentUser?.uid;
  
  // Determine if we are looking at our own profile or someone else's
  const targetUid = visitedUserId || currentUid;
  const isOwnProfile = !visitedUserId || visitedUserId === currentUid;

  // Clear data when switching users to avoid UI flickering with old data
  useEffect(() => {
    setUserName('...');
    setBio('...');
    setSocialLink(null);
    setProfileImage(null);
    setInitials('??');
  }, [visitedUserId]);

  const fetchAndSetUserData = useCallback(async () => {
    if (!targetUid) return;
    
    try {
      const userData = await getUserProfile(targetUid);
      if (userData) {
        setUserName(userData.username || 'Explorer');
        setBio(userData.bio || (isOwnProfile ? 'Introduce yourself to the community! 📚' : 'No bio available yet.'));
        setProfileImage(userData.photoURL || null);
        setSocialLink(userData.socialLink || null);

        const nameParts = (userData.username || 'Explorer').trim().split(' ');
        setInitials(nameParts.length > 1 
          ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase() 
          : nameParts[0][0].toUpperCase()
        );
      }
    } catch (error) {
      console.error("Error in fetchAndSetUserData:", error);
    }
  }, [targetUid, isOwnProfile]);

  useEffect(() => {
    if (isFocused) {
      fetchAndSetUserData();
    }
  }, [isFocused, fetchAndSetUserData]);

  const handleContactPress = async () => {
    if (!socialLink) return;

    // 1. Robust URL Sanitization
    let url = socialLink.trim().toLowerCase();
    
    // If it's just "google.com", turn it into "https://google.com"
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    try {
      // 2. Open the URL directly
      // Note: canOpenURL often returns false on newer iOS/Android versions 
      // unless you configure "queries" in the manifest, so we try opening directly.
      await Linking.openURL(url);
    } catch (error) {
      console.error("Linking Error:", error);
      Alert.alert(
        "Link Error", 
        "Could not open the link. Please make sure it is a valid web address."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{isOwnProfile ? "Profile" : "Reader Profile"}</Text>
        {isOwnProfile && (
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.settingsButton}>
            <Settings color={COLORS.primaryBlue} size={24} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainWrapper}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
                <View style={styles.avatarCircle}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                  <Text style={styles.avatarInitials}>{initials}</Text>
                )}
                </View>
                
                {socialLink && (
                    <TouchableOpacity 
                        onPress={handleContactPress}
                        style={styles.avatarContactBadge}
                        activeOpacity={0.8}
                    >
                        <Send color={COLORS.white} size={14} />
                    </TouchableOpacity>
                )}
            </View>
            
            <Text style={styles.userName}>{userName}</Text>

            <View style={styles.bioContainer}>
              <Text style={styles.bioTitle}>About Me</Text>
              <View style={styles.bioContent}>
                <Text style={styles.bioText}>{bio}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Tales Read</Text>
            </View>
            <View style={{ width: 15 }} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4</Text>
              <Text style={styles.statLabel}>Tales Traded</Text>
            </View>
          </View>

          {/* Library & Social Section */}
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>Library & Social</Text>
            
            {/* Show Saved Tales ONLY on own profile */}
            {isOwnProfile && (
                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuItemLeft}>
                        <View style={styles.iconBackground}>
                          <BookOpen color={COLORS.softPurple} size={18} />
                        </View>
                        <Text style={styles.menuItemLabel}>My Saved Tales</Text>
                    </View>
                    <ChevronRight color="#CCCCCC" size={18} />
                </TouchableOpacity>
            )}

            {/* Handle Social Link row */}
            {socialLink ? (
                <TouchableOpacity style={styles.menuItem} onPress={handleContactPress}>
                    <View style={styles.menuItemLeft}>
                        <View style={[styles.iconBackground, { backgroundColor: '#E8F0FE' }]}>
                          <Mail color={COLORS.primaryBlue} size={18} />
                        </View>
                        <Text style={styles.menuItemLabel}>
                          {isOwnProfile ? "My Contact Link" : "Contact Reader"}
                        </Text>
                    </View>
                    <ChevronRight  color="#CCCCCC" size={18} />
                </TouchableOpacity>
            ) : (
                /* Fallback if no link exists and we're looking at someone else */
                !isOwnProfile && (
                    <Text style={styles.emptyText}>No contact links shared.</Text>
                )
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.creamBg },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 25, 
    paddingTop: Platform.OS === 'android' ? 50 : 10, 
    paddingBottom: 20 
  },
  headerTitle: { fontSize: 28, fontWeight: '900', color: COLORS.primaryBlue },
  settingsButton: { backgroundColor: COLORS.white, padding: 10, borderRadius: 15, elevation: 3 },
  mainWrapper: { paddingHorizontal: 25 },
  scrollContent: { paddingTop: 10, paddingBottom: 140 },
  avatarSection: { alignItems: 'center', marginBottom: 35 },
  avatarContainer: { position: 'relative' },
  avatarCircle: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: COLORS.white, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 8, 
    marginBottom: 15, 
    overflow: 'hidden' 
  },
  avatarContactBadge: { 
    position: 'absolute', 
    bottom: 12, 
    right: -2, 
    backgroundColor: COLORS.softPurple, 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 3, 
    borderColor: COLORS.creamBg,
    elevation: 10
  },
  profileImage: { width: '100%', height: '100%' },
  avatarInitials: { fontSize: 36, fontWeight: '800', color: COLORS.softPurple },
  userName: { fontSize: 24, fontWeight: '700', color: COLORS.primaryBlue, marginBottom: 10 },
  bioContainer: { width: '100%', alignItems: 'center', paddingHorizontal: 10 },
  bioTitle: { fontSize: 13, fontWeight: '800', color: COLORS.primaryBlue, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  bioContent: { backgroundColor: 'rgba(255, 255, 255, 0.4)', padding: 12, borderRadius: 18, minWidth: '80%' },
  bioText: { fontSize: 15, color: '#444', textAlign: 'center', lineHeight: 20, fontStyle: 'italic' },
  statsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 35 },
  statItem: { flex: 1, alignItems: 'center', backgroundColor: COLORS.white, paddingVertical: 20, borderRadius: 24 },
  statValue: { fontSize: 26, fontWeight: '900', color: COLORS.softPurple },
  statLabel: { fontSize: 12, fontWeight: '600', color: COLORS.primaryBlue, marginTop: 3 },
  menuContainer: { backgroundColor: COLORS.white, borderRadius: 30, paddingHorizontal: 20, paddingVertical: 10 },
  menuTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primaryBlue, marginBottom: 8, marginTop: 15 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBackground: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F3F1FB', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuItemLabel: { fontSize: 16, fontWeight: '600', color: '#444' },
  emptyText: { textAlign: 'center', color: '#AAA', paddingVertical: 25, fontStyle: 'italic' }
});

export default ProfileScreen;