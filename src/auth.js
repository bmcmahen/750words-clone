import firebase from "firebase";

const provider = new firebase.auth.GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await firebase.auth().signInWithPopup(provider);
    return result.user;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const signOut = () => firebase.auth().signOut();
