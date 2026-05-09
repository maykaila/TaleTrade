import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform, StatusBar, Image } from 'react-native';
import { Settings, BookOpen, ChevronRight } from 'lucide-react-native';
import auth from '@react-native-firebase/auth';
import { useIsFocused } from '@react-navigation/native';
import { getUserProfile } from '../services/userService';

const COLORS = { primaryBlue: '#4A68BE', softPurple: '#7E6FB0', creamBg: '#F5E9CF', white: '#FFFFFF' };

const ProfileScreen = ({ navigation, route }: any) => {
  // 1. ALL HOOKS MUST GO AT THE VERY TOP
  const isFocused = useIsFocused();
  
  const [userName, setUserName] = useState('...');
  const [bio, setBio] = useState('...');
  const [initials, setInitials] = useState('??');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // 2. Variables derived from props/auth
  const visitedUserId = route?.params?.userId;
  const isOwnProfile = !visitedUserId || visitedUserId === auth().currentUser?.uid;

  const fetchAndSetUserData = useCallback(async () => {
    const targetUid = visitedUserId || auth().currentUser?.uid;
    if (targetUid) {
      const userData = await getUserProfile(targetUid);
      
      setUserName(userData?.username || 'Explorer');
      setBio(userData?.bio || 'Introduce yourself to the community! 📚');
      setProfileImage(userData?.photoURL || null);

      const nameParts = (userData?.username || 'Explorer').trim().split(' ');
      setInitials(nameParts.length > 1 
        ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase() 
        : nameParts[0][0].toUpperCase()
      );
    }
  }, [visitedUserId]);

  useEffect(() => {
    if (isFocused) {
      fetchAndSetUserData();
    }
  }, [isFocused, fetchAndSetUserData]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {isOwnProfile && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.settingsButton}>
            <Settings color={COLORS.primaryBlue} size={24} />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView 
        contentContainerStyle={[
            styles.scrollContent, 
            !isOwnProfile && { paddingTop: 40 } 
        ]} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainWrapper}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              {profileImage ? <Image source={{ uri: profileImage }} style={styles.profileImage} /> : <Text style={styles.avatarInitials}>{initials}</Text>}
            </View>
            <Text style={styles.userName}>{userName}</Text>
            <View style={styles.bioContainer}>
              <Text style={styles.bioTitle}>About Me</Text>
              <View style={styles.bioContent}><Text style={styles.bioText}>{bio}</Text></View>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}><Text style={styles.statValue}>12</Text><Text style={styles.statLabel}>Tales Read</Text></View>
            <View style={{ width: 15 }} />
            <View style={styles.statItem}><Text style={styles.statValue}>4</Text><Text style={styles.statLabel}>Tales Traded</Text></View>
          </View>

          {isOwnProfile && (
            <View style={styles.menuContainer}>
              <Text style={styles.menuTitle}>Library</Text>
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}><View style={styles.iconBackground}><BookOpen color={COLORS.softPurple} size={18} /></View><Text style={styles.menuItemLabel}>My Saved Tales</Text></View>
                <ChevronRight color="#CCCCCC" size={18} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ... styles remain exactly the same
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.creamBg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingTop: Platform.OS === 'android' ? 50 : 0, paddingBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: COLORS.primaryBlue },
  settingsButton: { backgroundColor: COLORS.white, padding: 10, borderRadius: 15, elevation: 3 },
  mainWrapper: { paddingHorizontal: 25 },
  scrollContent: { paddingTop: 10, paddingBottom: 140 },
  avatarSection: { alignItems: 'center', marginBottom: 35 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', elevation: 8, marginBottom: 15, overflow: 'hidden' },
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
});

export default ProfileScreen;