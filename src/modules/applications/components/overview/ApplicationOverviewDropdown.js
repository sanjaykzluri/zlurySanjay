import React, { useEffect, useState } from "react";
import EllipsisSVG from "../../../../assets/icons/ellipsis-v.svg";
import RoleContext from "../../../../services/roleContext/roleContext";
import { useDispatch, useSelector } from "react-redux";
import { applicationConstants } from "../../../../constants";
import { fetchApplicationActionHistory } from "../../../../actions/applications-action";
import { TriggerIssue } from "../../../../utils/sentry";
import {
	archiveApplications,
	unArchiveApplications,
} from "../../../../services/api/applications";
import { Dropdown } from "react-bootstrap";
import { MapToApp } from "../../../../components/Applications/Overview/MapToApp";
import { useHistory } from "react-router-dom";
import { UnmapConfirmation } from "../../../../components/Applications/Overview/UnmapConfirmation";
import { MergeApps } from "../../../../components/Applications/Overview/MergeApps";
import ArchiveModal from "../../../../common/ArchiveModal/ArchiveModal";
import ActionLogHistory from "../../../../components/Users/ActionLogHistory/ActionLogHistory";
import {
	trackActionSegment,
	trackPageSegment,
} from "modules/shared/utils/segment";
import { openModal } from "reducers/modal.reducer";

const ellipsis = React.forwardRef(({ children, onClick }, ref) => (
	<a
		className="cursor-pointer"
		ref={ref}
		onClick={(e) => {
			e.preventDefault();
			onClick(e);
		}}
	>
		{children}
	</a>
));

