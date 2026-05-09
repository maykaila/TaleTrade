import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { 
  getBookOwners, 
  addBookToUserInventory, 
  addToWishlist 
} from '../services/userbookService';

const BookDetailScreen = ({ route, navigation }: any) => {
  const bookData = route?.params?.bookData; 

  const [owners, setOwners] = useState<any[]>([]);
  const [loadingAction, setLoadingAction] = useState(false);

  const bookId = bookData?.id;
  const volumeInfo = bookData?.volumeInfo || {};
  
  const title = volumeInfo.title || bookData?.title || 'Untitled Book';
  const description = volumeInfo.description || bookData?.description || 'No description available.';
  const thumbnail = volumeInfo.imageLinks?.thumbnail || bookData?.thumbnail;
  
  const rawAuthors = volumeInfo.authors || bookData?.authors;
  const authorText = Array.isArray(rawAuthors) ? rawAuthors.join(', ') : 'Unknown Author';

  const fetchOwners = async () => {
    if (!bookId) return;
    try {
      // Ensure getBookOwners returns the 'photoURL' field from the Users collection
      const data = await getBookOwners(bookId);
      setOwners(data);
    } catch (err) {
      console.log("Error fetching owners from Firestore:", err);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, [bookId]);

  // Helper to get initials if photo is missing
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    return parts.length > 1 
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() 
      : parts[0][0].toUpperCase();
  };

  const handleAddBook = async () => {
    if (!bookData) return;
    setLoadingAction(true);
    try {
      await addBookToUserInventory(bookData);
      Alert.alert("Success", "Book added to your inventory!");
      await fetchOwners(); 
    } catch (error) {
      Alert.alert("Error", "Could not add book. Please try again.");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleWishlist = async () => {
    if (!bookData) return;
    try {
      await addToWishlist(bookData);
      Alert.alert("Wishlist", "Added to your hearts!");
    } catch (error) {
      Alert.alert("Error", "Could not add to wishlist.");
    }
  };

  if (!bookData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#333', fontWeight: 'bold' }}>No book context parameters detected.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={styles.mainCover} />
        ) : (
          <View style={[styles.mainCover, styles.placeholderCover]}>
            <Text style={styles.placeholderText}>No Cover</Text>
          </View>
        )}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.author}>By {authorText}</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.ownButton, loadingAction && { opacity: 0.7 }]} 
          onPress={handleAddBook}
          disabled={loadingAction}
        >
          {loadingAction ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>+ Own This</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.wishButton} onPress={handleWishlist}>
          <Text style={styles.btnText}>Wishlist</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About this book</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <View style={styles.socialSection}>
        <Text style={styles.sectionTitle}>Users who own this book</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }}>
          {owners.length > 0 ? (
            owners.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.ownerCard}
                onPress={() => {
                  navigation.navigate('UserProfileView', { userId: item.id });
                }}
              >
                <View style={[
                  styles.profileCircleContainer, 
                  item.isMe && { borderColor: '#4A68BE', borderWidth: 2 } 
                ]}>
                  {/* Logic: If photo exists, show Image. Otherwise, show Initials View */}
                  {item.photo ? (
                    <Image 
                      source={{ uri: item.photo }} 
                      style={styles.profileCircle} 
                      onError={() => console.log(`Failed to load image for ${item.username}`)}
                    />
                  ) : (
                    <View style={[styles.profileCircle, styles.initialsContainer]}>
                      <Text style={styles.initialsText}>{getInitials(item.username || 'U')}</Text>
                    </View>
                  )}
                </View>
                <Text style={[
                  styles.ownerName, 
                  item.isMe && { fontWeight: 'bold', color: '#4A68BE' }
                ]}>
                  {item.username}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noOwners}>Be the first to own this!</Text>
          )}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5E9CF' },
  header: { alignItems: 'center', padding: 20 },
  mainCover: { width: 200, height: 300, borderRadius: 15, elevation: 10, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, backgroundColor: '#e2e8f0' },
  placeholderCover: { justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#cbd5e1', borderStyle: 'dashed' },
  placeholderText: { color: '#94a3b8', fontWeight: 'bold' },
  title: { fontSize: 22, fontWeight: 'bold', marginTop: 15, textAlign: 'center', color: '#333' },
  author: { fontSize: 16, color: '#6C63FF', marginTop: 5, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 },
  ownButton: { backgroundColor: '#6C63FF', padding: 12, borderRadius: 25, width: '45%', alignItems: 'center' },
  wishButton: { backgroundColor: '#b84242', padding: 12, borderRadius: 25, width: '45%', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#222' },
  description: { color: '#666', lineHeight: 22, fontSize: 14, textAlign: 'justify' },
  socialSection: { padding: 20, borderTopWidth: 1, borderColor: '#eee', marginBottom: 30 },
  ownerCard: { alignItems: 'center', marginRight: 20 },
  profileCircleContainer: { borderRadius: 35, padding: 2, justifyContent: 'center', alignItems: 'center' },
  profileCircle: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#6C63FF', backgroundColor: '#FFF' },
  // ADDED: styles for initials fallback
  initialsContainer: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  initialsText: { color: '#7E6FB0', fontWeight: 'bold', fontSize: 18 },
  ownerName: { fontSize: 12, marginTop: 5, color: '#555' },
  noOwners: { fontStyle: 'italic', color: '#999' }
});

export default BookDetailScreen;