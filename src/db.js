import * as firebase from "firebase/app";
import "firebase/firestore";
import config from "./config";
import debug from "debug";

const log = debug("app:db");

firebase.initializeApp(config);

const db = firebase.firestore();

db.settings({
  timestampsInSnapshots: true
});

db.enablePersistence().catch(function(err) {
  console.error("Persistence failed");
  console.error(err);
});

// date should be formatted dd/mm/yy
export const getEntry = (uid, date) => {
  const ref = db.collection("posts").doc(uid + date);
  return ref.get();
};

export const setEntry = (uid, date, options) => {
  const ref = db.collection("posts").doc(uid + date);
  return ref.set(options);
};

export const getEntriesAfterDate = (date, uid) => {
  log("entries for database");
  log("start date: %s", date);
  log("uid: %s", uid);
  return db
    .collection("posts")
    .where("date", ">", date)
    .where("userId", "==", uid)
    .orderBy("date");
};
