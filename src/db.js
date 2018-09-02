import * as firebase from "firebase/app";
import "firebase/firestore";
import config from "./config";

firebase.initializeApp(config);

const db = firebase.firestore();

// date should be formatted dd/mm/yy
export const getEntry = (uid, date) => {
  const ref = db.collection("posts").doc(uid + date);
  return ref.get();
};

export const setEntry = (uid, date, options) => {
  const ref = db.collection("posts").doc(uid + date);
  return ref.set(options);
};
