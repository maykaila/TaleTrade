import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator, RefreshControl, Image, Alert
} from 'react-native';
import { getUserInventory, removeBookFromInventory } from '../services/userbookService';
import { ArrowLeft, Trash2 } from 'lucide-react-native';

const reconstructBookData = (item: any) => ({
  id: item.bookId || item.id,
  volumeInfo: {
    title: item.title,
    authors: item.author ? item.author.split(', ') : [],
    description: item.description || '',
    imageLinks: { thumbnail: item.thumbnail || null },
  },
});

export default function MyBooksScreen({ navigation }: any) {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBooks = async () => {
    try {
      const data = await getUserInventory();
      setBooks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBooks();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert('Remove Tale', 'Remove this book from your shelf? 🥺', [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try {
            setBooks(prev => prev.filter(book => book.id !== id));
            await removeBookFromInventory(id);
          } catch (error) {
            fetchBooks();
          }
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Books</Text>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color="#4A68BE" /></View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7E6FB0" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.bentoCard}
              onPress={() => navigation.navigate('BookDetail', { bookData: reconstructBookData(item) })}
            >
              <Image source={{ uri: item.thumbnail }} style={styles.cover} />
              <View style={styles.info}>
                <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.author}>{item.author}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                <Trash2 color="#FF8DA1" size={20} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Your shelf is empty...</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5E9CF' },
  center: { flex: 1, justifyContent: 'center' },
  header: { paddingHorizontal: 25, paddingTop: 50, marginBottom: 15 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#4A68BE' },
  listContent: { paddingHorizontal: 25, paddingBottom: 100 },
  bentoCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 24, 
    padding: 15, 
    marginBottom: 15, 
    flexDirection: 'row', 
    alignItems: 'center', 
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  cover: { width: 65, height: 95, borderRadius: 12, backgroundColor: '#FDFCF0' },
  info: { flex: 1, marginLeft: 15 },
  bookTitle: { fontSize: 16, fontWeight: '800', color: '#4A68BE', marginBottom: 4 },
  author: { fontSize: 13, color: '#7E6FB0', fontWeight: '600' },
  deleteBtn: { padding: 10 },
  emptyContainer: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: '#7E6FB0', fontWeight: '600', fontStyle: 'italic' }
});