import React from "react";
import "./Popover.css";

class Popover extends React.Component {
  render() {
    return (
      <React.Fragment>
        {this.props.showing && (
          <div
            onClick={this.onClick}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              left: 0,
              bottom: 0,
              zIndex: 2
            }}
          />
        )}
        <div
          ref={el => (this.el = el)}
          className={"Popover " + (this.props.showing ? "showing" : "")}
        >
          {this.props.children}
        </div>
      </React.Fragment>
    );
  }

  onClick = e => {
    this.props.onRequestClose();
  };
}

export default Popover;
