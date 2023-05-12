import React, { useState, useRef } from "react";

import Options from "../TableComponents/Options";

export const OptionsFormatter = (props) => {
	const org_user_app_id = props.org_user_app_id;
	const org_user_app_status = props.org_user_app_status;
	const user_id = props.user_id;

	const onClickAddManualUsage = () => {
		props.setInterColumnsStateObject({
			...props.interColumnsStateObject,
			open_manual: true,
			orgUserAppId: props.row[org_user_app_id],
			addManualUsage: !props.row.is_manual_source_present,
		});
	};

	if (
		!!props.row[org_user_app_status] &&
		typeof props.row[org_user_app_status] === "string" &&
		props.row[org_user_app_status].toLowerCase() === "inactive"
	) {
		return (
			<Options
				popOverClassName="user-app-options-popover"
				isActive={props.isActive}
				isUser={props.isUser}
				userId={props.isUser ? props.row[user_id] : undefined}
				onClickAddManualUsage={onClickAddManualUsage}
				onClickMarkAsActive={props.markAsActive}
				orgUserAppId={props.row[org_user_app_id]}
				appId={props.row["app_id"]}
				isOrgUserAppActive={false}
				interColumnsStateObject={props.interColumnsStateObject}
				refresh={props.refresh}
				style={props.style}
			/>
		);
	} else {
		return (
			<Options
				popOverClassName="user-app-options-popover"
				isActive={props.isActive}
				isUser={props.isUser}
				userId={props.isUser ? props.row[user_id] : undefined}
				onClickAddManualUsage={onClickAddManualUsage}
				onClickMarkAsNotActive={props.markAsNotActive}
				orgUserAppId={props.row[org_user_app_id]}
				appId={props.row["app_id"]}
				isOrgUserAppActive={true}
				interColumnsStateObject={props.interColumnsStateObject}
				refresh={props.refresh}
				style={props.style}
			/>
		);
	}
};
