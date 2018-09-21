import React from "react";
import SearchElement from "./Search";
import { signOut } from "../auth";
import "./Navbar.css";
import { Link } from "react-router-dom";
import { prettifyDate } from "./dates";

class Navbar extends React.Component {
  state = {
    searching: false
  };

  render() {
    const { searching } = this.state;

    return (
      <nav className="Navbar">
        <div className="Navbar-triggers">
          <button
            onClick={() => {
              this.setState({ searching: true }, () => {
                const el = document.getElementById("search");
                if (el) {
                  el.focus();
                }
              });
            }}
            className="Trigger-search"
          >
            search
          </button>
        </div>
      </nav>
    );
  }

  signOut = e => {
    e.preventDefault();
    signOut();
    window.location.href = "/";
  };
}

export default Navbar;
