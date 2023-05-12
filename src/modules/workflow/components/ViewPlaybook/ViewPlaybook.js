import { Loader } from "common/Loader/Loader";
import React, { useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import ViewPlaybookApplication from "./ViewPlaybookApplication";
import onboarding from "../../../../assets/icons/onboarding-blue.svg";
import offboarding from "../../../../assets/workflow/offboarding.svg";
import ViewPlaybookInfo from "./ViewPlaybookInfo";
import { WORFKFLOW_TYPE } from "modules/workflow/constants/constant";
import LongTextTooltip from "modules/shared/components/LongTextTooltip/LongTextTooltip";

const ViewPlaybook = ({
	loading,
	playbookData,
	onEditPublishedPlaybook,
	editPlaybook,
	entity,
	onCloseModal,
	onshowCompileScreen,
}) => {
	const [selectedSection, setSelectedSection] = useState("details");
	const loader = (
		<>
			<div
				className="d-flex justify-content-center align-items-center"
				style={{ height: "85vh" }}
			>
				<Loader height={100} width={100} />
			</div>
		</>
	);

	const header = (
		<>
			<div>
				<img
					height={40}
					width={30}
					src={
						playbookData?.type === WORFKFLOW_TYPE.ONBOARDING
							? onboarding
							: offboarding
					}
					alt=""
				/>
			</div>
			<div className="d-flex flex-column ml-2">
				<span
					className="title-text grey-1"
					style={{ fontSize: "10px", fontWeight: "600" }}
				>
					{playbookData?.type?.toUpperCase()}
				</span>

				<LongTextTooltip
					text={playbookData.name}
					maxWidth={"20vw"}
					placement="bottom"
					style={{
						fontSize: "18px",
						fontWeight: "600",
						paddingBottom: "12px",
					}}
				/>
			</div>
			<div
				style={{
					borderTop: "1px solid rgb(113 113 113 / 9%)",
					marginTop: "10px",
					marginBottom: "10px",
				}}
			/>
		</>
	);

	return (
		<>
			{loading && loader}
			{!loading && (
				<div
					style={{
						maxHeight: "90vh",
						minHeight: "90vh",
						backgroundColor: "#F5F6F9",
					}}
				>
					<div
						style={{ backgroundColor: "#FFFFFF", width: "100%" }}
						className="justify-content-start d-flex  p-3 mt-2 mb-2"
					>
						{header}
					</div>
					<div className="d-flex flex-row">
						<div
							style={{
								backgroundColor: "#FFFFFF",
								borderRadius: "8px",
								height: "72vh",
							}}
							className="d-flex p-2 m-2 flex-1"
						>
							<ViewPlaybookInfo
								loading={loading}
								playbookData={playbookData}
								onEditPublishedPlaybook={
									onEditPublishedPlaybook
								}
								entity={entity}
								selectedSection={selectedSection}
								editPlaybook={editPlaybook}
								onCloseModal={onCloseModal}
							/>
						</div>
						<div className="d-flex flex-2 pl-4 m-2">
							<ViewPlaybookApplication
								loading={loading}
								playbookData={playbookData}
								selectedSection={selectedSection}
								setSelectedSection={setSelectedSection}
								onEditPublishedPlaybook={
									onEditPublishedPlaybook
								}
								onCloseModal={onCloseModal}
								entity={entity}
								editPlaybook={editPlaybook}
								onshowCompileScreen={onshowCompileScreen}
							/>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default ViewPlaybook;
