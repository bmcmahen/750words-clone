import firebase from "firebase";
import { projectId, ALGOLIA_APP_ID } from "../config";

class Search {
  getIndex = async () => {
    try {
      this.idToken = await firebase.auth().currentUser.getIdToken();
      const response = await window.fetch(
        "https://us-central1-" +
          projectId +
          ".cloudfunctions.net/getSearchKey/",
        {
          headers: { Authorization: "Bearer " + token }
        }
      );
      const data = await response.json();
      this.client = algoliasearch(ALGOLIA_APP_ID, data.key);
      this.index = this.client.initIndex("posts");
    } catch (err) {
      throw err;
    }
  };

  search = async ({ query }) => {
    if (!index) {
      await this.getIndex();
    }

    return this.index.search({ query });
  };
}

export default Search;
