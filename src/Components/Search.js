import firebase from "firebase";
import algoliasearch from "algoliasearch";
import React from "react";
import config from "../config";
import "./Search.css";

import debug from "debug";

const { projectId, ALGOLIA_APP_ID } = config;
const log = debug("app:Search");

class Search {
  getIndex = async () => {
    try {
      this.idToken = await firebase.auth().currentUser.getIdToken();
      const response = await window.fetch(
        "https://us-central1-" + projectId + ".cloudfunctions.net/api/query/",
        {
          headers: { Authorization: "Bearer " + this.idToken }
        }
      );
      const data = await response.json();
      this.client = algoliasearch(ALGOLIA_APP_ID, data.key);
      this.index = this.client.initIndex("posts");
    } catch (err) {
      throw err;
    }
  };

  search = async query => {
    if (!this.index) {
      await this.getIndex();
    }

    log("query: %s", query);
    return this.index.search({
      query,
      snippetEllipsisText: "..."
    });
  };
}

class SearchElement extends React.Component {
  state = {
    results: [],
    query: this.props.defaultQuery || ""
  };

  search = async term => {
    if (!this.algolia) {
      this.algolia = new Search();
    }

    const results = await this.algolia.search(term);
    log("results: %o", results);
    this.setState({ results });
  };

  render() {
    return (
      <div className="Search">
        <form onSubmit={this.submit}>
          <input
            id="search"
            placeholder="Search"
            autoComplete="off"
            value={this.state.query}
            onChange={e => {
              if (!e.target.value) {
                return this.setState({
                  query: "",
                  results: []
                });
              }
              this.search(e.target.value);
              this.setState({
                query: e.target.value
              });
            }}
          />
        </form>
        {!this.state.query && (
          <div className="Search-hint">
            Enter search terms above to search your journal, including dates,
            and the actual contents.
          </div>
        )}
        {this.props.children(this.state.results)}
      </div>
    );
  }

  submit = e => {
    e.preventDefault();
  };
}

export default SearchElement;
