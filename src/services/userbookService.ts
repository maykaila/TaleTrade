import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const extractBookFields = (bookData: any) => {
  // If volumeInfo exists, use it. If not, the object is already flat.
  const v = bookData.volumeInfo || bookData; 
  
  return {
    bookId: bookData.id || bookData.bookId,
    title: v.title || 'Untitled',
    // Handle authors as an array or a pre-joined string
    author: Array.isArray(v.authors) 
      ? v.authors.join(', ') 
      : (v.author || 'Unknown Author'),
    thumbnail: v.imageLinks?.thumbnail?.replace('http://', 'https://') || v.thumbnail || null,
    description: v.description || '',
    publisher: v.publisher || '',
    publishedDate: v.publishedDate || '',
    pageCount: v.pageCount || 0,
    categories: v.categories || [],
    isbn: v.industryIdentifiers?.[0]?.identifier || v.isbn || '',
  };
};

/**
 * 1. CREATE: Add a book to the user's shelf.
 * Also registers ownership in top-level 'bookOwners' collection
 * so getBookOwners works WITHOUT needing a Firestore index.
 */
export const addBookToUserInventory = async (bookData: any) => {
  const userId = auth().currentUser?.uid;
  if (!userId) throw new Error("User not authenticated");

  const fields = extractBookFields(bookData);
  const batch = firestore().batch();

  // Save to user's myBooks subcollection
  const myBookRef = firestore()
    .collection('users')
    .doc(userId)
    .collection('myBooks')
    .doc(bookData.id);

  batch.set(myBookRef, {
    ...fields,
    status: 'owned',
    addedAt: firestore.FieldValue.serverTimestamp(),
  });

  // Also register in flat top-level 'bookOwners' collection
  // Structure: bookOwners/{bookId}/owners/{userId}
  const ownerRef = firestore()
    .collection('bookOwners')
    .doc(bookData.id)
    .collection('owners')
    .doc(userId);

  batch.set(ownerRef, {
    userId,
    addedAt: firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();
};

/**
 * 2. READ: Fetch all books owned by a specific user or the current user.
 * Accepting an optional userId fixes the TS(2554) error.
 */
export const getUserInventory = async (providedUserId?: string) => {
  // Use the passed ID if it exists, otherwise fallback to the current authenticated user
  const userId = providedUserId || auth().currentUser?.uid;
  if (!userId) return [];

  try {
    const snapshot = await firestore()
      .collection('users')
      .doc(userId)
      .collection('myBooks')
      .get();

    if (snapshot && !snapshot.empty) {
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return [];
  }
};

/**
 * 3. UPDATE: Change book status.
 */
export const updateBookStatus = async (bookId: string, newStatus: string) => {
  const userId = auth().currentUser?.uid;
  if (!userId) throw new Error("User not authenticated");

  await firestore()
    .collection('users')
    .doc(userId)
    .collection('myBooks')
    .doc(bookId)
    .update({ status: newStatus });
};

/**
 * 4. DELETE: Remove a book from the user's shelf.
 * Also removes from bookOwners so the social list stays accurate.
 */
export const removeBookFromInventory = async (bookId: string) => {
  const userId = auth().currentUser?.uid;
  if (!userId) throw new Error("User not authenticated");

  const batch = firestore().batch();

  const myBookRef = firestore()
    .collection('users')
    .doc(userId)
    .collection('myBooks')
    .doc(bookId);

  batch.delete(myBookRef);

  // Also remove from bookOwners
  const ownerRef = firestore()
    .collection('bookOwners')
    .doc(bookId)
    .collection('owners')
    .doc(userId);

  batch.delete(ownerRef);

  await batch.commit();
};

/**
 * 5. WISHLIST: Add to wishlist with flat fields.
 */
export const addToWishlist = async (bookData: any) => {
  const userId = auth().currentUser?.uid;
  if (!userId) throw new Error("User not authenticated");

  const fields = extractBookFields(bookData);

  await firestore()
    .collection('users')
    .doc(userId)
    .collection('wishlist')
    .doc(bookData.id)
    .set({
      ...fields,
      addedAt: firestore.FieldValue.serverTimestamp(),
    });
};

/**
 * 6. READ OWNERS: Uses flat 'bookOwners' collection.
 * NO collectionGroup = NO manual index needed.
 * Profile data pulled from 'Users' (capital U) matching your authService.
 */
export const getBookOwners = async (bookId: string) => {
  if (!bookId || typeof bookId !== 'string') {
    console.log("getBookOwners blocked: Missing or invalid bookId string path coordinate.");
    return [];
  }
  const currentUserId = auth().currentUser?.uid;

  try {
    const snapshot = await firestore()
      .collection('bookOwners')
      .doc(bookId)
      .collection('owners')
      .get();

    if (snapshot.empty) return [];

    const uniqueOwnersMap = new Map();

    await Promise.all(
      snapshot.docs.map(async (doc) => {
        const { userId } = doc.data();
        if (!uniqueOwnersMap.has(userId)) {
          // Pull profile from 'Users' (capital U) — matches your authService.ts
          const userDoc = await firestore()
            .collection('Users')
            .doc(userId)
            .get();

          const userData = userDoc.data();
          const isMe = userId === currentUserId;

          uniqueOwnersMap.set(userId, {
            id: userId,
            username: isMe
              ? "You"
              : (userData?.username || userData?.displayName || 'Anonymous'),
            // CHANGE THIS LINE: from userData?.profilePic to userData?.photoURL
            photo: userData?.photoURL || null, 
            isMe,
          });
        }
      })
    );

    // Sort so current user appears first
    const owners = Array.from(uniqueOwnersMap.values());
    return owners.sort((a, b) => (b.isMe ? 1 : 0) - (a.isMe ? 1 : 0));

  } catch (error) {
    console.error("Error fetching owners:", error);
    return [];
  }
};