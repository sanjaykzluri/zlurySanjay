import { kFormatter } from "constants/currency";
import { MapLicenseViaCSVSteps } from "modules/licenses/constants/LicenseConstants";
import {
	getAllLicenseMapperUserEmails,
	getLicenseMapperRequestBody,
	getLicenseTermText,
} from "modules/licenses/utils/LicensesUtils";
import { ApiResponseNotification } from "modules/shared/components/ApiResponseNotification/ApiResponseNotification";
import { apiResponseTypes } from "modules/shared/components/ApiResponseNotification/ApiResponseNotificationConstants";
import LongTextTooltip from "modules/shared/components/LongTextTooltip/LongTextTooltip";
import React, { useState } from "react";
import { Spinner } from "react-bootstrap";
import greenTick from "assets/green_tick.svg";
import { useDispatch, useSelector } from "react-redux";
import { openModal } from "reducers/modal.reducer";
import { licenseMapperBulkAssign } from "services/api/licenses";
import { Button } from "UIComponents/Button/Button";
import { clearAllLicenseMapperUsers } from "./LicenseMapper-action";
import LicenseMapperInvalidRows from "./LicenseMapperBulkAssign/LicenseMapperInvalidRows";
import LicenseMapperLicenseCSVExport from "./LicenseMapperBulkAssign/LicenseMapperLicenseCSVExport";
import LicenseMapperUploadCSV from "./LicenseMapperBulkAssign/LicenseMapperUploadCSV";
import LicenseMapperUserCSVExport from "./LicenseMapperBulkAssign/LicenseMapperUserCSVExport";

export default function LicenseMapperTableHelper({
	licenses,
	firstStep,
	appId,
	contractId,
}) {
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);

	const { data, loaded, hasMoreData } = useSelector(
		(state) => state.licenseMapper
	);
	const licenseNames = licenses?.map((license) => license.license_name);

	const bulkMapLicenses = () => {
		setLoading(true);
		licenseMapperBulkAssign(
			appId,
			contractId,
			getLicenseMapperRequestBody([...data])
		)
			.then((res) => {
				if (res.status === apiResponseTypes.SUCCESS) {
					ApiResponseNotification({
						responseType: apiResponseTypes.SUCCESS,
						title: "License assignment job has been scheduled",
						description:
							"It will take a few minutes to process the request. Changes will reflect shortly afterwards.",
					});
					setLoading(false);
					dispatch(clearAllLicenseMapperUsers({ appId }));
				} else {
					ApiResponseNotification({
						responseType: apiResponseTypes.ERROR,
						errorObj: res,
						title: "Unexpected response bulk license mapping api",
						description:
							"Server Error! We could not complete your request",
						retry: bulkMapLicenses,
					});
				}
			})
			.catch((err) => {
				ApiResponseNotification({
					responseType: apiResponseTypes.ERROR,
					errorObj: err,
					title: "Error response bulk license mapping api",
					description:
						"Server Error! We could not complete your request",
					retry: bulkMapLicenses,
				});
				setLoading(false);
			});
	};

	return (
		<>
			<div className="d-flex flex-column">
				{!firstStep && (
					<div
						className="d-flex align-items-center justify-content-between"
						style={{ padding: "8px 16px" }}
					>
						<Button
							onClick={() =>
								dispatch(
									openModal("bulkAddEditViaUploadCSV", {
										title: "Bulk Map Licenses",
										steps: MapLicenseViaCSVSteps,
										getStepButtons: ({
											step,
											setUploading,
											setUploaded,
											setInvalidRows,
										}) => {
											switch (step) {
												case 1:
													return (
														<LicenseMapperUserCSVExport />
													);
												case 2:
													return (
														<LicenseMapperLicenseCSVExport
															licenses={licenses}
														/>
													);
												case 3:
													return (
														<LicenseMapperUploadCSV
															licenses={licenses}
															setInvalidRows={
																setInvalidRows
															}
															setUploading={
																setUploading
															}
															setUploaded={
																setUploaded
															}
														/>
													);
												default:
													return <></>;
											}
										},
										invalidRowsComponent: ({
											rows,
											reUploadFile,
											handleClose,
										}) => (
											<LicenseMapperInvalidRows
												rows={rows}
												userEmails={getAllLicenseMapperUserEmails(
													data
												)}
												licenseNames={licenseNames}
												reUploadFile={reUploadFile}
												handleClose={handleClose}
											/>
										),
										noInvalidRowsComponent: (
											<div className="d-flex flex-column align-items-center justify-content-center h-100">
												<img
													src={greenTick}
													height="40px"
													width="40px"
													alt="success"
												/>
												<div className="font-12 mt-2 mb-5">
													The table data has been
													successfully updated!
												</div>
											</div>
										),
										descriptionHeight: "70px",
									})
								)
							}
							className="w-50"
							style={{ margin: "2px" }}
							disabled={!loaded || hasMoreData}
						>
							Bulk Mapping
						</Button>
						<Button
							disabled={loading}
							onClick={bulkMapLicenses}
							className="w-50"
							style={{ margin: "2px" }}
						>
							{loading ? (
								<Spinner
									animation="border"
									role="status"
									variant="light"
									size="sm"
									style={{ borderWidth: 2 }}
								>
									<span className="sr-only">Loading...</span>
								</Spinner>
							) : (
								"Save"
							)}
						</Button>
					</div>
				)}
				<hr className="m-0" />
				<div className="d-flex flex-column">
					{licenses.map((license) => (
						<LicenseMapperUnmappedLicenseCard license={license} />
					))}
				</div>
			</div>
		</>
	);
}

function LicenseMapperUnmappedLicenseCard({ license }) {
	return (
		<div className="license_mapper_single_license_box">
			<div className="bold-600 font-12">
				<LongTextTooltip text={license.license_name} maxWidth="200px" />
			</div>
			<div className="bold-600 o-8 font-11 mt-1">
				{license.unmapped_license_count + (license.difference || 0) > 0
					? `${
							license.unmapped_license_count +
							(license.difference || 0)
					  } Unmapped`
					: `All licenses mapped`}
			</div>
			{license.unmapped_license_count + (license.difference || 0) < 0 && (
				<div className="bold-600 o-8 font-11 mb-1">
					{`${
						-1 *
						(license.unmapped_license_count +
							(license.difference || 0))
					} extra licenses mapped`}
				</div>
			)}
			<hr className="m-0" />
			<div className="d-flex justify-content-between mt-1">
				<div className="bold-600 font-11">Total Licenses</div>
				<div className="bold-600 font-11">
					{license.total_license_available}
				</div>
			</div>
			<div className="d-flex justify-content-between">
				<div className="bold-600 font-11">Cost</div>
				<div className="bold-600 font-11">
					{`${kFormatter(
						license.cost_per_item?.amount_org_currency
					)} ${getLicenseTermText(
						license,
						license?.cost_per_item,
						false,
						true
					)}`}
				</div>
			</div>
			<div className="d-flex justify-content-between">
				<div className="bold-600 font-11">Auto Increment</div>
				<div className="bold-600 font-11">
					{license.auto_increment ? "Yes" : "No"}
				</div>
			</div>
		</div>
	);
}
