import Papa from "papaparse";
import moment from "moment";
import { currencyCodes } from "../../constants/currency";

export const reqHeaders = {
	DATE: "date",
	DESCRIPTION: "description",
	AMOUNT: "amount",
	CURRENCY: "currency",
};

export const DATE_OPTIONS = {
	"YYYY-MM-DD": "yyyy-MM-dd",
	"MM-DD-YYYY": "MM-dd-yyyy",
	"DD-MM-YYYY": "dd-MM-yyyy",
};

export const invalidCharacters = [
	"+",
	"=",
	"-",
	"@",
	encodeURI("\\t"),
	encodeURI("\\n"),
	encodeURI("\\r"),
];

export const validateDescription = (text) => {
	return (
		text &&
		!invalidCharacters.some((el) => text.substring(0, 1).includes(el))
	);
};

export const validateDateFormate = (date, dateFormat) => {
	if (new Date(moment(date, dateFormat)) > new Date()) {
		return false;
	} else {
		return moment(date, dateFormat).format(dateFormat) === date;
	}
};

export const validateAmount = (amount) => {
	if (amount) {
		if (amount.includes("+")) {
			return false;
		}
		if (isNaN(amount)) {
			return false;
		}

		if (amount.includes(".")) {
			if (
				Number(amount.split(".")[0]).toString() !== amount.split(".")[0]
			) {
				return false;
			}
		} else {
			if (Number(amount).toString() !== amount) {
				return false;
			}
		}
		return true;
	} else {
		return false;
	}
};

export const validateCurrency = (currency) => {
	if (currency && typeof currency === "string") {
		return currencyCodes.includes(currency?.trim());
	} else {
		return false;
	}
};

export function downloadInvalidRows(data) {
	var csv = Papa.unparse(data);
	var csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	var csvURL = null;
	csvURL = window.URL.createObjectURL(csvData);
	var tempLink = document.createElement("a");
	tempLink.href = csvURL;
	tempLink.setAttribute("download", "download.csv");
	tempLink.click();
}

export const isCSVFile = (file) => {
	if (file.name?.match(/\.csv\b/)) {
		return true;
	} else if (!file || !file.name?.match(/\.csv\b/)) {
		return false;
	}
};

export const isPDFFile = (file) => {
	if (file.name?.match(/\.pdf\b/)) {
		return true;
	} else if (!file || !file.name?.match(/\.pdf\b/)) {
		return false;
	}
};
