import React, { useEffect, useState } from "react";
import { Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import bluearrowdropdown from "../../../../assets/licenses/bluearrowsdropdown.svg";
import { SelectOld } from "../../../../UIComponents/SelectOld/Select";
import "./LicensesTable.css";
import close from "../../../../assets/close.svg";
import GetImageOrNameBadge from "../../../../common/GetImageOrNameBadge";
import { Button } from "../../../../UIComponents/Button/Button";
import { useHistory } from "react-router-dom";
import noLicenseImg from "../../../../assets/applications/noLicenseImg.svg";
import { entityReqBodyObj } from "../../constants/LicenseConstants";
import { useDispatch } from "react-redux";
import {
	setReqData,
	updateStepperData,
} from "../../../../common/Stepper/redux";
import { getOrphanLicenses } from "../../../../services/api/licenses";
import { TriggerIssue } from "../../../../utils/sentry";
import { Loader } from "../../../../common/Loader/Loader";
import { AsyncTypeahead } from "../../../../common/Typeahead/AsyncTypeahead";
import {
	searchContractsV2,
	searchPerpetualV2,
	searchSubscriptionV2,
} from "../../../../services/api/search";
import { getSearchReqObj } from "../../../../common/infiniteTableUtil";
import licenseFromIntegration from "../../../../assets/licenses/licenseFromIntegration.svg";
import { checkLicensesForAddToContract } from "modules/licenses/utils/LicensesUtils";
import { capitalizeFirstLetter } from "utils/common";

export default function AddLicenseToContract({
	show,
	handleClose,
	license,
	row,
	app_id,
	app_logo,
	app_name,
}) {
	const history = useHistory();
	const dispatch = useDispatch();
	const [entityType, setEntityType] = useState();
	const [createReqBody, setCreateReqBody] = useState(
		entityReqBodyObj[entityType]
	);
	const [moreLicenses, setMoreLicenses] = useState([]);
	const [moreLicensesLoading, setMoreLicensesLoading] = useState(true);
	const [licensesToBeAdded, setLicensesToBeAdded] = useState([license]);
	const [addToExistingContract, setAddToExistingContract] = useState(false);
	const [existingId, setExistingId] = useState();
	const [existingName, setExistingName] = useState();

	useEffect(() => {
		if (entityType) {
			setCreateReqBody(entityReqBodyObj[entityType]);
		}
	}, [entityType]);

	const ADD_TO_OPTIONS_ARRAY = [
		{
			label: "Subscription",
			value: "subscription",
		},
		{
			label: "Contract",
			value: "contract",
		},
		{
			label: "Perpetual",
			value: "perpetual",
		},
	];

	const searchAPIs = {
		contract: searchContractsV2,
		perpetual: searchPerpetualV2,
		subscription: searchSubscriptionV2,
	};

	useEffect(() => {
		if (moreLicensesLoading) {
			getOrphanLicenses(app_id)
				.then((res) => {
					setMoreLicenses(res);
					setMoreLicensesLoading(false);
				})
				.catch((error) =>
					TriggerIssue("Error in fetching orphan licenses", error)
				);
		}
	}, [moreLicensesLoading]);

	const pushLicense = (license) => {
		let temp = licensesToBeAdded;
		license = {
			name: license.name,
			quantity: license.quantity,
			type: license.type,
			cost_per_item: license.cost_per_item,
			auto_increment: !!license.auto_increment,
			_id: license._id,
			groups: license.groups,
		};
		let index = temp.findIndex((el) => license._id === el._id);
		if (index === -1) {
			temp.push(license);
		}
		setLicensesToBeAdded(temp);
	};

	const popLicense = (license) => {
		let temp = licensesToBeAdded;
		let index = temp.findIndex((el) => license._id === el._id);
		if (index > -1) {
			temp.splice(index, 1);
		}
		setLicensesToBeAdded(temp);
	};

	const licenseIsIncluded = (license) => {
		let temp = licensesToBeAdded;
		let index = temp.findIndex((el) => license?._id === el?._id);
		return index > -1;
	};

	const getFilterByForSearch = (query) => {
		let filter_by = [
			getSearchReqObj(
				query,
				"contract_name",
				`${capitalizeFirstLetter(entityType)} Name`
			),
		];

		if (app_id) {
			filter_by.push({
				field_id: "app_id",
				field_name: "Application Id",
				field_values: [app_id],
				filter_type: "objectId",
				is_custom: false,
				negative: false,
			});
		}

		return filter_by;
	};

	return (
		<>
			<div className="modal-backdrop show"></div>
			<Modal
				show={show}
				onHide={handleClose}
				centered
				size="l"
				contentClassName="opti-license-users-table-modal"
			>
				<div className="d-flex flex-column">
					<div className="add-license-to-contract-header">
						<div className="d-flex flex-row align-items-center justify-content-between">
							<div className="d-flex align-items-center">
								<div className="font-22 bold-600">Create a</div>
								<SelectOld
									style={{
										border: "none",
										marginBottom: "0px",
										height: "fit-content",
										fontSize: "22px",
										color: "#2266E2",
										height: "34px",
										background: "inherit",
										minWidth: "180px",
									}}
									className="m-0 mr-2"
									arrowdropdown={bluearrowdropdown}
									inputTextStyle={{
										padding: "0px 10px",
									}}
									options={ADD_TO_OPTIONS_ARRAY}
									optionListClass={"menu"}
									value={entityType}
									onSelect={(option) => {
										setEntityType(option.value);
										setExistingId();
										setExistingName();
									}}
									inputTextSpanStyle={{
										opacity: 1,
										color: "#2266E2",
									}}
									optionClassName={
										"forecastbargraph__filtersmenu__option"
									}
									inputPlaceholderClassName={
										"document_select_placeholder primary-color font-22"
									}
									placeholder="Select Entity"
								/>
							</div>
							<img
								className="cursor-pointer"
								alt="Close"
								onClick={handleClose}
								src={close}
							/>
						</div>
						{entityType && (
							<div
								className="glow_blue cursor-pointer font-12 ml-auto"
								onClick={() => {
									setAddToExistingContract(
										!addToExistingContract
									);
									setExistingId();
									setExistingName();
								}}
							>
								{!addToExistingContract
									? `Add to existing ${entityType}`
									: `Add to a new ${entityType}`}
							</div>
						)}
					</div>
					<div className="add-license-to-contract-card-container">
						{addToExistingContract && (
							<AsyncTypeahead
								key={entityType}
								placeholder={`Enter ${entityType} name`}
								fetchFn={(query, reqCancelToken) =>
									query &&
									query.length &&
									searchAPIs[entityType](
										{
											sort_by: [],
											columns: [],
											filter_by:
												getFilterByForSearch(query),
										},
										reqCancelToken
									)
								}
								isInvalid={false}
								onSelect={(selection) => {
									setExistingName(selection.contract_name);
									setExistingId(selection.contract_id);
								}}
								requiredValidation={false}
								keyFields={{
									id: "contract_id",
									value: "contract_name",
								}}
								allowFewSpecialCharacters={true}
								labelClassName="font-14 bold-600"
								label={`Choose a ${entityType}`}
							/>
						)}
						<div className="add-to-contract-license-card">
							<div className="d-flex justify-content-between">
								<div className="d-flex align-items-center bold-600 font-16">
									<div>{license.name}</div>
									<div>
										{license.integration_id && (
											<img
												src={licenseFromIntegration}
												width={12}
												height={12}
												className="ml-1"
											/>
										)}
									</div>
								</div>
								<div className="font-16">
									{license.quantity}
								</div>
							</div>
							<div className="d-flex align-items-center">
								<GetImageOrNameBadge
									name={row.app_name}
									url={row.app_logo}
									width={12}
									height="auto"
									fontSize={8}
								/>
								<div className="font-11 ml-1">
									{row.app_name}
								</div>
							</div>
						</div>
					</div>
					<div className="add-license-to-contract-add-more">
						<div className="d-flex align-items-center justify-content-between">
							<div className="font-12 bold-600">
								Add more licenses
							</div>
							<div
								className="glow_blue bld-600 font-12 cursor-pointer"
								onClick={() =>
									moreLicenses.forEach((el) =>
										pushLicense(el)
									)
								}
								hidden={true}
							>
								ADD ALL
							</div>
						</div>
						{moreLicensesLoading ? (
							<Loader width={50} height={50} />
						) : moreLicenses.length ? (
							<div className="orphan-card-container">
								{moreLicenses.map((license) => (
									<OrphanLicenseCard
										license={license}
										pushLicense={pushLicense}
										popLicense={popLicense}
										licenseIsIncluded={licenseIsIncluded(
											license
										)}
									/>
								))}
							</div>
						) : (
							<div className="d-flex flex-column justify-content-center align-items-center">
								<img
									src={noLicenseImg}
									height={150}
									width={150}
								/>
								<div className="font-14">
									No similar licenses to add.
								</div>
							</div>
						)}
					</div>
					<div className="d-flex justify-content-center mt-4 mb-3">
						<Button
							type="button"
							onClick={() => {
								if (existingId) {
									history.push({
										pathname: `/${entityType}/edit/${existingId}`,
										state: {
											licensesToBeAdded:
												checkLicensesForAddToContract(
													licensesToBeAdded,
													entityType
												),
										},
									});
								} else {
									dispatch(setReqData(createReqBody));
									dispatch(
										updateStepperData({
											licenses:
												checkLicensesForAddToContract(
													licensesToBeAdded,
													entityType
												),
											app_id,
											app_logo,
											app_name,
											additionalColumnFields: [],
										})
									);
									history.push(`/${entityType}/new`);
								}
							}}
							style={{ width: "227px", height: "48px" }}
							disabled={!entityType}
						>
							Continue
						</Button>
					</div>
				</div>
			</Modal>
		</>
	);
}

export function OrphanLicenseCard({
	license,
	popLicense,
	pushLicense,
	licenseIsIncluded,
}) {
	const [isLicenseIncluded, setIsLicenseIncluded] =
		useState(licenseIsIncluded);

	return (
		<div className="orphan-license-card">
			<div className="d-flex w-100 h-100">
				<div className="d-flex flex-column justify-content-center w-75">
					<div className="d-flex align-items-center">
						<OverlayTrigger
							placement="top"
							overlay={<Tooltip>{license.name}</Tooltip>}
						>
							<div className="truncate-license-name-in-popover">
								{license.name}
							</div>
						</OverlayTrigger>
						<div>
							{license.integration_id && (
								<img
									src={licenseFromIntegration}
									width={12}
									height={12}
									className="ml-1"
								/>
							)}
						</div>
					</div>
					<div className="d-flex align-items-center font-11">
						{license.org_app_id && (
							<>
								<GetImageOrNameBadge
									name={license.app_name}
									url={license.app_logo}
									height={12}
									width={12}
								/>
								<div className="ml-1">{license.app_name}</div>
								<div className="license-details-px-1">|</div>
							</>
						)}
						<div className="o-6">
							{license.quantity
								? `${license.quantity} Licenses`
								: ""}
						</div>
					</div>
				</div>
				<div
					className={`d-flex w-25 align-items-center justify-content-center cursor-pointer ${
						isLicenseIncluded ? "" : "glow_blue"
					}`}
					style={{ fontSize: isLicenseIncluded ? "22px" : "30px" }}
					onClick={() => {
						isLicenseIncluded
							? popLicense(license)
							: pushLicense(license);

						setIsLicenseIncluded(!isLicenseIncluded);
					}}
				>
					{isLicenseIncluded ? "x" : "+"}
				</div>
			</div>
		</div>
	);
}
