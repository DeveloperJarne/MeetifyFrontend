function extractTimeFromDateISOstring(dateISOstring) {
  let date = dateISOstring.split("T");
  let time = date[1].split("+")[0].substr(0, 5);
  return time;
}

function extractDateFromDateISOstring(dateISOstring) {
  if (dateISOstring === undefined) {
    return "ERROR";
  }
  let date = dateISOstring.split("T")[0];
  let splittedDate = date.split("-");
  return `${splittedDate[2]}-${splittedDate[1]}-${splittedDate[0]}`;
}

function padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}

function convertMsToHM(milliseconds) {
  let seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);

  seconds = seconds % 60;
  // 👇️ if seconds are greater than 30, round minutes up (optional)
  minutes = seconds >= 30 ? minutes + 1 : minutes;

  minutes = minutes % 60;

  // 👇️ If you don't want to roll hours over, e.g. 24 to 00
  // 👇️ comment (or remove) the line below
  // commenting next line gets you `24:00:00` instead of `00:00:00`
  // or `36:15:31` instead of `12:15:31`, etc.
  hours = hours % 24;

  return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}`;
}

function make2DigitsIfNot(num) {
  if (num < 10) return `0${num}`;
  return num;
}

function openLinkExternally(link) {
  window.open(link);
}

function sortAttendeesList(list) {
  let newlist = list.sort(compare_item);
  return newlist;
}

function compare_item(a, b) {
  // a should come before b in the sorted order
  if (a.organizer !== undefined) {
    return -1;
    // a should come after b in the sorted order
  } else if (a.organizer === undefined) {
    return 1;
    // and and b are the same
  } else {
    return 0;
  }
}

function extractEmailsFromSelectedAttendees(array) {
  let arr = [];
  if (array !== undefined) {
    for (let attendee of array) {
      arr.push({ email: attendee.Email });
    }
  }
  return arr;
}

function getTimekeeperList(array) {
  let arr = [];
  if (array !== undefined) {
    for (let attendee of array) {
      arr.push({
        label: attendee.FullName,
        value: attendee.Email,
      });
    }
  }
  return arr;
}

function startOfWeek(date) {
  var diff =
    date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

function endOfWeek(date) {
  var lastday = date.getDate() - (date.getDay() - 1) + 6;
  return new Date(date.setDate(lastday));
}
function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

function dateCheckIfBetweenTwoDates(from, to, check) {

  let fDate, lDate, cDate;
  fDate = Date.parse(from);
  lDate = Date.parse(to);
  cDate = Date.parse(check);

  if ((cDate <= lDate && cDate >= fDate)) {
    return true;
  }
  return false;
}

const isToday = (someDate) => {
  const today = new Date()
  return someDate.getDate() == today.getDate() &&
    someDate.getMonth() == today.getMonth() &&
    someDate.getFullYear() == today.getFullYear()
}

function getDayName(dateStr, locale) {
  var date = new Date(dateStr);
  return date.toLocaleDateString(locale, { weekday: 'long' });
}

export {
  extractTimeFromDateISOstring, extractDateFromDateISOstring, make2DigitsIfNot, openLinkExternally, sortAttendeesList,
  extractEmailsFromSelectedAttendees, getTimekeeperList, startOfWeek, endOfWeek, convertMsToHM, millisToMinutesAndSeconds,
  dateCheckIfBetweenTwoDates, isToday, getDayName
}
