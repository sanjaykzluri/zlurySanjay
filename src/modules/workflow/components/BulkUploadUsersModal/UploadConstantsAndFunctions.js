import Papa from "papaparse";

export const reqHeaders = {
	NAME: "name",
	DEPARTMENT: "department",
	DESIGNATION: "designation",
	"PERSONAL EMAIL": "personal email",
	"PRIMARY EMAIL": "primary email",
};

export const invalidCharacters = [
	"+",
	"=",
	"-",
	"@",
	"_",
	encodeURI("\\t"),
	encodeURI("\\n"),
	encodeURI("\\r"),
];

export const validateName = (text) => {
	return (
		text &&
		String(text)
			.toLowerCase()
			.match(/^[a-zA-Z ]{2,30}$/)
		// !invalidCharacters.some((el) => text.substring(0, 1).includes(el))
	);
};

export const validateRegex = (text) => {
	return (
		text &&
		!validateEmail(text) &&
		String(text)
			.toLowerCase()
			.match(/^[a-zA-Z].*[\s\.]*$/)
		// !invalidCharacters.some((el) => text.substring(0, 1).includes(el))
	);
};

export const validateEmail = (email) => {
	return String(email)
		.toLowerCase()
		.match(
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		);
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
