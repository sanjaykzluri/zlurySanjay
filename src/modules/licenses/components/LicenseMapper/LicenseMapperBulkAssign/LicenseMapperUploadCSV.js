import React from "react";
import Papa from "papaparse";
import { Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { updateAllLicenseMapperUsers } from "../LicenseMapper-action";
import {
	hasValidEmail,
	hasValidLicense,
	hasValidStartDate,
	hasValidRole,
	hasValidEndDate,
	updateReduxDataFromCSV,
	getAllLicenseMapperUserEmails,
} from "modules/licenses/utils/LicensesUtils";
import DocumentUpload from "modules/shared/components/DocumentUpload/DocumentUpload";
import { LicenseMapperCSVHeaders } from "modules/licenses/constants/LicenseConstants";
import { ApiResponseNotification } from "modules/shared/components/ApiResponseNotification/ApiResponseNotification";
import { apiResponseTypes } from "modules/shared/components/ApiResponseNotification/ApiResponseNotificationConstants";

export default function LicenseMapperUploadCSV({
	licenses,
	setInvalidRows,
	setUploading,
	setUploaded,
}) {
	const dispatch = useDispatch();
	const { data } = useSelector((state) => state.licenseMapper);
	const licenseNames = licenses.map((license) => license.license_name);

	const hasInvalidCSVHeaders = (headers) => {
		for (let header of LicenseMapperCSVHeaders) {
			if (!headers.includes(header)) {
				return true;
			}
		}
		return false;
	};

	const rowIsValid = (row) => {
		return (
			hasValidEmail(row, getAllLicenseMapperUserEmails(data)) &&
			hasValidLicense(row, licenseNames) &&
			hasValidStartDate(row) &&
			hasValidRole(row) &&
			hasValidEndDate(row)
		);
	};

	const readUploadedFile = (file) => {
		setUploading(true);
		Papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			comments: "#",
			complete: (results) => {
				const validCSVRows = [];
				const invalidCSVRows = [];
				if (hasInvalidCSVHeaders([...results.meta.fields])) {
					ApiResponseNotification({
						responseType: apiResponseTypes.ERROR,
						title: "Invalid/Missing Headers",
						description: `The uploaded CSV has invalid/missing headers! Accepted headers are ${LicenseMapperCSVHeaders.join(
							", "
						)}`,
					});
					setTimeout(() => {
						setUploading(false);
					}, [3000]);
					return;
				}
				for (let row of [...results?.data]) {
					if (rowIsValid(row)) {
						validCSVRows.push(row);
					} else {
						invalidCSVRows.push(row);
					}
				}
				setInvalidRows([...invalidCSVRows]);
				const updatedReduxData = updateReduxDataFromCSV(
					data,
					[...validCSVRows],
					licenses
				);
				dispatch(
					updateAllLicenseMapperUsers({ data: updatedReduxData })
				);
				setUploading(false);
				setUploaded(true);
			},
		});
	};

	return (
		<DocumentUpload
			acceptedFileArray={[".csv"]}
			loader={
				<div className="primary_bg_2 border-radius-8 padding_4 font-10 bold-500 font-white">
					<Spinner
						animation="border"
						role="status"
						variant="dark"
						size="sm"
						style={{ borderWidth: 2 }}
					/>
				</div>
			}
			getSourceUrl={false}
			readUploadedFile={readUploadedFile}
		>
			<div className="primary_bg_2 border-radius-8 padding_4 font-10 bold-500 font-white">
				Upload CSV
			</div>
		</DocumentUpload>
	);
}
