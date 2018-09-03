import React from "react";
import DraftEditor from "draft-js-plugins-editor";
import Textarea from "react-textarea-autosize";
import createLinkifyPlugin from "draft-js-linkify-plugin";
import { EditorState, convertToRaw, convertFromRaw } from "draft-js";
import debounce from "debounce";
import pluralize from "pluralize";
import debug from "debug";

import "./Editor.css";
import "draft-js-linkify-plugin/lib/plugin.css";

const log = debug("app:Editor");

export const deserialize = value => {
  if (value) {
    if (typeof value === "string") {
      value = JSON.parse(value);
    }
    const contentState = convertFromRaw(value);
    log("returning parsed existing state");
    return EditorState.createWithContent(contentState);
  } else {
    log("creating empty state");
    return EditorState.createEmpty();
  }
};

export const serialize = state => {
  const content = state.getCurrentContent();
  return JSON.stringify(convertToRaw(content));
};

const plugins = [createLinkifyPlugin()];

export default class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.debouncedSave = debounce(this.onSave, 2000);
  }
  state = {
    prevPropsDate: this.props.date,
    editorState: deserialize(this.props.defaultEditorState)
  };

  static getDerivedStateFromProps(props, state) {
    if (props.date !== state.prevPropsDate) {
      return {
        editorState: deserialize(this.props.defaultEditorState),
        prevPropsDate: props.date
      };
    }
    return null;
  }

  render() {
    const { saving, saved, words } = this.state;

    return (
      <div>
        <DraftEditor
          placeholder="Write here..."
          editorState={this.state.editorState}
          onChange={this.onChange}
          plugins={plugins}
        />
        <div className="Editor--save-state">
          {words} {pluralize("word", words)}, {this.renderSaving()}
        </div>
      </div>
    );
  }

  renderSaving() {
    let str = "";

    // if (this.state.saving) {
    //   str += "Saving.";
    // }

    if (this.state.saved) {
      str += "saved at " + this.state.saved.toLocaleTimeString("en-US");
    } else {
      str += "unsaved";
    }

    return str;
  }

  onChange = state => {
    this.setState({ editorState: state });
    const wordCount = state
      .getCurrentContent()
      .getPlainText()
      .trim()
      .split(" ").length;

    this.debouncedSave();
    this.setState({ words: wordCount, saving: true });
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.date !== this.props.date) {
      this.debouncedSave.clear();
    }
  }

  onSave = () => {
    this.props.onRequestSave(
      {
        content: serialize(this.state.editorState),
        wordCount: this.state.editorState
          .getCurrentContent()
          .getPlainText()
          .trim()
          .split(" ").length,
        text: this.state.editorState.getCurrentContent().getPlainText()
      },
      this.props.date
    );
    this.setState({ saving: false, saved: new Date() });
  };
}
