import React from "react";
import moment from "moment";
import { zeroPad } from "./ZeroPad";
export const MONTH = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];
export const FULL_MONTH = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

/**
 * Function which excepts Date instance and return i format => '2 Jan'
 * @param {*} dateValue type of Date
 */
export function getDateAndMonthName(dateValue) {
	const [date, month] = [
		dateValue.getUTCDate ? dateValue.getUTCDate() : "",
		dateValue.getUTCMonth ? dateValue.getUTCMonth() : "",
	];
	return `${date} ${MONTH[month]}`;
}

/**
 * Function which gives date of n day back.
 * @param {*} n type of integer
 * @param {*} date  type of date
 */
export function getNthDayBeforeDate(n, date = new Date()) {
	return new Date(date - n * 24 * 60 * 60 * 1000);
}

/**
 * Function which return diff between 2 dates return in integer type
 * @param {*} date1  type of date
 * @param {*} date2 type of date
 */
export function getNumberOfDaysBtwnTwoDates(date1, date2) {
	return Math.floor(Math.abs(date1 - date2) / (24 * 60 * 60 * 1000));
}

/**
 * Function which excepts date and return in ISO format but without Timezone, format type => '2021-02-22T01:31:37Z'
 * @param {*} date type of fate
 */
export function dateISOSringWithLocalTimezone(date) {
	return (
		new Date(date.getTime() - new Date().getTimezoneOffset() * 60 * 1000)
			.toISOString()
			.substr(0, 19) + "Z"
	);
}

// Function which accepts date and replaces time with current time
export function dateSringWithLocalTime(date) {
	let selDate = date;
	let d = new Date();
	let currHour = d.getHours();
	let currMinutes = d.getMinutes();
	let currSeconds = d.getSeconds();
	let currMs = d.getMilliseconds();
	selDate.setHours(currHour);
	selDate.setMinutes(currMinutes);
	selDate.setSeconds(currSeconds);
	selDate.setMilliseconds(currMs);

	return selDate;
}

/**
 * Function to format the date.
 * Copied from https://github.com/jacwright/date.format/blob/master/date.format.js
 * @param {*} date Type of date
 * @param {*} format string
 * @returns
 */
export function format(date, format = "d M Y") {
	const replace = {
		// Day
		d: function () {
			var d = this.getDate();
			return (d < 10 ? "0" : "") + d;
		}, // 01-31
		j: function () {
			return this.getDate();
		}, // 1 - 31

		// Month
		F: function () {
			return FULL_MONTH[this.getMonth()];
		}, // January - December
		m: function () {
			var m = this.getMonth();
			return (m < 9 ? "0" : "") + (m + 1);
		}, // 01-12
		M: function () {
			return MONTH[this.getMonth()];
		}, // Jan - Dec
		n: function () {
			return this.getMonth() + 1;
		}, // 1-12

		// Year
		Y: function () {
			return this.getFullYear();
		}, // 2021
		y: function () {
			return ("" + this.getFullYear()).substr(2);
		}, // 21
	};

	return format.replace(/(\\?)(.)/g, function (_, esc, chr) {
		return esc === "" && replace[chr] ? replace[chr].call(date) : chr;
	});
}

export function dateResetTimeZone(date) {
	return date
		? new Date(
				`${date.getFullYear()}-${zeroPad(
					date.getMonth() + 1,
					2
				)}-${zeroPad(date.getDate(), 2)}T00:00:00Z`
		  )
		: null;
}

export function timeSince(date1, date2) {
	var seconds = date2
		? Math.floor(Math.abs(new Date(date2) - new Date(date1)) / 1000)
		: Math.floor(Math.abs(new Date() - new Date(date1)) / 1000);
	var interval = seconds / 31536000;

	if (interval > 1) {
		return Math.floor(interval) === 1
			? "1 year"
			: Math.floor(interval) + " years";
	}
	interval = seconds / 2592000;

	if (interval > 1) {
		return Math.floor(interval) === 1
			? "1 month"
			: Math.floor(interval) + " months";
	}
	interval = seconds / 86400;

	if (interval > 1) {
		return Math.floor(interval) === 1
			? "1 day"
			: Math.floor(interval) + " days";
	}
	interval = seconds / 3600;

	if (interval > 1) {
		return Math.floor(interval) === 1
			? "1 hour"
			: Math.floor(interval) + " hours";
	}
	interval = seconds / 60;

	if (interval > 1) {
		return Math.floor(interval) === 1
			? "1 minute"
			: Math.floor(interval) + " minutes";
	}

	return Math.floor(interval) === 1
		? "1 second"
		: Math.floor(interval) + " seconds";
}
export function getDateDiff(a, b) {
	let years = moment(a).diff(b, "year");
	b = moment(b).add(years, "years");
	let months = moment(a).diff(b, "months");
	b = moment(b).add(months, "months");

	let days = moment(a).diff(b, "days");
	if (days === 0) {
		days = moment(a).diff(b, "seconds") > 0 ? 1 : 0;
	}
	return ` ${years > 0 ? `${years} ${years === 1 ? "year" : "years"}` : ""} ${
		months > 0 ? `${months} ${months === 1 ? "month" : "months"} ` : ""
	}  ${days > 0 ? `${days} ${days === 1 ? "day" : "days"}` : ""}`.trim();
}

