import firestore from '@react-native-firebase/firestore';

/**
 * Fetches any user's profile from Firestore by UID.
 */
export const getUserProfile = async (uid: string) => {
  try {
    const doc = await firestore().collection('Users').doc(uid).get();
    return doc.exists() ? doc.data() : null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

/**
 * Updates the user's Bio/About Me section.
 */
export const updateUserBio = async (uid: string, bio: string) => {
  try {
    return await firestore()
      .collection('Users')
      .doc(uid)
      .set({
        bio: bio,
        lastUpdated: firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
  } catch (error) {
    console.error("Error updating bio:", error);
    throw error;
  }
};

/**
 * Updates the username in the database.
 */
export const updateUserInDb = async (uid: string, username: string) => {
  try {
    return await firestore()
      .collection('Users')
      .doc(uid)
      .set({
        username: username,
        lastUpdated: firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
  } catch (error) {
    console.error("Error updating username:", error);
    throw error;
  }
};

/**
 * Legacy support for fetching username only.
 */
export const getUsername = async (uid: string) => {
  try {
    const doc = await firestore().collection('Users').doc(uid).get();
    return doc.exists() ? doc.data()?.username : null;
  } catch (error) {
    return null;
  }
};