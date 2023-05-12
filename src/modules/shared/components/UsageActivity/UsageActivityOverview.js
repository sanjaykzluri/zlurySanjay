import React, { Fragment, useContext, useEffect, useState } from "react";
import { fetchUsageActivityOverviewDetails } from "../../../../services/api/users";
import check from "../../../../assets/applications/check.svg";
import inactivecheck from "../../../../assets/applications/inactivecheck.svg";
import {
	currencySymbols,
	currencyPeriod,
	kFormatter,
} from "../../../../constants/currency";
import { Button } from "../../../../UIComponents/Button/Button";
import moment from "moment";
import ContentLoader from "react-content-loader";
import refershBlue from "../../../../components/Uploads/refreshBlue.svg";
import warning from "../../../../components/Onboarding/warning.svg";
import InlineLicenceAssg from "../../../../components/LicenceAssignment/InlineLicenceAssg";
import { editLicenseForAUser } from "../../../../services/api/licenses";
import {
	InlineEditField,
	inlineUpdateType,
} from "../../containers/InlineEditField/InlineEditField";
import bluewarning from "../../../../assets/licenses/bluewarning.svg";
import AddLicenseToContract from "../../../licenses/components/AllLicensesTable/AddLicenseToContract";
import licenseFromIntegration from "../../../../assets/licenses/licenseFromIntegration.svg";
import GetImageOrNameBadge from "../../../../common/GetImageOrNameBadge";
import { getLicenseTermText } from "modules/licenses/utils/LicensesUtils";

