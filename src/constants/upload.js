import _ from "underscore";
import csv from "../components/Onboarding/csv.svg";
import pdf from "../assets/licenses/pdf.svg";
import documentIcon from "../assets/documentIcon.svg";

export const SUPPORTED_IMAGE_FORMATS = [
	"image/jpg",
	"image/jpeg",
	"image/png",
	".png",
	".jpg",
	".jpeg",
];

export const SUPPORTED_FILE_FORMATS = [
	...SUPPORTED_IMAGE_FORMATS,
	".pdf",
	".docx",
	".ppt",
	".doc",
	".pptx",
	".csv",
	".xls",
	".xlsx",
];

export function isValidFile(file) {
	var fileNameSplit = file?.name.split(".");
	var fileExtension = "." + fileNameSplit[fileNameSplit?.length - 1];
	if (SUPPORTED_FILE_FORMATS.includes(fileExtension)) {
		return true;
	}
	return false;
}

export function getFileIcon(file) {
	let extension = _.last(file?.name?.split("."));
	return extension === "csv" ? csv : extension === "pdf" ? pdf : documentIcon;
}
