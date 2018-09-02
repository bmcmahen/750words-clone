import React from "react";
import { Redirect } from "react-router";
import firebase from "firebase";
import { loginWithGoogle } from "../auth";

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
      <div>
        {this.state.error && <div>An error occurred</div>}
        <button disabled={this.state.loading} onClick={this.loginWithGoogle}>
          Login with google
        </button>
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
