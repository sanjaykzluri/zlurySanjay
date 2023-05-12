import React, { useState, useEffect, useRef } from "react";
import { Tooltip } from "react-bootstrap";
import OverlayTooltip from "../../../../UIComponents/OverlayToolTip";
import { useSelector } from "react-redux";
import { NameBadge } from "../../../../common/NameBadge";
import check from "../../../../assets/applications/check.svg";
import inactivecheck from "../../../../assets/applications/inactivecheck.svg";

import needsreview from "../../../../assets/applications/needsreview.svg";
import restricted from "../../../../assets/applications/restricted.svg";
import unmanaged from "../../../../assets/applications/unmanaged.svg";
import teammanaged from "../../../../assets/applications/teammanaged.svg";
import individuallymanaged from "../../../../assets/applications/individuallymanaged.svg";
import authorised from "../../../../assets/applications/authorised.svg";
import { DottedProgress } from "../../../../common/DottedProgress/DottedProgress";
import ContentLoader from "react-content-loader";
import GetImageOrNameBadge from "../../../../common/GetImageOrNameBadge";

const appStatus = {
	"team managed": teammanaged,
	"needs review": needsreview,
	restricted: restricted,
	"centrally managed": authorised,
	unmanaged: unmanaged,
	"individually managed": individuallymanaged,
};

export default function AppDescription(props) {
	const { appDetailsAPI, application, children } = props;
	const appDescription = useSelector(
		(state) => state.workflows.appDescription
	);
	const ref = useRef();
	const [appDescriptionData, setAppDescriptionData] = useState({});
	const [callAppDetailsAPI, setCallAppDetailsAPI] = useState(false);
	const [show, setShow] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const appDescriptionArray = [...appDescription];
		if (appDescriptionArray.length > 0) {
			const appDescriptionData = appDescriptionArray.find(
				(app) => app.id === application.id
			);
			if (appDescriptionData) {
				setAppDescriptionData(appDescriptionData);
				setLoading(false);
			}
		}
	}, [appDescription, callAppDetailsAPI]);

	useEffect(() => {
		if (callAppDetailsAPI) {
			const appDescriptionArray = [...appDescription];
			if (appDescriptionArray.length >= 0) {
				const index = appDescriptionArray.findIndex(
					(app) => app.id === application.id
				);
				const appId = application.id;
				const obj = {
					filter_by: [
						{
							field_id: "app_id",
							field_name: "Application Id",
							field_values: [appId],
							filter_type: "objectId",
							negative: false,
							is_custom: false,
						},
					],
					sort_by: [],
					columns: [
						{
							group_name: "application",
							field_ids: [
								"app_logo",
								"app_name",
								"app_is_custom",
								"app_state",
							],
							is_sortable: true,
						},
						{
							group_name: "app_user_count",
							field_ids: ["app_user_count"],
							is_sortable: true,
						},
						{
							group_name: "app_usage",
							field_ids: ["app_usage"],
							is_sortable: true,
						},
						{
							group_name: "app_status",
							field_ids: ["app_status", "app_archive"],
							is_sortable: true,
						},
						{
							group_name: "app_category",
							field_ids: ["app_sub_categories", "app_categories"],
							is_sortable: true,
						},
					],
					screen_tag: 1,
				};
				if (index === -1) {
					setLoading(true);
					appDetailsAPI(obj);
				} else {
					setLoading(false);
				}
			}
		}
		return () => {
			setCallAppDetailsAPI(false);
			setLoading(true);
		};
	}, [callAppDetailsAPI]);

	return (
		<div className="d-flex justify-content-start">
			<OverlayTooltip
				placement="bottom"
				isStickyTooltip
				overlay={
					application.id && (
						<Tooltip bsPrefix="spend-cost-trend-tooltip">
							<AppDescriptionTooltipContent
								application={application}
								appDescriptionData={appDescriptionData}
								loading={loading}
							/>
						</Tooltip>
					)
				}
				setTooltipArrowShow={application.id && setShow}
			>
				<div
					className="cursor-default d-flex justify-content-center"
					onMouseEnter={() => {
						if (application.id) {
							setCallAppDetailsAPI(true);
						}
					}}
					ref={ref}
					style={{ position: "relative" }}
				>
					{children}
					<div
						hidden={!show}
						className="app-description-tooltiparrow"
					></div>
				</div>
			</OverlayTooltip>
		</div>
	);
}

