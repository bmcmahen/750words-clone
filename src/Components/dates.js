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
