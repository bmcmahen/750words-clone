import React from "react";
import "./IconButton.css";

const IconButton = ({ onClick, children, active }) => (
  <button
    onClick={onClick}
    className="IconButton"
    style={{
      background: active ? "#fafafa" : null,
      border: active ? "1px solid #42b983" : null
    }}
  >
    <img src={children} />
  </button>
);

export default IconButton;
