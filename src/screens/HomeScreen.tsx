import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import { fetchBooksByGenre } from '../services/bookService';
import { getUserGenres } from '../services/genreService'; 
import { getUsername } from '../services/userService';
import BookCard from '../component/BookCard';

const GENRES = ['Recommended', 'Contemporary', 'Memoir', 'Dystopian', 'Self-Help', 'Paranormal', 'Classics', 'Graphic Novel', 'Thriller & Suspense', 'Fantasy', 'Mystery', 'Historical Fiction'];

const HomeScreen = ({ navigation }: any) => {
  const [sections, setSections] = useState<{[key: string]: any[]}>({});
  const [userName, setUserName] = useState('Reader'); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        const user = auth().currentUser;
        if (user) {
          const name = await getUsername(user.uid);
          setUserName(name || 'Reader');
        }
        const userPrefs = await getUserGenres();
        const recQuery = (userPrefs && userPrefs.length > 0) ? userPrefs[0] : 'fiction';
        const data: {[key: string]: any[]} = {};
        await Promise.all(GENRES.map(async (genre) => {
            let query = genre === 'Recommended' ? recQuery : genre;
            data[genre] = await fetchBooksByGenre(query);
        }));
        setSections(data);
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    loadAllData();
  }, []);

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#7E6FB0" />
    </View>
  );

  return (
    <ScrollView style={styles.container} nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Good Day, {userName} !</Text>
      </View>

      {GENRES.map((genre) => (
        <View key={genre} style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={styles.genreTitle}>{genre === 'Recommended' ? 'Recommended for you' : genre}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('GenreDetail', { genreName: genre })}>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={sections[genre] || []}
            renderItem={({ item }) => (
              <View style={styles.cardWrapper}><BookCard book={item} /></View>
            )}
            keyExtractor={(item, index) => `${genre}-${index}`}
            contentContainerStyle={{ paddingLeft: 15 }}
          />
        </View>
      ))}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5E9CF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5E9CF' },
  header: { paddingTop: 60, paddingHorizontal: 25, marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#4A68BE' },
  section: { marginBottom: 25 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 12 },
  genreTitle: { fontSize: 20, fontWeight: '800', color: '#7E6FB0' },
  viewAll: { color: '#4A68BE', fontWeight: '700', fontSize: 14 },
  cardWrapper: { width: 140, marginRight: 5 }
});

export default HomeScreen;