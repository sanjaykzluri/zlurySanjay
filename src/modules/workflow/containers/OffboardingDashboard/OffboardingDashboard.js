import React, { useState, useEffect } from "react";
import { Col, Form, Spinner } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router";
import { debounce } from "../../../../utils/common";
import OffboardingTabHeader from "../../components/OffboardingTabHeader/OffboardingTabHeader";
import OffboardingWorkflowsTable from "../../components/OffboardingWorkflowsTable/OffboardingWorkflowsTable";
import { offboardingColumnsMapper } from "../../constants/offboarding";
import { TAB_TYPES } from "../../constants/constant";
import { Button } from "../../../../UIComponents/Button/Button";
import check from "../../../../assets/icons/check_green.svg";
import OffboardingHeader from "../../components/OffboardingHeader/OffboardingHeader";
import OffboardingFooter from "../../components/OffboardingFooter/OffboardingFooter";
import OffboardingConfirmDeclaration from "../../components/OffboardingConfirmDeclaration/OffboardingConfirmDeclaration";
import { OffboardingDashboardInvalidUrlScreen } from "../../components/OffboardingDashboardInvalidUrlScreen/OffboardingDashboardInvalidUrlScreen";

import {
	getOffboardingTasks,
	markOffboardingTaskAsComplete,
	signOffboardingDeclaration,
} from "../../redux/workflow";

const OffboardingDashboard = () => {
	const dispatch = useDispatch();
	const location = useLocation();

	const userId = location.pathname.split("/")[6];
	const workflowId = location.pathname.split("/")[4];
	const token = new URLSearchParams(location.search).get("token");

	const offboardingTask = useSelector(
		(state) => state.workflows.offboardingTasks
	);

	const [loading, setLoading] = useState(true);
	const [data, setData] = useState();
	const [searchQuery, setSearchQuery] = useState();
	const [showConfirmDeclaration, setShowConfirmDeclaration] = useState(false);
	const [buttonLoading, setButtonLoading] = useState(false);
	const [invalidUrl, setInvalidUrl] = useState(false);
	const [selectedApp, setSelectedApp] = useState();

	useEffect(() => {
		setLoading(true);
		if (workflowId && userId && token) {
			dispatch(getOffboardingTasks({ workflowId, userId, token }));
		} else {
			setLoading(false);
			setInvalidUrl(true);
		}
	}, []);

	useEffect(() => {
		if (Object.keys(offboardingTask).length > 0) {
			setData(offboardingTask);
			setLoading(false);
			setSelectedApp(null);
			setButtonLoading(false);
			setShowConfirmDeclaration(false);
		}
	}, [offboardingTask]);

	useEffect(() => {
		if (selectedApp) {
			if (workflowId && userId && token) {
				setButtonLoading(true);
				dispatch(
					markOffboardingTaskAsComplete({
						workflowId,
						userId,
						selectedApp,
						token,
					})
				);
			}
		}
	}, [selectedApp]);

	const onConfirmCompletion = () => {
		setShowConfirmDeclaration(true);
	};

	const closeOffboardingConfirmDeclaration = () => {
		setShowConfirmDeclaration(false);
	};

	const isAllAppCompleted = () => {
		if (data && data.actions && data.actions.length > 0) {
			return !data.actions.every(
				(item) => item.actionStatus === "completed"
			);
		}
		return true;
	};

	const overriddenColumnsMappers = {
		offboardingTable: {
			...offboardingColumnsMapper,
			action: {
				dataField: "action",
				text: "",
				formatter: (data, row) => (
					<>
						<div className="flex flex-row align-items-center workflow-action-component">
							<div
								style={{
									backgroundColor:
										row.appActionStatus === "completed"
											? "rgba(95, 207, 100, .1)"
											: "rgba(34, 102, 226, .1)",
									minWidth: "150px",
									borderRadius: "20px",
								}}
								className="d-flex flex-column workflow-action-container"
							>
								<Button
									style={{
										color:
											row.appActionStatus === "completed"
												? "#5FCF64"
												: "#2266E2",
										paddingTop: "5px",
										paddingBottom: "5px",
									}}
									type="link"
									className="text-decoration-none font-13"
									onClick={() => {
										if (
											row.appActionStatus !== "completed"
										) {
											setSelectedApp(row);
										}
									}}
								>
									{row.appActionStatus === "completed" && (
										<img
											src={check}
											style={{
												height: "12px",
												width: "12px",
												marginRight: "5px",
											}}
										/>
									)}
									{row.appActionStatus === "completed" ? (
										"Completed"
									) : buttonLoading &&
									  selectedApp &&
									  selectedApp.workflowActionId ===
											row.workflowActionId &&
									  selectedApp.appId === row.appId ? (
										<Spinner
											className="mr-2 blue-spinner action-edit-spinner"
											animation="border"
										/>
									) : row.dueDate === true ? (
										"Due Date passed"
									) : (
										"Mark as Complete"
									)}
								</Button>
							</div>
						</div>
					</>
				),
			},
		},
	};

	const getFilterData = () => {
		let filteredData = data?.actions || [];

		if (searchQuery) {
			filteredData = filteredData.filter((item) => {
				return (
					item.appName
						.toLowerCase()
						.includes(searchQuery.toLowerCase()) ||
					item.actionName
						.toLowerCase()
						.includes(searchQuery.toLowerCase())
				);
			});
		}
		return filteredData;
	};

	return (
		<>
			<div className="d-flex flex-column justify-content-center align-items-center pl-32 pr-32">
				<Col
					className="flex-1 d-flex flex-column pl-32 pr-32"
					lg={10}
					xl={10}
				>
					<OffboardingHeader />
					{invalidUrl && !loading && (
						<OffboardingDashboardInvalidUrlScreen />
					)}
					{!invalidUrl && (
						<div className="flex-1 new-infinite-offboarding-table-container workflows-offboarding-infinite-table mt-3 mb-3 p-0">
							<OffboardingTabHeader
								data={data || null}
								setSearchQuery={debounce(setSearchQuery, 300)}
								onClickConfirmCompletion={() => {
									onConfirmCompletion();
								}}
								isTaskCompleted={data && data.declarationSigned}
								disableButton={
									isAllAppCompleted() ||
									(data && data.declarationSigned) ||
									loading
								}
								placeholder={"apps"}
								searchQuery={searchQuery}
							/>
							<OffboardingWorkflowsTable
								data={getFilterData() || []}
								type={TAB_TYPES["declaration"]?.type}
								columns={TAB_TYPES["declaration"]?.columns}
								columnsMapper={
									overriddenColumnsMappers.offboardingTable
								}
								searchQuery={searchQuery}
								isLoadingData={loading}
								allowFewSpecialCharacters={true}
								emptyState={TAB_TYPES[
									"declaration"
								]?.emptyScreen.call(
									TAB_TYPES["declaration"]?.emptyScreen,
									searchQuery
								)}
							/>
						</div>
					)}
					<OffboardingFooter />
				</Col>
			</div>
			{showConfirmDeclaration && (
				<OffboardingConfirmDeclaration
					modalClass="workflows-template-modal"
					onCloseModal={closeOffboardingConfirmDeclaration}
					openModal={showConfirmDeclaration}
					onLoading={buttonLoading}
					onContinue={() => {
						if (workflowId && userId && token) {
							setButtonLoading(true);
							dispatch(
								signOffboardingDeclaration({
									workflowId,
									userId,
									token,
								})
							);
						}
					}}
					buttonTitle="Confirm Task Completion"
					title={"Declaration"}
				/>
			)}
		</>
	);
};

export default OffboardingDashboard;
