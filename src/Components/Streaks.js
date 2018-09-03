import React from "react";
import { withRouter } from "react-router-dom";
import {
  getFirstDayOfMonth,
  getLastDayOfMonth,
  convertDateToString
} from "./dates";
import { getEntriesAfterDate } from "../db";
import CalendarHeatmap from "react-calendar-heatmap";
import firebase from "firebase";
import debug from "debug";
import ReactTooltip from "react-tooltip";
import "./Tooltip.css";

import "./Streaks.css";

const log = debug("app:Streaks");

function linearConversion(a, b) {
  var o = a[1] - a[0],
    n = b[1] - b[0];

  return function(x) {
    return ((x - a[0]) * n) / o + b[0];
  };
}

const conversion = linearConversion([0, 1000], [0, 4]);

class Streaks extends React.Component {
  state = {
    posts: []
  };

  componentDidMount() {
    this.fetchMonth();
  }

  getTooltipDataAttrs = value => {
    if (value.count && value.date) {
      return {
        "data-tip": `${convertDateToString(value.date)} - ${value.count} words`
      };
    }
  };

  fetchMonth = () => {
    const userId = firebase.auth().currentUser.uid;
    const date = getFirstDayOfMonth();
    this.unsubscribe = getEntriesAfterDate(date, userId).onSnapshot(
      snap => {
        const posts = [];

        snap.docs.forEach(post => {
          const postData = post.data();
          posts.push({
            date: postData.date.toDate(),
            count: postData.wordCount
          });
        });

        log("fetched posts: %o", posts);
        this.setState({ posts }, () => {
          ReactTooltip.rebuild();
        });
      },
      err => {
        console.error(err);
      }
    );
  };

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const startOfMonth = getFirstDayOfMonth();
    const endOfMonth = getLastDayOfMonth();

    return (
      <div className="Streaks">
        <CalendarHeatmap
          startDate={startOfMonth}
          endDate={endOfMonth}
          classForValue={value => {
            let cx = "";
            if (value && value.count) {
              cx += "clickable ";
            }

            if (value && value.count) {
              let count = conversion(value.count);

              if (count > 4) count = 4;
              cx += `color-github-${Math.ceil(count)} `;
            }

            if (!value) {
              cx += `color-empty `;
            }
            return cx;
          }}
          onClick={value => {
            this.props.history.push("/" + convertDateToString(value.date));
          }}
          showMonthLabels={false}
          titleForValue={this.getTitle}
          tooltipDataAttrs={this.getTooltipDataAttrs}
          values={this.state.posts}
          horizontal={false}
        />
        <ReactTooltip />
      </div>
    );
  }
}

export default withRouter(Streaks);
