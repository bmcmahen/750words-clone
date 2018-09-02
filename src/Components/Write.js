import React from "react";
import Editor from "./Editor";
import debug from "debug";
import firebase from "firebase";
import "./Write.css";
import {
  getDateStringForEntry,
  isValidDateString,
  convertDateStringToDate,
  convertDateToString
} from "./dates";
import Helmet from "react-helmet";

import { getEntry, setEntry } from "../db";
import { signOut } from "../auth";

const log = debug("app:Write");

export default class Write extends React.Component {
  state = {
    dateString: getDateStringForEntry(this.props.match),
    existingEntry: null,
    loading: true
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
      const entry = await getEntry(user.uid, dateString);
      this.setState({
        existingEntry: entry.exists ? entry.data() : null,
        loading: false
      });
    } catch (err) {
      console.error(err);
      this.setState({ loading: false, error: true });
    }
  };

  saveStateForDate = async (content, dateString) => {
    const user = firebase.auth().currentUser;
    try {
      const entry = await setEntry(user.uid, dateString, {
        content,
        dateString,
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

    return (
      <React.Fragment>
        <nav>
          <Helmet>
            <title>{date.toLocaleDateString("en-US", options)}</title>
          </Helmet>
          <div>
            {user.displayName}
            {" | "}
            <a href="#" onClick={this.signOut}>
              Sign out
            </a>
          </div>
        </nav>
        <div className="Write">
          <strong>{date.toLocaleDateString("en-US", options)}</strong>
          <Editor
            date={date}
            defaultEditorState={existingEntry ? existingEntry.content : null}
            onRequestSave={this.onRequestSave}
          />
        </div>
      </React.Fragment>
    );
  }

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
