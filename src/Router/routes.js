import React from "react";
import { BrowserRouter, Switch, Redirect, Route } from "react-router-dom";
import firebase from "firebase";
import Login from "../Components/Login";
import Write from "../Components/Write";

const PrivateRoute = ({ component: Component, ...other }) => {
  const user = firebase.auth().currentUser;
  return (
    <Route
      {...other}
      render={props => {
        if (user) {
          return <Component {...props} />;
        } else {
          return (
            <Redirect
              to={{
                pathname: "/login",
                state: { from: props.location }
              }}
            />
          );
        }
      }}
    />
  );
};

const Routes = () => (
  <BrowserRouter>
    <Switch>
      <Route path="/login" component={Login} />
      <PrivateRoute path="/:date?" component={Write} />
    </Switch>
  </BrowserRouter>
);

export default Routes;
