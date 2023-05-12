import { useEffect, useState } from "react";
import _ from "underscore";
import Handlebars from "handlebars";

export const debounce = (fn, delay) => {
	let inDebounce;
	return function () {
		const context = this;
		const args = arguments;
		clearTimeout(inDebounce);
		inDebounce = setTimeout(
			async () => await fn.apply(context, args),
			delay
		);
	};
};

export const isEmpty = (value) => {
	if (Array.isArray(value)) {
		return value.length === 0;
	}
	return !value;
};

export const getValidator = (type) => {
	const validator = {
		text: { validate: (field) => !!field },
		email: {
			validate: (field) => {
				let re = /\S+@\S+\.\S+/;
				return re.test(field);
			},
		},
	};
	return validator[type];
};

export const isFormValid = (data, requiredFields) => {
	if (Array.isArray(data)) {
		for (let i = 0; i < data.length; i++) {
			if (!isFormValid(data[i], requiredFields)) return false;
		}
		return true;
	}
	for (let i = 0; i < requiredFields.length; i++) {
		if (typeof data[requiredFields[i]] === "number") {
			if (isNaN(data[requiredFields[i]])) {
				return false;
			}
		} else if (!data[requiredFields[i]]) return false;
	}
	return true;
};

export function ImmutableSet() {
	this.set = new Set();
	this.add = function (val) {
		this.set = new Set(this.set.add(val));
		return this;
	};
	this.delete = function (val) {
		this.set.delete(val);
		this.set = new Set(this.set);
		return this;
	};
}

export function capitalizeFirstLetter(s) {
	if (typeof s !== "string") return "";
	return s.charAt(0).toUpperCase() + s.slice(1);
}

export function sanitizeFilename(fileName, options) {
	const lastIndex = fileName.lastIndexOf(".");
	const name = fileName.substr(0, lastIndex);
	const extension = fileName.substr(lastIndex + 1, fileName.length);

	const illegalRegex = /\s/g;
	let sanitized = name
		.replace(illegalRegex, options?.replacement || "_")
		.replaceAll(" ", "_");

	const sanitizeFilename = `${sanitized}.${extension}`;
	return sanitizeFilename;
}

export function kFormatter(number, digitsAfterDecimal) {
	var SI_SYMBOL = ["", "k", "M", "G", "T", "P", "E"];

	var tier = (Math.log10(number) / 3) | 0;

	// if zero, we don't need a suffix
	if (tier == 0) return parseFloat(number).toFixed(digitsAfterDecimal || 0);

	// get suffix and determine scale
	var suffix = SI_SYMBOL[tier];
	var scale = Math.pow(10, tier * 3);

	// scale the number
	var scaled = number / scale;

	// format number and add suffix
	return scaled.toFixed(1) + suffix;
}

export const urlifyImage = (image) => {
	return image && typeof image === "string"
		? image?.trim()?.replace(/\s/g, "%20")
		: "";
};

export const unescape = (str) => {
	return str && typeof str === "string"
		? str
				.replace(/&amp;/g, "&")
				.replace(/&quot;/g, '"')
				.replace(/&#x27;/g, "'")
				.replace(/&lt;/g, "<")
				.replace(/&gt;/g, ">")
				.replace(/&#x2F;/g, "/")
				.replace(/&#x5C;/g, "\\")
				.replace(/&#96;/g, "`")
				.replace(/[{(}]/g, "(")
				.replace(/[{)}]/g, ")")
		: "";
};

export const arrayOfFirstGivenNumbers = (n) => {
	var tempArr = [];
	for (var i = 1; i <= n; i++) {
		tempArr.push(i);
	}
	return tempArr;
};

export const recursive_unescape_response_data = (obj) => {
	if (Array.isArray(obj)) {
		for (let i = 0; i < obj.length; i++) {
			if (typeof obj[i] === "object") {
				recursive_unescape_response_data(obj[i]);
			} else if (typeof obj[i] === "string") {
				obj[i] = unescape(obj[i]);
			}
		}
	} else {
		for (const key in obj) {
			if (typeof obj[key] === "object") {
				recursive_unescape_response_data(obj[key]);
			} else if (typeof obj[key] === "string") {
				obj[key] = unescape(obj[key]);
			}
		}
	}
	return obj;
};

export const recursive_decode_request_data = (obj) => {
	if (Array.isArray(obj)) {
		for (let i = 0; i < obj.length; i++) {
			if (typeof obj[i] === "object") {
				recursive_decode_request_data(obj[i]);
			} else if (typeof obj[i] === "string") {
				obj[i] = decodeURIComponent(obj[i]);
			}
		}
	} else {
		for (const key in obj) {
			if (typeof obj[key] === "object") {
				recursive_decode_request_data(obj[key]);
			} else if (typeof obj[key] === "string") {
				obj[key] = decodeURIComponent(obj[key]);
			}
		}
	}
	return obj;
};

export function getUrlVars(path) {
	let url = path ? path : window.location.href,
		vars = {};
	url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
		key = decodeURIComponent(key);
		value = decodeURIComponent(value);
		vars[key] = value;
	});
	return vars;
}

export function sumOfArray(arr) {
	if (!Array.isArray(arr)) {
		return 0;
	}
	function getSum(total, num) {
		return total + num;
	}

	let total = arr.reduce(getSum, 0);
	return total;
}

export const escapeURL = (str) => {
	return str ? str.replace("&", "%26").replace("#", "%23") : ""; //add more special characters if required
};

export const withHttp = (url) =>
	!/^https?:\/\//i.test(url) ? `http://${url}` : url;

export function useWindowSize() {
	const [windowSize, setWindowSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	});

	useEffect(() => {
		function handleResize() {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		}
		const throttledHandleresize = _.throttle(handleResize, 100);
		window.addEventListener("resize", throttledHandleresize);
		handleResize();
		return () => window.removeEventListener("resize", handleResize);
	}, []);
	return windowSize;
}

export const getStringFromTemplate = (string, metadata) => {
	try {
		const templateString = string
			.replaceAll("((", "{{")
			.replaceAll("))", "}}");
		let template = Handlebars.compile(templateString || "");
		return template(metadata);
	} catch (e) {
		return "";
	}
};

export const getColor = (index, max) => {
	const start = [87, 143, 245];
	const end = [213, 228, 255];
	const colors = [];
	for (let i = 0; i < 3; i++) {
		colors.push(start[i] + ((end[i] - start[i]) * index) / max);
	}
	return `rgb(${colors.join(",")})`;
};

export function truncateText(text, max = 42) {
	return text?.length > max ? `${text.slice(0, max)}...` : text;
}

export const allowDigitsOnly = (e) => {
	if (
		!(
			e.keyCode == 8 ||
			(e.keyCode > 47 && e.keyCode < 58) ||
			(e.keyCode > 95 && e.keyCode < 106)
		)
	) {
		e.preventDefault();
	}
};
