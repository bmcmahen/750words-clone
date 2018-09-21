import React from "react";
import Editor from "./Editor";
import debug from "debug";
import firebase from "firebase";
import "./Write.css";
import {
  getDateStringForEntry,
  isValidDateString,
  convertDateStringToDate,
  convertDateToString,
  prettifyDate
} from "./dates";
import Helmet from "react-helmet";

import { getEntry, setEntry } from "../db";
import { signOut } from "../auth";
import Streaks from "./Streaks";
import SearchElement from "./Search";
import Navbar from "./Navbar";
import { Link } from "react-router-dom";
import IconButton from "./IconButton";

import search from "./search.svg";
import Popover from "./Popover";

const log = debug("app:Write");

const Result = ({ hit }) => {
  const highlight = hit._snippetResult;

  return (
    <Link className="Navbar-Result" to={hit.dateString}>
      <div>
        <div className="Navbar-Result-date">{prettifyDate(hit.dateString)}</div>

        <p dangerouslySetInnerHTML={{ __html: highlight.text.value }} />
      </div>
    </Link>
  );
};

export default class Write extends React.Component {
  state = {
    searching: false,
    dateString: getDateStringForEntry(this.props.match),
    existingEntry: null,
    loading: true,
    expanded:
      typeof window.localStorage.getItem("expanded") === false ? false : true
  };

  static getDerivedStateFromProps(props, state) {
    if (props.match.params.date !== state.dateString) {
      return {
        dateString: getDateStringForEntry(props.match)
      };
    }

    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.dateString !== prevState.dateString) {
      this.fetchEntry(this.state.dateString);
    }
  }

  componentDidMount() {
    this.fetchEntry(this.state.dateString);
  }

  fetchEntry = async dateString => {
    const user = firebase.auth().currentUser;

    // ensure that we have a valid date, first
    const isValid = isValidDateString(dateString);

    if (!isValid) {
      this.setState({ error: true });
      return;
    }

    try {
      this.setState({ loading: true, error: false });
      log("get entry: uid: %s, date: %s", user.uid, dateString);
      const entry = await getEntry(user.uid, dateString);
      this.setState({
        existingEntry: entry.exists ? entry.data() : null,
        loading: false
      });
    } catch (err) {
      console.error("Error fetching:");
      console.error(err);
      this.setState({ loading: false, error: true });
    }
  };

  saveStateForDate = async ({ content, text, wordCount }, dateString) => {
    const user = firebase.auth().currentUser;
    try {
      const entry = await setEntry(user.uid, dateString, {
        content,
        text,
        wordCount,
        updatedAt: new Date(),
        dateString,
        indexed: false,
        date: convertDateStringToDate(dateString),
        userId: user.uid
      });
    } catch (err) {
      console.error(err);
    }
  };

  render() {
    const { dateString, loading, existingEntry, error } = this.state;
    const user = firebase.auth().currentUser;

    if (error) {
      return <div>Error loading entry</div>;
    }

    const date = convertDateStringToDate(dateString);

    var options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    };

    if (loading) {
      return null;
    }

    const { searching } = this.state;

    return (
      <React.Fragment>
        <Helmet>
          <title>{date.toLocaleDateString("en-US", options)}</title>
        </Helmet>

        <nav className="Write-branding">
          <h4>
            whatever.
            <span style={{ color: "#08e" }}>ink</span>
          </h4>
        </nav>

        <nav className="Write-nav">
          <IconButton
            active={this.state.mode === "searching"}
            onClick={() => {
              this.setState({ popover: true, mode: "searching" }, () => {
                const input = document.getElementById("search");
                if (input) {
                  input.focus();
                }
              });
            }}
          >
            {require("./search-dark.svg")}
          </IconButton>
          <IconButton
            active={this.state.mode === "activity"}
            onClick={() => {
              this.setState({ popover: true, mode: "activity" });
            }}
          >
            {require("./activity.svg")}
          </IconButton>
          <IconButton onClick={this.signOut}>
            {require("./log-out.svg")}
          </IconButton>
        </nav>
        <Popover
          showing={this.state.popover}
          onRequestClose={() => {
            this.setState({ popover: false, mode: null });
          }}
        >
          {this.state.mode === "searching" ? (
            <SearchElement>
              {results => {
                if (results.hits && results.hits.length > 0) {
                  return results.hits.map(hit => (
                    <Result key={hit.objectID} hit={hit} />
                  ));
                }

                return null;
              }}
            </SearchElement>
          ) : (
            <Streaks />
          )}
        </Popover>
        <div className="Write-container">
          <div className="Write">
            <h3>{date.toLocaleDateString("en-US", options)}</h3>
            <Editor
              date={date}
              defaultEditorState={existingEntry ? existingEntry.content : null}
              onRequestSave={this.onRequestSave}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }

  toggle = () => {
    const existing = this.state.expanded;
    this.setState({ expanded: !existing });
    window.localStorage.setItem("expanded", !existing);
  };

  signOut = e => {
    e.preventDefault();
    signOut();
    window.location.href = "/";
  };

  onRequestSave = (content, date) => {
    log("Save to server");
    this.saveStateForDate(content, convertDateToString(date));
  };
}
