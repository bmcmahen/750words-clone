import React, { Component } from "react";
import Routes from "./Router/routes";
import firebase from "firebase";
import Loading from "./Components/Loading";
import "./App.css";

class App extends Component {
  state = {
    auth: null,
    loaded: false
  };

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      this.setState({ auth: user, loaded: true });
    });
  }
  render() {
    const { loaded } = this.state;

    if (!loaded) {
      return <Loading />;
    }

    return (
      <div className="App">
        <Routes />
      </div>
    );
  }
}

export default App;