export function fixDateTimezone(date) {
	const tz = new Date().toISOString().split("T")[1];
	return new Date([date.split("T")[0], tz].join("T"));
}

export function addSubtractMonth(_date, month) {
	var date = new Date(_date);
	var temp = date;
	temp = new Date(date.getFullYear(), date.getMonth(), 1);
	temp.setMonth(temp.getMonth() + (month + 1));
	temp.setDate(temp.getDate() - 1);

	if (date.getDate() < temp.getDate()) {
		temp.setDate(date.getDate());
	}

	return temp;
}

export function getDateByDateMonthYear(month, year, day = 1) {
	let date = new Date();
	date.setDate(day);
	date.setMonth(month - 1);
	date.setYear(year);
	return date;
}

export function UTCDateFormatter(date, dateFormat = "DD MMM YYYY") {
	let dateStringArr = new Date(date).toUTCString().split(" ");
	let monthNumber = MONTH.findIndex((month) => month === dateStringArr[2]);
	switch (dateFormat) {
		case "DD MMM YYYY":
			return (
				dateStringArr[1] +
				" " +
				dateStringArr[2] +
				" " +
				dateStringArr[3]
			);
		case "DD MMM":
			return dateStringArr[1] + " " + dateStringArr[2];
		case "MMM YYYY":
			return dateStringArr[2] + " " + dateStringArr[3];
		case "MMM YY":
			return (
				dateStringArr[2] + " " + "'" + dateStringArr[3].substring(2, 4)
			);
		case "YYYY":
			return dateStringArr[3];
		case "hh:mm DD MMM YYYY":
			return (
				dateStringArr[4].split(":")[0] +
				":" +
				dateStringArr[4].split(":")[1] +
				" " +
				dateStringArr[1] +
				" " +
				dateStringArr[2] +
				" " +
				dateStringArr[3]
			);
		case "YYYY-MM-DD":
			return `${dateStringArr[3]}-${
				monthNumber + 1 > 9 ? monthNumber + 1 : `0${monthNumber + 1}`
			}-${dateStringArr[1]}`;
		default:
			return (
				dateStringArr[1] +
				" " +
				dateStringArr[2] +
				" " +
				dateStringArr[3]
			);
	}
}

export const addTimeToDate = (t, u, d) => {
	let time = `${t} ${u}`;
	let splittedTime = time.split(" ");
	let [hours = 0, minutes = 0] = splittedTime[0].split(":");
	let isAm = splittedTime[1] === "AM"; // in europe we don't use am, the hours goes from 0 to 24

	var now = new Date(d.toString()); // now
	var date = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
	let hourToAdd = 0;
	if (+hours === 12) {
		if (isAm) {
			hourToAdd = -12; // at midnight we dont add +12 nor +0, we want 12am to be 0 hours
		} else {
			hourToAdd = 0;
		}
	} else {
		hourToAdd = isAm ? 0 : 12;
	}
	// use setHours to set time
	date.setHours(+hours + hourToAdd, +minutes, 0, 0);
	return date?.toISOString();
};

export const numberGenerator = (startNumber = 0, endNumber = 1) => {
	const numArray = [];

	for (let i = startNumber; i <= endNumber; i++) {
		i = i.toLocaleString("en-US", {
			minimumIntegerDigits: 2,
			useGrouping: false,
		});
		numArray.push(i);
	}
	return numArray;
};

export const calculateUTCTime = (t, u) => {
	let time = `${t} ${u}`;
	let splittedTime = time.split(" ");
	let [hours = 0, minutes = 0] = splittedTime[0].split(":");
	let isAm = splittedTime[1] === "AM"; // in europe we don't use am, the hours goes from 0 to 24

	// var date = new Date(d.toString()); // now

	let hourToAdd = 0;
	if (+hours === 12) {
		if (isAm) {
			hourToAdd = -12; // at midnight we dont add +12 nor +0, we want 12am to be 0 hours
		} else {
			hourToAdd = 0;
		}
	} else {
		hourToAdd = isAm ? 0 : 12;
	}
	return { hours: +hours + hourToAdd, minutes: +minutes };
};

export const timeGenerator = (interval = 30) => {
	var x = interval; //minutes interval
	var times = []; // time array
	var tt = 0; // start time
	var ap = ["AM", "PM"]; // AM-PM

	//loop to increment the time and push results in array
	for (var i = 0; tt < 24 * 60; i++) {
		var hh = Math.floor(tt / 60); // getting hours of day in 0-24 format
		var mm = tt % 60; // getting minutes of the hour in 0-55 format
		const time =
			("0" + (hh === 0 || hh === 12 ? 12 : hh % 12)).slice(-2) +
			":" +
			("0" + mm).slice(-2) +
			" " +
			ap[Math.floor(hh / 12)];
		times[i] = { time: time, value: time };
		// pushing data in array in [00:00 - 12:00 AM/PM format]
		tt = tt + x;
	}
	return times;
};
