import React, { useEffect, useState } from 'react';
import { FlatList, View, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { fetchBooksByGenre } from '../services/bookService';
import { getUserGenres } from '../services/genreService'; 
import BookCard from '../component/BookCard';

const { width } = Dimensions.get('window');

const GenreDetailScreen = ({ route }: any) => {
  const { genreName } = route.params; 
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        let query = genreName;

        // FIX: If the genre is "Recommended", find the user's preferred genre to search for
        if (genreName === 'Recommended') {
          const userPrefs = await getUserGenres();
          query = (userPrefs && userPrefs.length > 0) ? userPrefs[0] : 'fiction';
        }

        const results = await fetchBooksByGenre(query, 40);
        setBooks(results || []);
      } catch (error) {
        console.error("Error fetching genre detail:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [genreName]);

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#7E6FB0" />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        numColumns={3}
        keyExtractor={(item, index) => `${index}`}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <BookCard book={item} />
          </View>
        )}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5E9CF' },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#F5E9CF' 
  },
  list: { 
    paddingHorizontal: 10, 
    paddingTop: 20, 
    paddingBottom: 40 
  },
  columnWrapper: {
    justifyContent: 'space-between', // Adds horizontal "air" between books
    marginBottom: 20, // Adds vertical space between rows
  },
  cardWrapper: { 
    width: (width - 64) / 3, // Precisely calculates width for 3 columns with gaps
    alignItems: 'center',
  }
});

export default GenreDetailScreen;