export default function ApplicationOverviewDropdown({
	app,
	onAppChange,
	toggler = <img src={EllipsisSVG} width="20" />,
}) {
	const { isViewer } = React.useContext(RoleContext);

	const history = useHistory();
	const dispatch = useDispatch();

	const actionHistory = useSelector(
		(state) => state.applicationActionHistory
	);

	const { userInfo } = useSelector((state) => state);

	const defaultTab =
		userInfo?.application_tabs?.find((option) => option.isDefault)?.name ||
		"managed";

	const [showMapApp, setShowMapApp] = useState(false);
	const [showUnmapApp, setShowUnmapApp] = useState(false);
	const [showMergeApp, setShowMergeApp] = useState(false);
	const [showArchiveApp, setShowArchiveApp] = useState(false);
	const [showActionHistory, setShowActionHistory] = useState(false);
	const [mergeTargetApp, setMergeTargetApp] = useState();

	useEffect(() => {
		if (!actionHistory && app?.app_id) {
			dispatch(fetchApplicationActionHistory(app?.app_id));
		}
	}, []);

	function handleUnarchivingApp() {
		trackActionSegment(
			"Applications",
			"Single Application - Unarchive App",
			{
				appId: app?.app_id,
				appName: app?.app_name,
			}
		);
		try {
			unArchiveApplications([app?.app_id]).then((res) => {
				if (res.status === "success") {
					onAppChange();
				} else {
					TriggerIssue(
						"Unexpected response when unarchiving app",
						res
					);
				}
			});
		} catch (error) {
			TriggerIssue("Error in unarchiving app", error);
		}
	}

	function handleMergeComplete() {
		setShowMergeApp(false);
		setMergeTargetApp();
		onAppChange();
		history.push(`/applications#${defaultTab}`);
	}

	return (
		<>
			{!isViewer && app?.app_id && (
				<Dropdown className="ml-2 mb-auto mt-1">
					<Dropdown.Toggle as={ellipsis}>{toggler}</Dropdown.Toggle>

					<Dropdown.Menu>
						<Dropdown.Item
							onClick={() => {
								history.push("/contract/new");
								trackPageSegment(
									"Applications",
									"Single Application - Add Contract",
									{
										appId: app?.app_id,
										appName: app?.app_name,
									}
								);
							}}
						>
							Add Contract
						</Dropdown.Item>
						<Dropdown.Item
							onClick={() => {
								history.push("/subscription/new");
								trackPageSegment(
									"Applications",
									"Single Application - Add Subscription",
									{
										appId: app?.app_id,
										appName: app?.app_name,
									}
								);
							}}
						>
							Add Subscription
						</Dropdown.Item>
						<Dropdown.Item
							onClick={() => {
								history.push("/perpetual/new");
								trackPageSegment(
									"Applications",
									"Single Application - Add Perpetual",
									{
										appId: app?.app_id,
										appName: app?.app_name,
									}
								);
							}}
						>
							Add Perpetual
						</Dropdown.Item>
						<Dropdown.Item
							onClick={() =>
								dispatch({
									type: applicationConstants.TOGGLE_ADD_USER,
									payload: true,
								})
							}
						>
							Add Users
						</Dropdown.Item>
						<Dropdown.Item
							onClick={() => {
								dispatch({
									type: applicationConstants.TOGGLE_ADD_TRANSACTION,
									payload: true,
								});
								trackPageSegment(
									"Applications",
									"Single Application - Add Transactions",
									{
										appId: app?.app_id,
										appName: app?.app_name,
									}
								);
							}}
						>
							Add Transactions
						</Dropdown.Item>
						<Dropdown.Divider className="mx-3 my-1" />
						{app?.app_parent_id != null &&
							app?.app_parent_id != "" && (
								<Dropdown.Item
									onClick={() => {
										setShowUnmapApp(true);
										trackPageSegment(
											"Applications",
											"Single Application - Unmap App Modal",
											{
												appId: app?.app_id,
												appName: app?.app_name,
											}
										);
									}}
								>
									Unmap app
								</Dropdown.Item>
							)}
						<Dropdown.Item onClick={() => setShowMapApp(true)}>
							Map to a different app
						</Dropdown.Item>
						<Dropdown.Item onClick={() => setShowMergeApp(true)}>
							Merge with another app
						</Dropdown.Item>
						<Dropdown.Divider className="mx-3 my-1" />
						{!app?.app_archive ? (
							<Dropdown.Item
								onClick={() => {
									setShowArchiveApp(true);
									trackPageSegment(
										"Applications",
										"Single Application - Archive App Modal",
										{
											appId: app?.app_id,
											appName: app?.app_name,
										}
									);
								}}
							>
								Archive App
							</Dropdown.Item>
						) : (
							<Dropdown.Item onClick={handleUnarchivingApp}>
								Un-archive App
							</Dropdown.Item>
						)}
						<Dropdown.Item
							onClick={() => {
								dispatch(
									fetchApplicationActionHistory(app?.app_id)
								);
								setShowActionHistory(true);
							}}
						>
							View Action History
						</Dropdown.Item>
						<Dropdown.Item
							onClick={() => {
								dispatch(
									openModal("applicationSourceSettings", {
										sources: app?.app_source_array,
										settings: app?.app_source_settings,
										appId: app?.app_id,
									})
								);
							}}
						>
							Primary Source Settings
						</Dropdown.Item>
					</Dropdown.Menu>
				</Dropdown>
			)}

			{showMapApp && (
				<MapToApp
					show={showMapApp}
					application={app}
					onMapComplete={() => {
						setShowMapApp(false);
						onAppChange();
					}}
					onMergeClick={(targetApp) => {
						setMergeTargetApp(targetApp);
						setShowMapApp(false);
						setShowMergeApp(true);
					}}
					onHide={() => {
						setShowMapApp(false);
					}}
				/>
			)}

			{showUnmapApp && (
				<UnmapConfirmation
					show={showUnmapApp}
					onClose={() => setShowUnmapApp(false)}
					onAppChange={() => onAppChange()}
					app_id={app?.app_id}
					app_name={app?.app_name}
				/>
			)}

			{showMergeApp && (
				<MergeApps
					show={showMergeApp}
					application={app}
					targetApp={mergeTargetApp}
					onMergeComplete={handleMergeComplete}
					onHide={() => {
						setShowMergeApp(false);
						setMergeTargetApp();
					}}
				/>
			)}

			{showArchiveApp && (
				<ArchiveModal
					isOpen={showArchiveApp}
					ArchiveFunc={archiveApplications}
					successResponse={() => onAppChange()}
					closeModal={() => setShowArchiveApp(false)}
					name={app?.app_name}
					type="app"
					id={app?.app_id}
				/>
			)}

			{showActionHistory && actionHistory && (
				<ActionLogHistory
					actionHistory={actionHistory}
					onHide={() => setShowActionHistory(false)}
					historyType="app"
				/>
			)}
		</>
	);
}