function UsageActivityOverview(props) {
	const [loading, setLoading] = useState(true);
	const [sourceDetails, setSourceDetails] = useState({});
	const [error, setError] = useState();

	const requestEndPoint = () => {
		setLoading(true);
		try {
			fetchUsageActivityOverviewDetails(props.id).then((res) => {
				if (res?.error) {
					setError(res);
				} else {
					setSourceDetails(res?.data);
					setError();
				}
				setLoading(false);
			});
		} catch (error) {
			setError(error);
			setLoading(false);
			console.log("Error when fetching user-app overview details", error);
		}
	};

	useEffect(() => {
		if (props.currentSection === props.sections.overview) {
			requestEndPoint();
		} else {
			setSourceDetails();
			setError();
			setLoading(true);
		}
	}, [props.currentSection]);

	return (
		<div
			className="position-relative"
			style={{ height: "calc(100vh - 112px)", overflowY: "auto" }}
		>
			{!error && (
				<div className="lightBlueBackground row m-auto">
					<div className="col-md-3 d-flex flex-column justify-content-left">
						<div className="font-12 grey mb-1">
							{loading ? (
								<ContentLoader width={91} height={10}>
									<rect
										width="91"
										height="10"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							) : (
								"Usage"
							)}
						</div>
						<div className="d-flex">
							{loading ? (
								<ContentLoader width={105} height={15}>
									<rect
										width="105"
										height="15"
										y="06"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							) : sourceDetails?.user_app_status === "active" ? (
								<Fragment>
									<img
										src={check}
										className="mt-auto mb-auto mr-1"
										alt="active"
									></img>
									In Use
								</Fragment>
							) : (
								<Fragment>
									<img
										src={inactivecheck}
										className="mt-auto mb-auto mr-1"
										alt="inactive"
									></img>
									Not in Use
								</Fragment>
							)}
						</div>
					</div>
					<div className="col-md-3">
						<div className="font-12 grey mb-1">
							{loading ? (
								<ContentLoader width={91} height={10}>
									<rect
										width="91"
										height="10"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							) : (
								"Spend [YTD]"
							)}
						</div>
						<div className="d-flex">
							{loading ? (
								<ContentLoader width={105} height={15}>
									<rect
										width="105"
										height="15"
										y="06"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							) : !isNaN(
									parseFloat(
										sourceDetails?.user_app_total_spend
									)
							  ) ? (
								kFormatter(sourceDetails?.user_app_total_spend)
							) : (
								0
							)}
						</div>
					</div>
					<div className="col-md-3">
						<div className="font-12 grey mb-1">
							{loading ? (
								<ContentLoader width={91} height={10}>
									<rect
										width="91"
										height="10"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							) : (
								"Cost [YTD]"
							)}
						</div>
						<div className="d-flex">
							{loading ? (
								<ContentLoader width={105} height={15}>
									<rect
										width="105"
										height="15"
										y="06"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							) : !isNaN(
									parseFloat(sourceDetails?.user_app_cost)
							  ) ? (
								kFormatter(sourceDetails?.user_app_cost)
							) : (
								0
							)}
						</div>
					</div>
					<div className="col-md-3">
						<div className="font-12 grey mb-1">
							{loading ? (
								<ContentLoader width={91} height={15}>
									<rect
										width="91"
										height="10"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							) : (
								"In use since"
							)}
						</div>
						<div className="d-flex">
							{loading ? (
								<ContentLoader width={105} height={15}>
									<rect
										width="105"
										height="15"
										y="06"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							) : sourceDetails?.user_app_first_used ? (
								moment(
									sourceDetails?.user_app_first_used
								).format("DD MMM YY")
							) : (
								<div className="font-10 grey-1 bold-normal mt-1">
									Unavailable
								</div>
							)}
						</div>
					</div>
				</div>
			)}
			{!error && (
				<div className="licenseContainer font-16 grey">
					<div className="d-flex flex-row justify-content-between ml-2 bold-normal">
						<div className="d-flex align-items-center">
							{loading ? (
								<ContentLoader width={91} height={10}>
									<rect
										width="91"
										height="10"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							) : (
								"License Details"
							)}
						</div>
						<div>
							{loading ? (
								<ContentLoader width={91} height={10}>
									<rect
										width="91"
										height="10"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							) : (
								<InlineLicenceAssg
									popoverPositionStyle={{
										width: "270px",
										top: "25px",
										left: "-7px",
										padding: "8px",
										maxHeight: "315px",
									}}
									licences={props.row.contracts.map(
										(contract) => ({
											license_id: contract.license_id,
											license_name: contract.license_name,
											plan_name: contract.plan_name,
											contract_name:
												contract.contract_name,
											license_used: contract.license_used,
											license_count:
												contract.license_count,
											metric_price: contract.metric_price,
											license_cycle_period:
												contract.license_cycle_period,
											license_cycle_cost:
												contract.license_cycle_cost,
										})
									)}
									appId={sourceDetails?.app_id}
									appName={props.appName}
									appLogo={props.appLogo}
									users={[
										{
											user_image: props.row.user_profile,
											user_name: props.row.user_name,
											user_id: props.userId,
											user_app_role:
												props.row.user_app_role,
											user_licenses: props.row?.contracts,
										},
									]}
									refresh={props.refresh}
									isBulkAssign={true}
									isUsageOverview={true}
								/>
							)}
						</div>
					</div>
					{props.row &&
					props.row.contracts &&
					Array.isArray(props.row.contracts) &&
					props.row.contracts.length > 0 ? (
						props.row.contracts.map((contract) => (
							<UsageActivityOverviewLicenseCard
								contract={contract}
								loading={loading}
								setLoading={setLoading}
								requestEndPoint={requestEndPoint}
								users={[
									{
										user_image: props.row.user_profile,
										user_name: props.row.user_name,
										user_id: props.userId,
										user_app_role: props.row.user_app_role,
									},
								]}
								appId={sourceDetails?.app_id}
								appName={props.appName}
								appLogo={props.appLogo}
								refresh={props.refresh}
							/>
						))
					) : (
						<>
							{loading ? (
								<ContentLoader width={540} height={20}>
									<rect
										width="540"
										height="15"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							) : (
								<InlineLicenceAssg
									popoverPositionStyle={{
										width: "270px",
										top: "-15px",
										left: "404px",
										padding: "8px",
										maxHeight: "315px",
									}}
									licences={props.row.contracts.map(
										(contract) => ({
											license_id: contract.license_id,
											license_name: contract.license_name,
											plan_name: contract.plan_name,
											contract_name:
												contract.contract_name,
											license_used: contract.license_used,
											license_count:
												contract.license_count,
											metric_price: contract.metric_price,
											license_cycle_period:
												contract.license_cycle_period,
											license_cycle_cost:
												contract.license_cycle_cost,
										})
									)}
									appId={sourceDetails?.app_id}
									appName={props.appName}
									appLogo={props.appLogo}
									users={[
										{
											user_image: props.row.user_profile,
											user_name: props.row.user_name,
											user_id: props.userId,
											user_app_role:
												props.row.user_app_role,
											user_licenses: props.row?.contracts,
										},
									]}
									refresh={props.refresh}
									showSwitchButtonToEdit={true}
								/>
							)}
						</>
					)}
				</div>
			)}
			{error && (
				<div
					className="d-flex flex-column justify-content-center"
					style={{ height: "100%" }}
				>
					<img
						src={warning}
						style={{ width: "45px" }}
						className="ml-auto mr-auto"
					/>
					<div className="grey-1 font-18 bold-normal w-75 text-center ml-auto mr-auto mt-2">
						An error occured. Please try again
					</div>
					<div className="ml-auto mr-auto mt-2">
						<Button
							className="primary-color-border d-flex"
							type="link"
							onClick={() => requestEndPoint()}
						>
							<img
								src={refershBlue}
								className="mr-2"
								style={{ width: "15px" }}
							/>
							Retry
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

export function UsageActivityOverviewLicenseCard(props) {
	const {
		contract,
		loading,
		setLoading,
		requestEndPoint,
		users,
		appId,
		appName,
		appLogo,
		refresh,
	} = props;

	const [showUnassignLicenseOption, setShowUnassignLicenseOption] =
		useState(false);
	const [showUnassignLicenseModal, setShowUnassignLicenseModal] =
		useState(false);
	const [
		showRemoveRoleAndRemovedLicenseDate,
		setShowRemoveRoleAndRemovedLicenseDate,
	] = useState(false);
	const handleAfterLicenseRemoval = () => {
		setShowRemoveRoleAndRemovedLicenseDate(true);
	};
	const unassignLicenseFromUser = () => {
		setShowUnassignLicenseOption(false);
		setShowUnassignLicenseModal(true);
	};
	const [showAddToContract, setShowAddToContract] = useState(false);
	const editLicenseReqBody = {
		new_start_date: contract.license_assigned_on,
		role: contract.role,
		org_integration_id: null,
	};
	let licenseRow = { ...contract, app_name: appName, app_logo: appLogo };

	return (
		<>
			<div className={`borderStyling mb-3`}>
				<div className={`d-flex flex-row pl-3 mr-3 pt-3 mb-3`}>
					<div className="d-flex flex-column w-100">
						<div className="d-flex flex-row">
							<div
								className={`${
									!loading ? "w-100" : ""
								} bold-600 font-16 mt-auto mb-auto`}
							>
								{loading ? (
									<ContentLoader width={91} height={10}>
										<rect
											width="91"
											height="10"
											rx="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								) : (
									<div className="d-flex align-items-center">
										<div className="font-13 mr-2">
											{contract.license_name}
										</div>
										{contract.integration_id && (
											<img
												src={licenseFromIntegration}
												width={12}
												height={12}
												className="ml-1"
											/>
										)}
									</div>
								)}
							</div>
							<div className="mr-0 ml-auto mt-1">
								{!loading && (
									<div className="d-flex flex-row bold-600 font-16">
										<div
											style={{
												marginRight: "2px",
												width: "max-content",
											}}
										>
											{contract.cost_per_item
												?.amount_org_currency ? (
												<>
													{`${kFormatter(
														contract.cost_per_item
															?.amount_org_currency
													)} ${getLicenseTermText(
														contract,
														contract.cost_per_item,
														false,
														true
													)}`}
												</>
											) : (
												<div>NA</div>
											)}
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
				{!loading && !contract.contract_id && (
					<>
						<div
							className="d-flex align-items-center justify-content-between"
							style={{
								background: "rgba(90, 186, 255, 0.1)",
								borderRadius: "2px",
								margin: "0px 16px 11px",
								padding: "0px 10px",
								height: "23px",
							}}
						>
							<div className="d-flex align-items-center">
								<img src={bluewarning} className="mr-1"></img>
								<div className="font-12 grey">
									This license is not part of a
									subscription/contract
								</div>
							</div>
							<div
								className="cursor-pointer glow_blue font-12"
								onClick={() => setShowAddToContract(true)}
							>
								Add Now
							</div>
						</div>
					</>
				)}
				{!loading && (
					<div
						className="d-flex flex-column justify-content-between p-3"
						style={{ background: "#f8f8f8" }}
					>
						<div className="d-flex flex-row">
							<div className="d-flex flex-column">
								<div className="font-12 bold-normal">
									{loading ? (
										<ContentLoader width={91} height={10}>
											<rect
												width="91"
												height="10"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									) : (
										"Assigned on"
									)}
								</div>
								<div className="font-14 black">
									{loading ? (
										<ContentLoader width={91} height={10}>
											<rect
												width="91"
												height="10"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									) : (
										<InlineEditField
											updatePutData={(reqBody) =>
												editLicenseForAUser(
													reqBody,
													contract.license_id,
													contract.app_id,
													users[0].user_id
												)
											}
											putObject={editLicenseReqBody}
											putChangeKey="new_start_date"
											inlineValueClassName="schedule-name-inline-edit"
											type="date"
											putValue={
												editLicenseReqBody.new_start_date
											}
											updateType={inlineUpdateType.PUT}
											refreshPage={refresh}
										/>
									)}
								</div>
							</div>
							<div className="d-flex flex-column ml-5">
								<div className="font-12 bold-normal">
									{loading ? (
										<ContentLoader width={91} height={10}>
											<rect
												width="91"
												height="10"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									) : (
										"Role"
									)}
								</div>
								<div className="font-14 black">
									{loading ? (
										<ContentLoader width={91} height={10}>
											<rect
												width="91"
												height="10"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									) : (
										<InlineEditField
											updatePutData={(reqBody) =>
												editLicenseForAUser(
													reqBody,
													contract.license_id,
													contract.app_id,
													users[0].user_id
												)
											}
											putObject={editLicenseReqBody}
											putChangeKey="role"
											inlineValueClassName="schedule-name-inline-edit"
											type="text"
											putValue={editLicenseReqBody.role}
											updateType={inlineUpdateType.PUT}
											refreshPage={refresh}
										/>
									)}
								</div>
							</div>
						</div>
						{contract.integration_id && (
							<div className="d-flex align-items-center font-10 grey-1">
								<img
									src={licenseFromIntegration}
									width={12}
									height={12}
									className="mr-1"
								/>
								<div className="mx-1">
									Automatically mapped from
								</div>
								<GetImageOrNameBadge
									url={contract.integration_logo}
									name={contract.integration_name}
									width={12}
									height={12}
								/>
								<div className="ml-1">
									{contract.org_integration_name}
								</div>
							</div>
						)}
						{/* <div className=" align-items-center">
							<img
								src={EllipsisSVG}
								className="cursor-pointer position-relative"
								onClick={() =>
									setShowUnassignLicenseOption(true)
								}
							/>
							{showUnassignLicenseOption && (
								<Popover
									className="unassign-license-option-dropdown cursor-pointer"
									show={showUnassignLicenseOption}
									onClose={() =>
										setShowUnassignLicenseOption(false)
									}
								>
									<span
										onClick={unassignLicenseFromUser}
										className="font-14 w-100 text-align-center"
									>
										Unassign License
									</span>
								</Popover>
							)}
						</div> */}
					</div>
				)}
				{showAddToContract && (
					<AddLicenseToContract
						show={showAddToContract}
						handleClose={() => setShowAddToContract(false)}
						license={{
							_id: contract.license_id,
							name: contract.license_name,
							quantity: contract.license_quantity,
							type: contract.license_type || "user",
							cost_per_item:
								typeof contract.cost_per_item === "object" &&
								Object.keys(contract.cost_per_item).length > 0
									? contract.cost_per_item
									: {},
							auto_increment: !!contract.auto_increment,
							license_included_in_base_price:
								contract.license_included_in_base_price || 0,
							integration_id: contract.integration_id,
							groups: contract.groups || [],
							minimum_duration: contract.minimum_duration,
						}}
						row={licenseRow}
						app_id={contract?.app_id}
						app_logo={contract?.app_logo}
						app_name={contract?.app_name}
					/>
				)}
			</div>
		</>
	);
}

export default UsageActivityOverview;
