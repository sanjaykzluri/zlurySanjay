import React, { Fragment, useEffect, useState } from "react";
import { fetchUsageActivityLogDetails } from "../../../../services/api/users";
import ManualLogo from "../../../../assets/icons/manual-logo.svg";
import moment from "moment";
import ContentLoader from "react-content-loader";
import _ from "underscore";
import refershBlue from "../../../../components/Uploads/refreshBlue.svg";
import warning from "../../../../components/Onboarding/warning.svg";
import { Button } from "../../../../UIComponents/Button/Button";
import { NameBadge } from "common/NameBadge";

function UsageActivityLog(props) {
	const [logDetails, setLogDetails] = useState();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState();

	const requestEndPoint = () => {
		setLoading(true);
		try {
			fetchUsageActivityLogDetails(props.id).then((res) => {
				if (res?.error) {
					setError(res?.error);
				} else {
					setLogDetails(res?.data);
					setError();
				}
				setLoading(false);
			});
		} catch (error) {
			setError(error);
			setLoading(false);
			console.log("Error when fetching log of Usage Activity", error);
		}
	};

	useEffect(() => {
		if (props.currentSection === props.sections.log) {
			requestEndPoint();
		} else {
			setLogDetails();
			setLoading(true);
		}
	}, [props.currentSection]);

	const verticalLine = {
		height: "35px",
		border: "1px solid #EBEBEB",
		marginLeft: "10px",
		marginRight: "18px",
		marginTop: "2px",
	};

	const renderUserLog = (
		{ updated_by_user_name, status_to, date },
		index,
		length
	) => (
		<div className="d-flex flex-column">
			<div className="d-flex flex-row">
				<img
					src={ManualLogo}
					style={{ width: "21px" }}
					className="mr-2"
				/>
				<div className="text-capitalize font-14 bold-normal mt-auto mb-auto">
					User marked {status_to}
				</div>
				<div className="ml-auto font-12 grey-1 o-5 mt-auto mb-auto">
					{moment(date).format("DD MMM YYYY")}
				</div>
			</div>
			<div className="d-flex flex-row">
				<div
					style={
						index + 1 !== length
							? verticalLine
							: { ...verticalLine, opacity: 0 }
					}
				></div>
				<div className="font-11 bold-normal grey mt-1">
					updated manually by {updated_by_user_name}
				</div>
			</div>
		</div>
	);

	const renderIntegrationLog = (
		{
			updated_by_integration_name,
			updated_by_integration_logo,
			status_to,
			date,
		},
		index,
		length
	) => (
		<div className="d-flex flex-column">
			<div className="d-flex flex-row">
				<img
					src={updated_by_integration_logo}
					style={{ width: "21px" }}
					className="mr-2"
				/>
				<div className="text-capitalize font-14 bold-normal mt-auto mb-auto">
					{updated_by_integration_name} marked{" "}
					{status_to === "active" ? "In use" : "Not in use"}
				</div>
				<div className="ml-auto font-12 grey-1 o-5 mt-auto mb-auto">
					{moment(date).format("DD MMM YYYY")}
				</div>
			</div>
			<div className="d-flex flex-row">
				<div
					style={
						index + 1 !== length
							? verticalLine
							: { ...verticalLine, opacity: 0 }
					}
				></div>
				<div className="font-11 bold-normal grey mt-1">
					updated automatically by {updated_by_integration_name}
				</div>
			</div>
		</div>
	);

	const renderAgentLog = (
		{ updated_by_agent_name, updated_by_agent_logo, status_to, date },
		index,
		length
	) => (
		<div className="d-flex flex-column">
			<div className="d-flex flex-row">
				<img
					src={updated_by_agent_logo}
					style={{ width: "21px" }}
					className="mr-2"
				/>
				<div className="text-capitalize font-14 bold-normal mt-auto mb-auto">
					{updated_by_agent_name} marked{" "}
					{status_to === "active" ? "In use" : "Not in use"}
				</div>
				<div className="ml-auto font-12 grey-1 o-5 mt-auto mb-auto">
					{moment(date).format("DD MMM YYYY")}
				</div>
			</div>
			<div className="d-flex flex-row">
				<div
					style={
						index + 1 !== length
							? verticalLine
							: { ...verticalLine, opacity: 0 }
					}
				></div>
				<div className="font-11 bold-normal grey mt-1">
					updated automatically by {updated_by_agent_name}
				</div>
			</div>
		</div>
	);

	const renderWorkflowLog = (
		{ updated_by_user_name, status_to, date },
		index,
		length
	) => (
		<div className="d-flex flex-column">
			<div className="d-flex flex-row">
				<NameBadge
					className="mr-2"
					name={"Workflow"}
					width={21}
					height={21}
				/>
				<div className="text-capitalize font-14 bold-normal mt-auto mb-auto">
					{updated_by_user_name} marked{" "}
					{status_to === "active" ? "In use" : "Not in use"}
				</div>
				<div className="ml-auto font-12 grey-1 o-5 mt-auto mb-auto">
					{moment(date).format("DD MMM YYYY")}
				</div>
			</div>
			<div className="d-flex flex-row">
				<div
					style={
						index + 1 !== length
							? verticalLine
							: { ...verticalLine, opacity: 0 }
					}
				></div>
				<div className="font-11 bold-normal grey mt-1">
					updated automatically via workflow
				</div>
			</div>
		</div>
	);

	return (
		<div
			className="position-relative d-flex flex-column ml-3 mr-3 mt-3"
			style={{ height: "calc(100vh - 112px)", overflowY: "auto" }}
		>
			{error ? (
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
					{/* <div className="grey-1 o-5 font-14 bold-normal">

                        </div> */}
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
			) : loading ? (
				_.times(7, (n) => (
					<div className="d-flex flex-column" key={n}>
						<div className="d-flex flex-row">
							<ContentLoader height="35" width="550">
								<circle r="15" cx="22" cy="20" fill="#EBEBEB" />
								<rect
									width="160"
									height="15"
									rx="2"
									fill="#EBEBEB"
									y="15"
									x="50"
								/>
								<rect
									width="91"
									height="10"
									rx="2"
									x={100}
									fill="#EBEBEB"
									y="15"
									x="440"
								/>
							</ContentLoader>
						</div>
						<div
							className="d-flex flex-row"
							style={{ paddingLeft: "10px" }}
						>
							<div style={verticalLine}></div>
							<ContentLoader height="20">
								<rect
									width="91"
									height="10"
									rx="2"
									x={10}
									y="5"
									fill="#EBEBEB"
								/>
							</ContentLoader>
						</div>
					</div>
				))
			) : (
				logDetails?.status_change_log &&
				Array.isArray(logDetails?.status_change_log) &&
				logDetails?.status_change_log.length > 0 &&
				logDetails?.status_change_log?.map((log, index) =>
					log && Object.keys(log).length > 0
						? log.type === "manual"
							? renderUserLog(
									log,
									index,
									logDetails?.status_change_log.length
							  )
							: log.type === "agent"
							? renderAgentLog(
									log,
									index,
									logDetails?.status_change_log.length
							  )
							: log.type === "workflow"
							? renderWorkflowLog(
									log,
									index,
									logDetails?.status_change_log.length
							  )
							: renderIntegrationLog(
									log,
									index,
									logDetails?.status_change_log.length
							  )
						: null
				)
			)}
		</div>
	);
}

export default UsageActivityLog;
