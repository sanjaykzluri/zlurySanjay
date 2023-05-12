import React, { useState } from "react";
import ContentLoader from "react-content-loader";
import { Dots } from "../../../../common/DottedProgress/DottedProgress";
import GetImageOrNameBadge from "../../../../common/GetImageOrNameBadge";
import UserInfoTableComponent from "../../../../common/UserInfoTableComponent";
import OverviewField from "../../../../components/Applications/SecurityCompliance/OverviewField";
import Rating from "../../../../components/Applications/SecurityCompliance/Rating";
import RiskIcon from "../../../../components/Applications/SecurityCompliance/RiskIcon";
import InlineEditHost from "../../../../components/Applications/SecurityCompliance/InlineEditHost";
import { patchApplication } from "../../../../services/api/applications";
import { capitalizeFirstLetter } from "../../../../utils/common";
import { CUSTOM_FIELD_ENTITY } from "../../../custom-fields/constants/constant";
import { OverviewFieldLoaderCard } from "../../../licenses/components/SingleContract/ContractDescription";
import { InlineEditField } from "../../../shared/containers/InlineEditField/InlineEditField";
import ApplicationAuthStatusDropdown from "./ApplicationAuthStatusDropdown";
import ApplicationOverviewDropdown from "./ApplicationOverviewDropdown";
import ApplicationEditButton from "./ApplicationEditButton";
import { SimilarApps } from "../../../../components/Applications/Overview/SimilarApps";
import { allowScroll, preventScroll } from "../../../../actions/ui-action";
import { InlineUpdateField } from "../../../../components/Applications/Overview/InlineUpdateField";
import { ChangeRenewal } from "../../../../components/Applications/Overview/ChangeRenewal";
import { CategoryFormatter } from "../table/AppCategoryFormatter";
import AppTagsComponent from "./AppTagsComponent";
import { kFormatter } from "constants/currency";
import { CustomFieldSectionInOverview } from "modules/shared/containers/CustomFieldSectionInOverview/CustomFieldSectionInOverview";
import { useDispatch } from "react-redux";
import { HeaderFormatter } from "modules/licenses/utils/LicensesUtils";
import { ApplicationSourceList } from "./ApplicationSourceList";
import UserSourceIconAndCard from "modules/users/components/UserSourceIconAndCard";

