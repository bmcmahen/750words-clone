const functions = require("firebase-functions");
const algoliasearch = require("algoliasearch");
const admin = require("firebase-admin");
const secureCompare = require("secure-compare");
const promisePool = require("es6-promise-pool");
const Bluebird = require("bluebird");
const PromisePool = promisePool.PromisePool;

admin.initializeApp();

// Algolia search support
const ALGOLIA_ID = functions.config().algolia.app_id;
const ALGOLIA_ADMIN_KEY = functions.config().algolia.api_key;
const ALGOLIA_SEARCH_KEY = functions.config().algolia.search_key;

const ALGOLIA_INDEX_NAME = "posts";

console.log(ALGOLIA_ID);
console.log(ALGOLIA_ADMIN_KEY);

const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);

function getFirebaseUser(req, res, next) {
  console.log("Check if request is authorized with Firebase ID token");

  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer ")
  ) {
    console.error(
      "No Firebase ID token was passed as a Bearer token in the Authorization header.",
      "Make sure you authorize your request by providing the following HTTP header:",
      "Authorization: Bearer <Firebase ID Token>"
    );
    res.status(403).send("Unauthorized");
    return;
  }

  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    console.log("Found 'Authorization' header");
    idToken = req.headers.authorization.split("Bearer ")[1];
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedIdToken => {
      console.log("ID Token correctly decoded", decodedIdToken);
      req.user = decodedIdToken;
      next();
    })
    .catch(error => {
      console.error("Error while verifying Firebase ID token:", error);
      res.status(403).send("Unauthorized");
    });
}

const app = require("express")();
app.use(require("cors")({ origin: true }));

/**
 * Run a search query from the client side
 */

app.get("/query", getFirebaseUser, (req, res) => {
  console.log("Running search query");
  const params = {
    filters: `userId:${req.user.user_id}`,
    userToken: req.user.user_id
  };
  const key = client.generateSecuredApiKey(ALGOLIA_SEARCH_KEY, params);
  res.json({ key });
});

/**
 * Index our text
 */

app.get("/index-fulltext", (req, res) => {
  const key = req.query.key;
  console.log("Running index fulltext");

  if (!secureCompare(key, functions.config().cron.key)) {
    res.status(403).send("Security key does not match");
    return null;
  }

  const index = client.initIndex(ALGOLIA_INDEX_NAME);

  index.setSettings({
    attributesToSnippet: ["text:30"],
    snippetEllipsisText: "…"
  });

  return getEntriesToIndex()
    .then(entriesToIndex => {
      console.log("updating entries: %s", entriesToIndex.size);
      console.log(entriesToIndex);
      return Bluebird.map(entriesToIndex.docs, indexEntry, { concurrency: 4 });
    })
    .then(() => {
      res.send("Finished");
    });
});

function getEntriesToIndex() {
  const posts = admin.firestore().collection("posts");
  const d = new Date();
  d.setDate(d.getDate() - 1); // we run this daily, so one day old
  const query = posts.where("indexed", "==", false);
  return query.get();
}

function indexEntry(entry) {
  console.log("Entry", entry);
  const post = entry.data();
  post.objectID = entry.id;
  const index = client.initIndex(ALGOLIA_INDEX_NAME);

  return index.saveObject(post).then(() => {
    return admin
      .firestore()
      .collection("posts")
      .doc(entry.id)
      .set({ indexed: true }, { merge: true });
  });
}

exports.api = functions.https.onRequest(app);
