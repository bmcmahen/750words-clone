import React, { PureComponent } from "react";
import "./Loading.css";

export default class Spinner extends PureComponent {
  static propTypes = {};

  static defaultProps = {
    size: 40
  };

  render() {
    const { size, ...props } = this.props;
    return (
      <div className="Loading" {...props}>
        <svg x="0px" y="0px" viewBox="0 0 150 150">
          <circle cx="75" cy="75" r="60" />
        </svg>
      </div>
    );
  }
}
