import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import React, { useEffect, useRef, useState } from "react";
import copy from "assets/applications/copy.svg";
import {
	Accordion,
	Card,
	Overlay,
	OverlayTrigger,
	Tooltip,
} from "react-bootstrap";
import NumberPill from "UIComponents/NumberPill/NumberPill";
import { UTCDateFormatter } from "utils/DateUtility";
import caret from "components/Integrations/caret.svg";
import dayjs from "dayjs";
import optionsButton from "assets/optionsButton.svg";
import rejected from "assets/employee/rejected.svg";
import greenTick from "assets/green_tick.svg";
import pending from "assets/employee/pending.svg";
import RequestApprovers from "modules/workflow/components/AutomationRuleSidebar/Approvers";

export function ChangeLogContainer({
	logs,
	showStatus,
	pendingUser,
	setShowApproveModal,
	setAcceptType,
	showOverride,
	rejectedIndex,
	appId,
	userId,
	isAddPresent,
	setApprovers,
	approversRef,
	finalStatus,
	fetchOverviewData,
	data,
}) {
	return (
		<>
			<div className="d-flex flex-column">
				<RequestApprovers
					key={JSON.stringify(logs)}
					ref={approversRef}
					previousApprovers={logs}
					updateApprovers={setApprovers}
					isImmutable
					allFixed
					appId={appId}
					userId={userId}
					isStatic={!isAddPresent}
					showStatus={showStatus}
					pendingUser={pendingUser}
					setShowApproveModal={setShowApproveModal}
					setAcceptType={setAcceptType}
					showOverride={showOverride}
					rejectedIndex={rejectedIndex}
					finalStatus={finalStatus}
					fetchOverviewData={fetchOverviewData}
					data={data}
				/>
			</div>
		</>
	);
}