function AppDescriptionTooltipContent(props) {
	const { application, appDescriptionData, loading } = props;
	return (
		<div className="app-description-tooltip-content">
			<div className="d-flex flex-row align-center ">
				<div className="flex-1 d-flex flex-column justify-content-center font-13">
					<div className="d-flex flex-row align-center mb-3">
						{loading ? (
							<div className="d-flex flex-column justify-content-center font-13">
								<ContentLoader width={26} height={26}>
									<circle
										cx="12"
										cy="12"
										r="12"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
						) : (
							<div className="d-flex flex-column justify-content-center font-13">
								<GetImageOrNameBadge
									name={application.name}
									url={application.logo}
									width={24}
									height={24}
									imageClassName={
										"border-radius-4 mr-3 object-contain"
									}
									nameClassName={"mr-2 img-circle"}
								/>
							</div>
						)}
						<div className="d-flex flex-column font-12">
							<div className="d-flex flex-row mb-1">
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
									<p className="m-0 bold-400 font-14 grey text-capitalize">
										{application.name}
									</p>
								)}
							</div>
							<div className="d-flex flex-row">
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
									<p className="m-0 bold-400 font-9 grey-1 text-capitalize">
										{appDescriptionData &&
											appDescriptionData.appCategory}
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
				<div className="flex-1 d-flex flex-column justify-content-start font-13">
					<div className="d-flex flex-row justify-content-end align-end">
						{loading ? (
							<div className="d-flex flex-column justify-content-start font-13">
								<ContentLoader width={12} height={12}>
									<circle
										cx="6"
										cy="6"
										r="6"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
						) : (
							<div className="d-flex flex-column justify-content-start font-13">
								{appDescriptionData &&
								appDescriptionData.appState ? (
									<img
										className="border-radius-4 mr-1 object-contain"
										height="12"
										width="12"
										src={
											appStatus[
												appDescriptionData.appState
											]
										}
									/>
								) : (
									<NameBadge
										className="mr-2 img-circle"
										width={12}
										name={
											appDescriptionData &&
											appDescriptionData.appState
										}
									/>
								)}
							</div>
						)}
						<div className="d-flex flex-column justify-content-start font-13">
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
								<p className="m-0 bold-400 font-10 grey-1 text-capitalize">
									{appDescriptionData &&
										appDescriptionData.appState}
								</p>
							)}
						</div>
					</div>
				</div>
			</div>
			<hr className="w-407 m-0"></hr>
			<div className="d-flex flex-row align-center ">
				<div className="flex-1 d-flex flex-column justify-content-center font-13 p-3">
					<div className="d-flex flex-row align-center">
						<p className="mb-1 bold-400 font-10 grey-1 text-capitalize">
							Status
						</p>
					</div>
					<div className="d-flex flex-row align-center">
						{loading ? (
							<ContentLoader width={61} height={10}>
								<rect
									width="61"
									height="10"
									rx="2"
									fill="#EBEBEB"
								/>
							</ContentLoader>
						) : (
							<>
								<img
									width={10}
									src={
										appDescriptionData &&
										appDescriptionData.appStatus ===
											"active"
											? `${check}`
											: `${inactivecheck}`
									}
									style={{ marginRight: "4px" }}
								></img>
								<p className="m-0 bold-400 font-10 grey-1 text-capitalize">
									{appDescriptionData &&
									appDescriptionData?.appArchive
										? "Archived"
										: appDescriptionData.appStatus ===
										  "active"
										? "Active"
										: "Inactive"}
								</p>
							</>
						)}
					</div>
				</div>
				<div className="flex-1 d-flex flex-column justify-content-center font-13 p-3">
					<div className="d-flex flex-row align-center">
						<p className="mb-1 bold-400 font-10 grey-1 text-capitalize">
							Users
						</p>
					</div>
					<div className="d-flex flex-row align-center">
						{loading ? (
							<ContentLoader width={61} height={10}>
								<rect
									width="61"
									height="10"
									rx="2"
									fill="#EBEBEB"
								/>
							</ContentLoader>
						) : (
							<p className="m-0 bold-400 font-12 grey-1 text-capitalize">
								{appDescriptionData &&
									appDescriptionData.appUserCount}
							</p>
						)}
					</div>
				</div>
				<div className="flex-1 d-flex flex-column justify-content-center font-13 p-3">
					<div className="d-flex flex-row align-center">
						<p className="mb-1 bold-400 font-10 grey-1 text-capitalize">
							Usage
						</p>
					</div>
					<div className="d-flex flex-row align-center">
						{loading ? (
							<ContentLoader width={61} height={10}>
								<rect
									width="61"
									height="10"
									rx="2"
									fill="#EBEBEB"
								/>
							</ContentLoader>
						) : (
							<DottedProgress
								value={
									(appDescriptionData &&
										appDescriptionData.appUsage) ||
									0
								}
							></DottedProgress>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
