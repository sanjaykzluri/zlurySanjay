import React from "react";
import {
	OverlayTrigger,
	Dropdown as ReactDropdown,
	Tooltip as BootstrapTooltip,
} from "react-bootstrap";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import { authStatusObj } from "../../../../common/AppAuthStatus";
import { capitalizeFirstLetter } from "../../../../utils/common";
import edit from "../../../../components/Users/Overview/edit.svg";
import { setAppsBulkAuth } from "../../../../services/api/applications";
import { TriggerIssue } from "utils/sentry";

export default function ApplicationAuthStatusDropdown({
	app,
	onAppChange,
	toggler = (
		<div className="w-100 edit_hover_class d-flex align-items-center justify-content-between">
			<div className="d-flex flex-row align-items-center">
				<img
					src={
						authStatusObj[
							(app?.app_auth_status || "needs review")
								?.toLowerCase()
								?.replace(/ /g, "_")
						]?.image
					}
					height={12}
					width={12}
				/>
				<OverlayTrigger
					placement="top"
					overlay={
						<BootstrapTooltip>
							{app?.app_auth_status
								? authStatusObj?.[
										app.app_auth_status?.replace(/ /g, "_")
								  ]?.overviewTooltip
								: authStatusObj.needs_review.overviewTooltip}
						</BootstrapTooltip>
					}
				>
					<div className="ml-2">
						{capitalizeFirstLetter(
							app?.app_auth_status || "needs review"
						)}
					</div>
				</OverlayTrigger>
			</div>
			<img src={edit} className="edit_hover_class_img" />
		</div>
	),
	tagClassName = "cursor-pointer autho__dd__cont text-decoration-none w-100 pr-2",
	dropdownClassname,
	isTable,
}) {
	const auth_status_edit = React.forwardRef(({ children, onClick }, ref) => (
		<a
			className={tagClassName}
			ref={ref}
			onClick={(e) => {
				e.preventDefault();
				onClick(e);
			}}
			style={{ marginTop: "8px", backgroundColor: "#FFFFFF" }}
		>
			{children}
		</a>
	));

	function handleAuthStatusUpdate(patchValue) {
		setAppsBulkAuth(patchValue, [app?.app_id])
			.then((res) => {
				onAppChange(patchValue);
			})
			.catch((err) =>
				TriggerIssue(
					"Error while changing auth status of applicaion",
					err
				)
			);
	}

	return (
		<>
			{isTable ? (
				<Dropdown
					toggler={toggler}
					options={Object.keys(authStatusObj)}
					onOptionSelect={(option) =>
						handleAuthStatusUpdate(option?.replace("_", " "))
					}
					optionFormatter={(option) => (
						<>
							<div className="d-flex flex-row align-items-center">
								<img
									src={authStatusObj[option].image}
									width={15.33}
								/>
								<div className="overview__dropdownbutton__d2">
									{authStatusObj[option].tooltip}
								</div>
							</div>
							<div
								className="font-9 grey-1 mt-1"
								style={{
									wordBreak: "break-word",
									whiteSpace: "normal",
								}}
							>
								{authStatusObj[option].overviewTooltip}
							</div>
						</>
					)}
					menuClassName="app_table_whats_next_auth_dropdown_menu"
					optionClassName="app_table_whats_next_auth_dropdown_option"
				/>
			) : (
				<ReactDropdown className="w-100">
					<ReactDropdown.Toggle as={auth_status_edit}>
						{toggler}
					</ReactDropdown.Toggle>
					<ReactDropdown.Menu
						className={`${
							dropdownClassname ? dropdownClassname : ""
						}`}
					>
						{Object.keys(authStatusObj).map((authStatus) => (
							<ReactDropdown.Item
								onClick={() =>
									handleAuthStatusUpdate(
										authStatus?.replace("_", " ")
									)
								}
							>
								<div className="d-flex flex-column">
									<div className="d-flex flex-row align-items-center">
										<img
											src={
												authStatusObj[authStatus].image
											}
											width={15.33}
										/>
										<div className="overview__dropdownbutton__d2">
											{authStatusObj[authStatus].tooltip}
										</div>
									</div>
									<div className="font-9 grey-1 mt-1 text-wrap">
										{
											authStatusObj[authStatus]
												.overviewTooltip
										}
									</div>
								</div>
							</ReactDropdown.Item>
						))}
					</ReactDropdown.Menu>
				</ReactDropdown>
			)}
		</>
	);
}
