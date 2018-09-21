// Our saved date string format is 'MM-DD-YY'

export const getDateStringForEntry = match => {
  return match.params.date || convertDateToString(new Date());
};

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

export const convertDateStringToDate = str => {
  return new Date(Date.parse(str.replace(/-/g, "/")));
};

export const isValidDateString = str => {
  return isValidDate(convertDateStringToDate(str));
};

export const convertDateToString = date => {
  return date.toLocaleDateString("en-US").replace(/\//g, "-");
};

export const getFirstDayOfMonth = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth(), 0);
};

export const getLastDayOfMonth = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

export const prettifyDate = date => {
  if (typeof date === "string") {
    date = convertDateStringToDate(date);
  }

  var options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  };

  return date.toLocaleDateString("en-US", options);
};
