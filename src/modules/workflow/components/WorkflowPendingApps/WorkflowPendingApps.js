import React, { useEffect, useState } from "react";
import ContentLoader from "react-content-loader";
import { Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router";
import { getPendingAppList, addPendingAppList } from "../../redux/workflow";
import { Button } from "../../../../UIComponents/Button/Button";
import info from "../../../../assets/icons/info-orange.svg";
import { WORFKFLOW_TYPE } from "../../constants/constant";

export function WorkflowPendingApps(props) {
	const dispatch = useDispatch();
	const location = useLocation();

	const workflow = useSelector((state) => state.workflows.workflow);
	const pendingApps = useSelector((state) => state.workflows.pendingAppList);
	const workflowId = location.pathname.split("/")[2];

	const [loading, setLoading] = useState(true);
	const [pendingAppLoading, setPendingAppLoading] = useState(false);

	useEffect(() => {
		if (workflowId && workflow?.type === WORFKFLOW_TYPE.OFFBOARDING) {
			setLoading(true);
			dispatch(getPendingAppList({ workflowId }));
		}
	}, [workflow?.nodes?.length]);

	useEffect(() => {
		setLoading(false);
		setPendingAppLoading(false);
	}, [pendingApps?.length]);

	const onAddPendingApps = () => {
		setPendingAppLoading(true);
		const apps = pendingApps.map((app) => app._id);
		dispatch(addPendingAppList({ workflowId, apps }));
	};

	return (
		<div
			className={`mx-auto  ${props.className ? props.className : ""}`}
			style={props.style}
		>
			{loading && (
				<div
					style={{
						background: "#FFF7F0",
						minWidth: "-moz-available",
					}}
					className="d-inline-flex border-radius-4 mt-3 p-2 align-items-center"
				>
					<ContentLoader
						style={{ marginRight: 8 }}
						width={26}
						height={26}
					>
						<circle cx="13" cy="13" r="13" fill="#EBEBEB" />
					</ContentLoader>
					<ContentLoader width={500} height={10}>
						<rect width="500" height="10" rx="2" fill="#EBEBEB" />
					</ContentLoader>
					<ContentLoader width={91} height={10}>
						<rect width="91" height="10" rx="2" fill="#EBEBEB" />
					</ContentLoader>
				</div>
			)}
			{!loading && pendingApps.length > 0 && (
				<div
					style={{
						background: "#FFF7F0",
						minWidth: "-moz-available",
					}}
					className="d-inline-flex border-radius-4 mt-3 p-2 align-items-center"
				>
					<img className="mr-2 ml-2" src={info} width={20} />
					<p className="font-12 grey mb-0">
						{pendingApps.length} apps in-use by the following users
						have not been included in this workflow
					</p>
					<Button
						className="text-captalize font-12 p-0 d-flex pr-2 ml-2"
						type="link"
						disabled={pendingAppLoading}
						style={{
							minWidth: "fit-content",
							justifyContent: "flex-end",
							display: "flex",
							flex: 1,
						}}
						onClick={() => {
							onAddPendingApps();
						}}
					>
						+ Add {pendingApps.length} Apps
						{pendingAppLoading && (
							<Spinner
								className="ml-2 blue-spinner action-edit-spinner mb-1"
								animation="border"
							/>
						)}
					</Button>
				</div>
			)}
		</div>
	);
}
