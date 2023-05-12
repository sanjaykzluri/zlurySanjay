import { AsyncTypeahead } from "common/Typeahead/AsyncTypeahead";
import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { searchAllApps, searchUsers } from "services/api/search";
import { Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import "./overview.css";
import RequestLicenseHeader from "./requestLicenseHeader";
import { Loader } from "common/Loader/Loader";
import {
	getFileIcon,
	isValidFile,
	SUPPORTED_FILE_FORMATS,
} from "constants/upload";
import deleteIcon from "assets/deleteIcon.svg";
import addDocument from "components/Applications/Contracts/adddocument.svg";
import { uploadFile } from "services/upload/upload";
import { dateResetTimeZone } from "utils/DateUtility";
import {
	allowDigitsOnly,
	arrayOfFirstGivenNumbers,
	sanitizeFilename,
} from "utils/common";
import _ from "underscore";
import { TriggerIssue } from "utils/sentry";
import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import { searchApplicationLicenseSuggestions } from "services/api/licenses";
import {
	currencyOptions,
	getOrgCurrency,
	kFormatter,
} from "constants/currency";
import SuggestionChips from "common/SuggestionChips/SuggestionChips";
import { Select } from "UIComponents/Select/Select";
import { debounce } from "utils/common";
import { useDispatch, useSelector } from "react-redux";
import {
	addLicenseRequest,
	getAppLicenses,
	searchUsersEmployeeDashboard,
	updateRequestLicense,
} from "services/api/employeeDashboard";

import { AdditionalInfoContainer } from "./additionalInfoContainer";
import { ApproversSection } from "./ApproversSection";
import { AlternateLicenseTypes, getPeriod } from "./alternateLicenseTypes";
import { setRequestLicenseDataRedux } from "reducers/employee.reducer";
import { getCostSentenceForRequest } from "./requestLicenseModal";

export const period = {
	months: "pm",
	years: "py",
};

const entityTypeService = {
	user: {
		api: searchUsersEmployeeDashboard,
		label: "user_name",
		value: "user_id",
		imageKey: "profile_img",
	},
};

export function RequestLicense() {
	const dispatch = useDispatch();
	const hiddenFileInput = React.useRef(null);
	const userInfo = useSelector((state) => state.userInfo);
	const location = useLocation();
	const [requestType, setRequestType] = useState("Add");
	const defaultReqBody = {
		app_logo: null,
		app_name: null,
		app_id: null,
		license_name: null,
		license_cost: null,
		per_license_term: null,
		need_more_licenses: false,
		licenses_required: null,
		subscription_duration_value: null,
		subscription_duration_term: null,
		requirement_text: null,
		users: [],
		documents: [],
		requested_on: null,
	};
	const [reqData, setReqData] = useState({ ...defaultReqBody });
	const [validated, setValidated] = useState(false);
	const [defaultLicenses, setDefaultLicenses] = useState({});
	const [loadingAdditionalInfo, setLoadingAdditionalInfo] = useState(true);
	const requiredFields = ["requirement_text"];
	const isInvalid = (field) =>
		validated && requiredFields.find((i) => i === field) && !reqData[field];

	useEffect(() => {
		if (location?.state?.data) {
			let type = location.pathname.split("/")[4];
			setRequestType(type || "Add");
			let tempReqData = {
				...reqData,
				app_logo: location?.state?.data?.app_logo,
				users: location?.state?.data?.users?.map((el) => {
					return { user_id: el.user_id, user_name: el.user_name };
				}) || [
					{
						user_id: userInfo?.user_id,
						user_name: userInfo?.user_name,
					},
				],
				app_name: location?.state?.data?.app_name,
				app_id: location?.state?.data?.app_id,
				license_id: location?.state?.data?.license_id,
				license_name: location?.state?.data?.license_name,
				license_cost: location?.state?.data?.license_cost,
				per_license_term:
					location?.state?.data?.per_license_term || "months",
				currency: location?.state?.data?.currency || "USD",
				requested_on: new Date(),
				app_in_org: location?.state?.data?.app_in_org,
				request_role: location?.state?.data?.request_role,
				...(type === "edit" && {
					need_more_licenses:
						location?.state?.data?.need_more_licenses,
					licenses_required:
						location?.state?.data?.licenses_required ||
						location?.state?.data?.quantity,
					subscription_duration_value:
						location?.state?.data?.subscription_duration_value,
					subscription_duration_term:
						location?.state?.data?.subscription_duration_term,
					requirement_text:
						location?.state?.data?.requirement_text ||
						location?.state?.data?.requirement_description,

					documents: location?.state?.data?.documents,
					requested_on: location?.state?.data?.requested_on,
					approvers: location?.state?.data?.approvers,
					alternate_licenses:
						location?.state?.data?.alternate_licenses,
					license_in_org: location?.state?.data?.license_in_org,
				}),
			};
			console.log(tempReqData, "a");
			setReqData(tempReqData);
			if (type === "edit") {
				dispatch(
					setRequestLicenseDataRedux({
						...tempReqData,
					})
				);
				setUploadedFiles(location?.state?.data?.documents);
			}
		}
	}, []);

	const [uploadedFiles, setUploadedFiles] = useState(
		reqData?.documents || []
	);
	const [fileUploading, setFileUploading] = useState(false);
	const [fileNotSupported, setFileNotSupported] = useState(false);
	const [fileUploadFailed, setFileUploadFailed] = useState(false);

	const handleUploadButtonClick = () => {
		hiddenFileInput.current.click();
	};
	const handleFileUpload = (e) => {
		setFileUploading(true);
		let file = e.target.files[0];
		if (!isValidFile(file)) {
			setFileNotSupported(true);
			setTimeout(() => {
				setFileNotSupported(false);
				setFileUploading(false);
			}, 2000);
			return;
		}
		const { name, type, size } = file;
		uploadFile(file)
			.then((res) => {
				setFileUploading(false);
				let fileArray = [...uploadedFiles];
				fileArray.push({
					source_url: res.resourceUrl,
					date: dateResetTimeZone(new Date()),
					name: sanitizeFilename(name),
					type: type,
					size: size,
				});
				setUploadedFiles(fileArray);
				setReqData({ ...reqData, documents: fileArray });
			})
			.catch((err) => {
				setFileUploadFailed(true);
				setFileUploading(false);
				setTimeout(() => {
					setFileUploadFailed(false);
				}, 5000);
				TriggerIssue(
					"There was an error while uploading the file",
					err
				);
			});
	};

	const handleSingleLicenseEdit = (value) => {
		setReqData({ ...reqData, license_name: value, license_id: null });
	};

	const selectSingleLicense = (selection) => {
		let period = getPeriod(selection);
		setReqData({
			...reqData,
			license_name: selection.value,
			license_id: selection.id,
			per_license_term: period,
			// license_cost: selection.tier_pricing_value || null,
			currency: selection.tier_currency,
		});
	};
	const handleRemoveUploadedDocument = (index) => {
		const fileArray = reqData?.documents;
		if (index > -1) {
			fileArray.splice(index, 1);
		}
		setReqData({ ...reqData, documents: fileArray });
	};
	const handleFetch = useCallback(
		(query, cancelToken) => {
			return getAppLicenses(
				location?.state?.data?.app_id,
				query,
				cancelToken
			);
		},
		[reqData]
	);

	const [entityData, setEntityData] = useState([]);
	const [loading, setLoading] = useState(false);

	const debouncedChangeHandler = useCallback(
		debounce((query) => {
			if (query || query === "") {
				entityTypeService["user"]
					.api(query, null, true)
					.then((res) => {
						if (res.data || res.results || res) {
							setEntityData(res.data || res.results || res);
							setLoading(false);
						}
					})
					.catch((err) => {
						console.log("err", err);
					});
			}
		}, 1000),
		[loading]
	);

	const getInitialValueForMultiSelect = () => {
		let values = [];

		if (Array.isArray(reqData?.users) && reqData?.users.length > 0) {
			values = reqData.users.map((el) => ({
				user_id: el.user_id,
				user_name: el.user_name,
			}));
		}

		return values;
	};

	const handleOnChangeMultiSelect = (obj) => {
		const selectedValue = [];
		obj.map((item) => {
			selectedValue.push({
				[entityTypeService["user"].value]:
					item[entityTypeService["user"].value],
				[entityTypeService["user"].label]:
					item[entityTypeService["user"].label],
			});
		});
		let index = selectedValue.findIndex(
			(el) => selectedValue.user_id === userInfo?.user_id
		);

		if (index > -1) {
			selectedValue.splice(index, 1);
		}
		setReqData({
			...reqData,
			users: selectedValue,
		});
	};

	return (
		<>
			<RequestLicenseHeader
				reqData={reqData}
				apiCall={
					requestType === "Add"
						? addLicenseRequest
						: updateRequestLicense
				}
				requestType={requestType}
				validated={validated}
				setValidated={setValidated}
				missingFields={
					requiredFields.filter(
						(field) =>
							requiredFields.find((i) => i === field) &&
							!reqData[field]
					) || []
				}
			/>
			<div className="screen_wrapper_request_license d-flex ">
				<div
					className="d-flex flex-column"
					style={{
						width: "calc(100% - 468px)",
					}}
				>
					<AdditionalInfoContainer
						data={reqData}
						setDefaultLicenses={setDefaultLicenses}
						setLoadingAdditionalInfo={setLoadingAdditionalInfo}
					></AdditionalInfoContainer>
					<div
						style={{
							height: "fit-content",
							padding: "33px 30px",
						}}
						className="d-flex flex-column background-color-white border-radius-4"
					>
						<AsyncTypeahead
							placeholder="Enter App Name"
							fetchFn={searchAllApps}
							isInvalid={false}
							invalidMessage="Please select the application."
							onSelect={(selection) => {
								setReqData({
									...reqData,
									app_id: selection.app_id,
									app_name: selection.app_name,
									app_logo: selection.app_logo,
								});
							}}
							requiredValidation={false}
							keyFields={{
								id: "app_id",
								image: "app_logo",
								value: "app_name",
							}}
							allowFewSpecialCharacters={true}
							disabled={location?.state?.data?.app_id}
							defaultValue={location?.state?.data?.app_name}
							label={"Application"}
							appLogo={reqData?.app_logo}
							// onChange={(val) => setAppName(val)}
						/>
						<div className="d-flex  mt-2 w-100">
							<div className="w-50 d-flex flex-column  mr-3">
								<Form.Label className="d-flex ">
									{`Select License (optional)`}
									{/* <span className="coming-soon-tag ml-2">
										Coming soon
									</span> */}
								</Form.Label>
								<AsyncTypeahead
									fetchFn={handleFetch}
									defaultValue={reqData.license_name}
									keyFields={{
										value: "value",
										title: "title",
										id: "id",

										tier_pricing_value:
											"tier_pricing_value",
										period: "period",
										tier_is_per_month: "tier_is_per_month",
										tier_is_billed_annual:
											"tier_is_billed_annual",
										additional_information:
											"tier_pricing_value",
									}}
									// requiredValidation={true}
									// isInvalid={isInvalid("name", row)}
									allowFewSpecialCharacters={true}
									placeholder="Select License"
									onSelect={(selection) =>
										selectSingleLicense(selection)
									}
									onChange={(value) => {
										handleSingleLicenseEdit(value, "name");
									}}
									hideNoResultsText={true}
									// isInvalid={isInvalid("license_name")}
									// invalidMessage="Please enter the license name."
									// invalidMsgClassName={
									// 	isInvalid("license_name")
									// 		? "d-block"
									// 		: ""
									// }
									// requestingLicensesWithPrice={true}
									// showAdditionalRightInformation={true}
									// additionalInformationFormatter={(value) => {
									// 	if (value) {
									// 		return (
									// 			<div className="ml-auto bold-600 font-12">
									// 				{getCostSentenceForRequest(
									// 					value
									// 				)}
									// 			</div>
									// 		);
									// 	}
									// }}
									defaultList={
										!loadingAdditionalInfo
											? defaultLicenses
											: []
									}
									disabled={loadingAdditionalInfo}
								/>
							</div>

							{/* <div className="w-50 d-flex flex-column">
								<Form.Label className="">
									Estimated Cost/License
								</Form.Label>
								<Form.Group className="mb-0">
									<div
										className="d-flex font-12 license-details-px-1"
										style={{
											border: "1px solid #DDDDDD",
											height: "36px",
											borderRadius: "4px",
											width: "fit-content",
											marginTop: "5px",
										}}
									>
										<select
											className="request-license-currency-select border-0"
											onChange={(e) => {
												setReqData({
													...reqData,
													currency: e.target.value,
												});
											}}
											value={
												reqData?.currency ||
												getOrgCurrency()
											}
										>
											{currencyOptions}
										</select>
										<Form.Control
											bsPrefix="request-license-custom-input-area-number"
											className="cursor-pointer p-0 border-0"
											onChange={(e) =>
												setReqData({
													...reqData,
													license_cost:
														e.target.value,
												})
											}
											style={{
												marginRight: "2px",
												height: "34px",
												width: "210px",
											}}
											type="number"
											value={reqData?.license_cost}
											placeholder="Enter Cost"
										></Form.Control>
										<Form.Control
											className="border-0 ml-2"
											bsPrefix="request-license-custom-input-area"
											as="select"
											onChange={(e) =>
												setReqData({
													...reqData,
													per_license_term:
														e.target.value,
												})
											}
											value={reqData?.per_license_term}
										>
											<option value="months">
												per month
											</option>
											<option value="years">
												per year
											</option>
										</Form.Control>
									</div>
								</Form.Group>
							</div> */}
						</div>
						<div className="d-flex  mt-4 w-100 pr-1">
							<div className="w-50 d-flex flex-column ">
								<div className="d-flex align-items-center mb-1">
									<Form.Label className="mb-0">
										Subscription Duration (optional)
									</Form.Label>
									<div
										className="ml-2 glow_blue font-11 cursor-pointer"
										onClick={() => {
											setReqData({
												...reqData,
												subscription_duration_term:
													"none",
												subscription_duration_value: "",
											});
										}}
									>
										Clear
									</div>
								</div>

								<div className="d-flex flex-row w-75 mb-2">
									<Form.Control
										bsPrefix=" form-control subscription_duration_input  "
										type="number"
										placeholder="Enter Duration"
										onChange={(e) => {
											setReqData({
												...reqData,
												subscription_duration_value:
													e.target.value,
											});
										}}
										onKeyDown={allowDigitsOnly}
										value={
											reqData?.subscription_duration_value
										}
									></Form.Control>

									<select
										className="  subscription_duration_input form-control  text-capitalize ml-2"
										as="select"
										onChange={(e) =>
											setReqData({
												...reqData,
												subscription_duration_term:
													e.target.value,
											})
										}
										value={
											reqData?.subscription_duration_term
										}
									>
										<option
											value="none"
											selected
											disabled
											hidden
										>
											Select an Option
										</option>
										<option value="months">Months</option>
										<option value="years">Years</option>
									</select>
								</div>
								<SuggestionChips
									suggestions={[
										{
											value: 1,
											period: "months",
											title: "1 Month",
										},
										{
											value: 3,
											period: "months",
											title: "3 Months",
										},
										{
											value: 6,
											period: "months",
											title: "6 Months",
										},
										{
											value: 1,
											period: "years",
											title: "1 Year",
										},
										{
											value: 2,
											period: "years",
											title: "2 Years",
										},
									]}
									nameKey="title"
									showImg={false}
									onClick={(item, index) => {
										setReqData({
											...reqData,
											subscription_duration_value:
												item.value,
											subscription_duration_term:
												item.period,
										});
									}}
								/>
							</div>
						</div>
						<div className="mt-4 d-flex flex-column w-100">
							<Form.Label>Describe your requirement</Form.Label>
							<div
								className="w-100 border-radius-4 d-flex flex-column"
								style={{ border: "1px solid #E8ECF8" }}
							>
								<Form.Control
									as="textarea"
									rows="4"
									value={reqData?.requirement_text}
									placeholder="Your requirement."
									style={{
										color: "#717171",
										fontSize: "14px",
										height: "100%",
									}}
									onChange={(e) =>
										setReqData({
											...reqData,
											requirement_text: e.target.value,
										})
									}
									isInvalid={isInvalid("requirement_text")}
									className={
										isInvalid("requirement_text")
											? "d-block "
											: ""
									}
								/>
								<Form.Control.Feedback
									className={
										isInvalid("requirement_text")
											? "d-block"
											: null
									}
									type="invalid"
								>
									Please enter your requirement.
								</Form.Control.Feedback>
							</div>
						</div>
						<div className="d-flex flex-column mt-2 w-50 mb-2 pr-3">
							<Form.Label>{`Application Role (optional)`}</Form.Label>
							<Form.Control
								maxLength={50}
								placeholder="Enter Application Role"
								bsPrefix=" form-control "
								onChange={(e) =>
									setReqData({
										...reqData,
										request_role: e.target.value,
									})
								}
								value={reqData?.request_role}
							></Form.Control>
						</div>
						<div
							className="d-flex flex-row align-items-center mt-1 pl-2"
							style={{
								backgroundColor: "rgba(232, 236, 248, 0.2)",
								height: "40px",
							}}
						>
							<Form.Check
								className=""
								checked={reqData?.need_more_licenses}
								onChange={() => {
									setReqData({
										...reqData,
										licenses_required:
											reqData?.need_more_licenses
												? null
												: 2,
										need_more_licenses:
											!reqData?.need_more_licenses,
									});
								}}
							/>
							<div className="font-12 mr-2">
								Need more than one license
							</div>
						</div>

						{reqData?.need_more_licenses && (
							<>
								<Form.Label className="mt-3">
									Number of licenses required
								</Form.Label>
								<div style={{ width: "205px" }}>
									<Form.Control
										className="cursor-pointer"
										onChange={(e) =>
											setReqData({
												...reqData,
												licenses_required:
													Number.parseFloat(
														e.target.value
													),
											})
										}
										type="number"
										value={reqData?.licenses_required}
										placeholder="Enter No of Licenses Reqd"
									></Form.Control>
								</div>
							</>
						)}
						{reqData?.need_more_licenses && (
							<>
								<Form.Label className="mt-3">
									Who is this subscription for?
								</Form.Label>
								<Select
									mode="multi"
									className="flex-fill black-1 w-auto grey-bg"
									isOptionsLoading={loading}
									value={getInitialValueForMultiSelect()}
									options={entityData || null}
									fieldNames={{
										label: entityTypeService["user"].label,
										value: entityTypeService["user"].value,
									}}
									search
									onSearch={(query) => {
										setLoading(true);
										debouncedChangeHandler(query);
									}}
									placeholder={"Add Users"}
									onChange={(obj) => {
										handleOnChangeMultiSelect(obj);
									}}
								/>
							</>
						)}
						<Form.Label className="mt-4">
							{`Supporting Documents (optional)`}
						</Form.Label>
						<div className=" d-flex flex-column request-license-documents">
							{Array.isArray(reqData?.documents) &&
								reqData?.documents.length > 0 &&
								reqData?.documents.map((file, index) => {
									return (
										<div
											className="mb-2 d-flex align-items-center"
											style={{
												border: "1px solid #EBEBEB",
												height: "44px",
												minHeight: "44px",
												width: "380px",
												padding: "0px 5px",
											}}
										>
											<div className="d-flex align-items-center">
												<img
													src={getFileIcon(file)}
													height={20}
													width={20}
												/>
												<OverlayTrigger
													placement="top"
													overlay={
														<Tooltip>
															{file.name}
														</Tooltip>
													}
												>
													<div className="truncate_request_license_name ml-1 bold-600 font-12">
														{file.name}
													</div>
												</OverlayTrigger>
											</div>
											<img
												className="cursor-pointer ml-auto"
												src={deleteIcon}
												height={16}
												width={16}
												onClick={() =>
													handleRemoveUploadedDocument(
														index
													)
												}
											/>
										</div>
									);
								})}
							<div
								className="req-license-upload-div-container"
								style={{ minHeight: "140px" }}
							>
								<div className="req-license-contract-document-upload-div">
									{fileUploading ? (
										<Loader width={100} height={100} />
									) : (
										<>
											<img src={addDocument} />
											<div className="d-flex flex-column align-items-between ml-1">
												<div className="font-12 o-8">
													Add Supporting Documents
												</div>
												<div
													className="font-13 bold-600 primary-color cursor-pointer d-flex justify-content-center"
													onClick={
														handleUploadButtonClick
													}
												>
													+ Add Documents
												</div>
												<input
													type="file"
													accept={
														SUPPORTED_FILE_FORMATS
													}
													style={{
														display: "none",
													}}
													ref={hiddenFileInput}
													onChange={handleFileUpload}
												/>
											</div>
										</>
									)}
								</div>
								{fileNotSupported && (
									<div className="warningMessage w-100 p-1 m-1">
										Certain file types are not supported.
									</div>
								)}
								{fileUploadFailed && (
									<div className="warningMessage w-100 p-1 m-1">
										Server Error! File upload failed. Please
										try again.
									</div>
								)}
							</div>
						</div>
						{requestType === "edit" && (
							<>
								<AlternateLicenseTypes
									data={reqData}
									loading={false}
									inOrg={reqData.license_in_org}
								></AlternateLicenseTypes>
							</>
						)}
					</div>
				</div>

				<div
					style={{
						width: "445px",
						padding: "21px 26px",
						height: "fit-content",
					}}
					className="ml-auto background-color-white border-radius-4 d-flex flex-column"
				>
					<div className="font-16 bold-600 black-1">
						Request Summary
					</div>
					<hr style={{ margin: "13px 0px 9px" }}></hr>
					<div
						className="d-flex flex-column border-radius-4"
						style={{
							backgroundColor: "#F5F6F9",
							padding: "12px 14px",
						}}
					>
						<div className="grey-1  font-12 d-flex align-items-center">
							<GetImageOrNameBadge
								name={reqData.app_name}
								url={reqData.app_logo}
								width={12}
								height={12}
							/>
							<div className="ml-2 o-5">{reqData?.app_name}</div>
						</div>
						<div className="mt-1 d-flex align-items-center">
							<div className="bold-600 font-14 black-1">
								{reqData?.license_name}
							</div>
							<div className="ml-auto d-flex align-items-center">
								{/* <div className="bold-600 font-14 black-1">{`${kFormatter(
									reqData?.license_cost || 0,
									reqData?.currency || "USD"
								)} ${
									period[reqData.per_license_term] || ""
								}`}</div> */}
								<div className="grey-1 font-12 o-5 ml-1">
									{" "}
									{` x${
										reqData.need_more_licenses
											? reqData.licenses_required || 1
											: 1
									}`}
								</div>
							</div>
						</div>
					</div>
					{/* <ApproversSection
						reqData={reqData}
						setReqData={setReqData}
						approversFromState={location.state?.data?.approvers}
					></ApproversSection> */}
				</div>
			</div>
		</>
	);
}
