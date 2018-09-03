import React from "react";
import { Redirect } from "react-router";
import firebase from "firebase";
import { loginWithGoogle } from "../auth";
import Button from "./Button";
import "./Login.css";
import google from "./login-google.svg";
import Helmet from "react-helmet";
import Logo from "./Logo";
import pencil from "./logo.svg";

export default class Login extends React.Component {
  state = {
    loading: false,
    redirect: false
  };

  render() {
    const { from } = this.props.location.state || { from: "/" };

    if (this.state.redirect) {
      return <Redirect to={from} />;
    }

    return (
      <div className="Login-background">
        <Helmet>
          <title>
            Word Herder - The simple way to maintain a daily journal
          </title>
        </Helmet>
        <Logo />
        <div className="Login">
          <div>
            {this.state.error && <div>An error occurred</div>}

            <h1>The simple way to maintain a daily journal</h1>
            <p>
              So you want to write, but you struggle with motivation. You're not
              alone. WordHerder encourages you to get your ideas out while
              causing as little friction as possible. It's about writing, and
              that's it. And it's entirely free.
            </p>
            <Button
              disabled={this.state.loading}
              onClick={this.loginWithGoogle}
            >
              <img className="Login-logo" src={google} />
              <div>Sign in with google</div>
            </Button>
            <div className="Login-legal">
              Click "Sign in" above to accept our Terms of service
            </div>
          </div>
          <div>
            <img className="Login-icon" src={pencil} />
          </div>
        </div>
        <div className="Login-footer">
          <p>
            Created by <a href="https://twitter.com/BenMcMahen">Ben McMahen</a>
          </p>
        </div>
      </div>
    );
  }

  loginWithGoogle = async () => {
    this.setState({ loading: true });
    try {
      await loginWithGoogle();
      this.setState({ redirect: true, loading: false });
    } catch (err) {
      console.error(err);
      this.setState({ loading: false, error: true });
    }
  };
}