export default function ApplicationDescription({
	app,
	loading,
	onAppChange,
	appSecurityData,
}) {
	const dispatch = useDispatch();
	const [lengthOfComplianceDetails, setLengthOfComplianceDetails] =
		useState(3);

	const [showSimilarApps, setShowSimilarApps] = useState(false);
	const [openAppSourceList, setOpenAppSourceList] = useState(false);

	return (
		<div className="d-flex flex-column">
			<div className="d-flex align-items-center justify-content-between">
				<div className="d-flex align-items-center justfiy-content-between w-100">
					<div className="d-flex align-items-center">
						<GetImageOrNameBadge
							url={app?.app_logo}
							name={app?.app_name}
							height={40}
							width={40}
							borderRadius="50%"
						/>
						{loading ? (
							<ContentLoader width={150} height={15}>
								<rect width={150} height={15} fill="#EBEBEB" />
							</ContentLoader>
						) : (
							<div className="d-flex flex-column">
								<div className="bold-600 font-18 ml-2">
									{app?.app_name}
								</div>
								<div className="grey-1 font-11 ml-2">
									{app?.app_short_description}
								</div>
							</div>
						)}
					</div>
					<div className="ml-auto">
						<ApplicationOverviewDropdown
							app={app}
							onAppChange={onAppChange}
						/>
					</div>
				</div>
			</div>
			<div className="d-flex">
				<ApplicationAuthStatusDropdown
					app={app}
					onAppChange={onAppChange}
				/>
				<ApplicationEditButton app={app} onAppChange={onAppChange} />
			</div>
			<hr className="mx-0 my-3 w-100" />
			{loading ? (
				<OverviewFieldLoaderCard />
			) : (
				<div className="d-flex flex-column">
					<OverviewField
						label="STATUS"
						value={
							app?.app_archive ? (
								<div className="d-flex align-items-center">
									<Dots color="#717171" />
									<div className="ml-1">Archived</div>
								</div>
							) : app?.app_status === "active" ? (
								<div className="d-flex align-items-center">
									<Dots color="#40E395" />
									<div className="ml-1">Active</div>
								</div>
							) : (
								<div className="d-flex align-items-center">
									<Dots color="#717171" />
									<div className="ml-1">
										{capitalizeFirstLetter(app?.app_status)}
									</div>
								</div>
							)
						}
						dataUnavailable={!app?.app_status}
						className="d-flex justify-content-between align-items-center mb-3"
					/>
					<OverviewField
						label="OWNER"
						value={
							<UserInfoTableComponent
								user_id={app?.app_owner?.owner_id}
								user_name={app?.app_owner?.owner_name}
								user_profile={app?.app_owner?.owner_profile_img}
								user_account_type={app?.app_owner?.account_type}
							/>
						}
						dataUnavailable={!app?.app_owner?.owner_id}
						className="d-flex justify-content-between align-items-center mb-3"
					/>
					<OverviewField
						label="IT OWNER"
						value={
							<UserInfoTableComponent
								user_id={app?.app_technical_owner?.owner_id}
								user_name={app?.app_technical_owner?.owner_name}
								user_profile={
									app?.app_technical_owner?.owner_profile_img
								}
								user_account_type={
									app?.app_technical_owner?.owner_profile_img
								}
							/>
						}
						dataUnavailable={!app?.app_technical_owner?.owner_id}
						className="d-flex justify-content-between align-items-center mb-3"
					/>
					<OverviewField
						label="FINANCE OWNER"
						value={
							<UserInfoTableComponent
								user_id={app?.app_financial_owner?.owner_id}
								user_name={app?.app_financial_owner?.owner_name}
								user_profile={
									app?.app_financial_owner?.owner_profile_img
								}
								user_account_type={
									app?.app_financial_owner?.account_type
								}
							/>
						}
						dataUnavailable={!app?.app_financial_owner?.owner_id}
						className="d-flex justify-content-between align-items-center mb-3"
					/>
					<OverviewField
						label="CATEGORY"
						value={<CategoryFormatter data={app} />}
						className="d-flex justify-content-between align-items-center mb-3"
					/>
					<OverviewField
						label="TOTAL SPEND"
						value={kFormatter(app?.app_total_spend || 0)}
						className="d-flex justify-content-between align-items-center mb-3"
					/>
					<OverviewField
						label="ACTIVE CONTRACTS"
						value={app?.app_active_contracts || 0}
						className="d-flex justify-content-between align-items-center mb-3"
					/>
					<OverviewField
						label="AUTO RENEW"
						value={
							<ChangeRenewal
								status={app?.app_autorenew}
								refreshPage={() => {
									onAppChange();
								}}
								className="mb-0"
							></ChangeRenewal>
						}
						className="d-flex justify-content-between align-items-center mb-3"
					/>
					<OverviewField
						label="TYPE"
						value={
							<InlineUpdateField
								editClassName="w-auto"
								className="mb-0"
								value={app.app_type}
								name="type"
								onUpdate={(val) => {
									onAppChange();
								}}
							/>
						}
						className="d-flex justify-content-between align-items-center mb-3"
					/>
					<OverviewField
						label={
							<HeaderFormatter
								text={"APP LINK"}
								tooltipContent="The activites detected for this url will be mapped to the application."
							/>
						}
						keyClassName="d-flex"
						value={
							<InlineEditHost
								app_id={app?.app_id}
								host={app?.app_url_example}
								refreshSecurityProbes={() => onAppChange()}
								maxWidth={190}
							/>
						}
						className="d-flex justify-content-between align-items-center mb-3"
					/>
					<OverviewField
						label={"APP BUDGET"}
						keyClassName="d-flex"
						value={kFormatter(app?.app_budget)}
						className="d-flex justify-content-between align-items-center mb-3"
					/>
				</div>
			)}
			<hr className="mx-0 my-3 w-100" />
			{loading ? (
				<OverviewFieldLoaderCard />
			) : (
				<div className="d-flex flex-column">
					<OverviewField
						label="RISK LEVEL"
						value={
							<RiskIcon
								showLable={true}
								riskValue={
									appSecurityData?.manual_risk_level
										? appSecurityData?.manual_risk_level
										: appSecurityData?.risk_level
								}
								className={"font-12 text-capitalize"}
								dataUnavailableStyle={{
									marginTop: "3px",
								}}
							/>
						}
						dataUnavailable={!appSecurityData?.risk_level}
						className="d-flex justify-content-between align-items-center mb-3"
					/>
					<OverviewField
						label="RISK SCORE"
						value={`${Math.ceil(appSecurityData?.score)} on 100`}
						dataUnavailable={!appSecurityData?.score}
						className="d-flex justify-content-between align-items-center mb-3"
					/>
					<OverviewField
						label="THREAT"
						value={
							<div className="d-flex flex-row">
								<Rating
									rating={appSecurityData?.threat || 0}
									iconType="scope"
									width={12}
									height={15}
									showValueInsideIcon={true}
									valueTopPosition={"0.9px"}
									valueLeftPosition={"3.1px"}
								/>
								<div className="font-12 pl-3">
									{`Level ${appSecurityData?.threat || 0}`}
								</div>
							</div>
						}
						dataUnavailable={isNaN(appSecurityData?.threat)}
						className="d-flex justify-content-between align-items-center mb-3"
					/>
				</div>
			)}

			<hr className="mx-0 my-3 w-100" />
			{loading ? (
				<OverviewFieldLoaderCard />
			) : (
				<div
					className="overview__middle__topcont"
					style={{
						marginRight: "20px",
					}}
				>
					<div className="d-flex  justify-content-between">
						<div className="securityoverview__item-name">
							COMPLIANCE
						</div>
						<div
							style={{
								marginLeft: "45px",
							}}
							className="overview__middle__topconttext2 d-flex flex-column align-items-start"
						>
							{appSecurityData?.compliance
								.slice(0, lengthOfComplianceDetails)
								.join(", ")}

							{Array.isArray(appSecurityData?.compliance) &&
								appSecurityData?.compliance.length > 3 &&
								lengthOfComplianceDetails <= 3 && (
									<div
										className="font-12 primary-color cursor-pointer"
										onClick={() => {
											setLengthOfComplianceDetails(
												appSecurityData?.compliance
													.length
											);
										}}
									>
										+{" "}
										{appSecurityData?.compliance?.length -
											3}{" "}
										more
									</div>
								)}
							{lengthOfComplianceDetails > 3 && (
								<div
									className="font-12 primary-color cursor-pointer"
									onClick={() => {
										setLengthOfComplianceDetails(3);
									}}
								>
									Show less
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			<hr className="mx-0 my-3 w-100" />
			{loading ? (
				<OverviewFieldLoaderCard />
			) : (
				<>
					<CustomFieldSectionInOverview
						customFieldData={app?.app_custom_fields || []}
						entityId={app?.app_id}
						cfEntitiy={CUSTOM_FIELD_ENTITY.APPLICATIONS}
						patchAPI={patchApplication}
						refresh={onAppChange}
					/>
				</>
			)}
			<hr className="mx-0 my-3 w-100" />
			{loading ? (
				<OverviewFieldLoaderCard />
			) : (
				<>
					<div
						className="overview__middle__topcont"
						style={{
							marginRight: "20px",
						}}
					>
						<div className="d-flex  justify-content-between">
							<div className="securityoverview__item-name">
								SIMILAR APPS
							</div>
							<div
								style={{
									marginLeft: "45px",
								}}
								className="overview__middle__topconttext2 d-flex flex-column align-items-start"
							>
								<div
									className="font-12 primary-color cursor-pointer"
									onClick={() => {
										dispatch(preventScroll());
										setShowSimilarApps(true);
									}}
								>
									Show
								</div>
							</div>
						</div>
					</div>
				</>
			)}
			<hr className="mx-0 my-3 w-100" />
			{loading ? (
				<OverviewFieldLoaderCard />
			) : (
				<div
					className="overview__middle__topcont"
					style={{
						marginRight: "20px",
					}}
				>
					<div className="d-flex align-items-center justify-content-between">
						<div className="securityoverview__item-name">
							SOURCES
						</div>

						<span
							onClick={() => setOpenAppSourceList(true)}
							className="font-12 cursor-pointer primary-color cursor-pointer"
						>
							{" "}
							View All
						</span>
					</div>
					<div
						style={{
							marginTop: "12px",
							marginRight: "10px",
						}}
						className="overview__middle__topconttext2"
					>
						{app?.app_source_array?.map((source, index) => (
							<>
								{index < 3 && (
									<UserSourceIconAndCard
										source={source}
										index={index}
										sources={app?.app_source_array || []}
										style={{ left: "120px" }}
										isApp={true}
									/>
								)}
							</>
						))}
						{Array.isArray(app?.app_source_array) &&
							app?.app_source_array.length > 3 && (
								<div
									className="font-12 primary-color cursor-pointer"
									onClick={() => setOpenAppSourceList(true)}
								>
									+ {app?.app_source_array?.length - 3}
								</div>
							)}
					</div>

					{openAppSourceList && (
						<ApplicationSourceList
							sourceArray={app?.app_source_array}
							app={app}
							setOpenAppSourceList={setOpenAppSourceList}
						/>
					)}
				</div>
			)}
			<hr className="mx-0 my-3 w-100" />
			{loading ? (
				<OverviewFieldLoaderCard />
			) : (
				<>
					{
						<AppTagsComponent
							app={app}
							onAppChange={onAppChange}
							checkAll={false}
						></AppTagsComponent>
					}
				</>
			)}
			{showSimilarApps ? (
				<SimilarApps
					show={showSimilarApps}
					onHide={() => {
						dispatch(allowScroll());
						setShowSimilarApps(false);
					}}
					appName={app?.app_name}
					appstatus={app?.app_auth_status}
					appSmallDescription={app?.app_short_description}
					appLogo={app?.app_logo}
					appId={app?.app_id}
				></SimilarApps>
			) : null}
		</div>
	);
}
