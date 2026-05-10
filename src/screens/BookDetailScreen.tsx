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
      const data = await getBookOwners(bookId);
      setOwners(data);
    } catch (err) {
      console.log("Error fetching owners from Firestore:", err);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, [bookId]);

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
                  // PASS hideHeader PARAMETER HERE
                  navigation.push('UserProfileView', { 
                    userId: item.id,
                    hideHeader: true 
                  });
                }}
              >
                <View style={[
                  styles.profileCircleContainer, 
                  item.isMe && { borderColor: '#4A68BE', borderWidth: 2 } 
                ]}>
                  {item.photo ? (
                    <Image 
                      source={{ uri: item.photo }} 
                      style={styles.profileCircle} 
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
  header: { alignItems: 'center', padding: 25, backgroundColor: '#F5E9CF', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 4 },
  mainCover: { width: 180, height: 270, borderRadius: 15, elevation: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  placeholderCover: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#e2e8f0' },
  placeholderText: { color: '#94a3b8', fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: '900', marginTop: 20, textAlign: 'center', color: '#4A68BE' },
  author: { fontSize: 16, color: '#7E6FB0', marginTop: 5, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 25, paddingHorizontal: 15 },
  ownButton: { backgroundColor: '#4A68BE', padding: 15, borderRadius: 20, width: '46%', alignItems: 'center', elevation: 3 },
  wishButton: { backgroundColor: '#7E6FB0', padding: 15, borderRadius: 20, width: '46%', alignItems: 'center', elevation: 3 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  section: { padding: 20, marginHorizontal: 15, backgroundColor: '#FFF', borderRadius: 20, marginBottom: 20, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 10, color: '#4A68BE' },
  description: { color: '#555', lineHeight: 22, fontSize: 14, textAlign: 'justify' },
  socialSection: { padding: 20, marginHorizontal: 15, backgroundColor: '#FFF', borderRadius: 20, marginBottom: 40, elevation: 2 },
  ownerCard: { alignItems: 'center', marginRight: 20 },
  profileCircleContainer: { borderRadius: 35, padding: 2 },
  profileCircle: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#7E6FB0', backgroundColor: '#FFF' },
  initialsContainer: { justifyContent: 'center', alignItems: 'center' },
  initialsText: { color: '#7E6FB0', fontWeight: 'bold', fontSize: 18 },
  ownerName: { fontSize: 12, marginTop: 5, color: '#555', fontWeight: '600' },
  noOwners: { fontStyle: 'italic', color: '#999', textAlign: 'center', width: '100%' }
});

export default BookDetailScreen;