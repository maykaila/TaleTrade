import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { searchBooks } from '../services/bookService'; 

const SearchScreen = ({ navigation }: any) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.trim().length > 2) { 
      setLoading(true);
      const books = await searchBooks(text);
      setResults(books);
      setLoading(false);
    } else {
      setResults([]); 
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Books</Text>
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search by title, author, or ISBN..."
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#7E6FB0" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.scrollContent}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.bookCard}
              onPress={() => navigation.navigate('BookDetail', { bookData: item })}
            >
              <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
              <View style={styles.bookDetails}>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.author} numberOfLines={1}>{item.authors.join(', ')}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5E9CF' },
  header: { paddingHorizontal: 25, paddingTop: 50, paddingBottom: 15 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#4A68BE' },
  inputWrapper: { paddingHorizontal: 25, marginBottom: 10 },
  searchBar: { 
    height: 54, 
    borderRadius: 20, 
    paddingHorizontal: 20, 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#4A68BE', 
    backgroundColor: '#FFFFFF',
    elevation: 3
  },
  scrollContent: { paddingHorizontal: 25, paddingTop: 10, paddingBottom: 40 },
  bookCard: { 
    flexDirection: 'row', 
    backgroundColor: '#FFFFFF', 
    padding: 14, 
    borderRadius: 24, 
    marginBottom: 16, 
    alignItems: 'center',
    elevation: 2
  },
  thumbnail: { width: 60, height: 90, marginRight: 16, borderRadius: 14 },
  bookDetails: { flex: 1 },
  title: { fontSize: 16, fontWeight: '800', color: '#4A68BE' },
  author: { fontSize: 14, fontWeight: '600', color: '#64748B', marginTop: 4 }
});

export default SearchScreen;