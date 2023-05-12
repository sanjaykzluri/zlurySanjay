import React, { useState, useRef } from "react";
import ContentLoader from "react-content-loader";
import { Helmet } from "react-helmet";
import {
	deleteScheduleExportReport,
	getScheduleExportList,
	patchScheduleName,
	scheduleReportExport,
} from "../../../services/api/scheduleReportExport";
import { InfiniteTable } from "../../Departments/InfiniteTable";
import { Empty } from "../../../modules/security/components/Empty/Empty";
import deleteIcon from "../../../assets/deleteIcon.svg";
import schedulereportstableicon from "../../../assets/reports/schedulereportstableicon.svg";
import { TriggerIssue } from "../../../utils/sentry";
import { ErrorModal } from "../../../modules/shared/components/ManualUsage/ErrorModal/ErrorModal";
import { useSelector } from "react-redux";
import { Loader } from "../../../common/Loader/Loader";
import { OverlayTrigger, Tooltip, Modal, Dropdown } from "react-bootstrap";
import close from "../../../assets/close.svg";
import { Button } from "../../../UIComponents/Button/Button";
import moment from "moment";
import downArrow from "../../../assets/down_arrow.svg";
import {
	EditScheduleExportReport,
	scheduleExportTableFilters,
} from "../../../common/ScheduleReportExport";
import { InlineEditField } from "../../../modules/shared/containers/InlineEditField/InlineEditField";
import useOutsideClick from "../../../common/OutsideClick/OutsideClick";
import { getValueFromLocalStorage } from "utils/localStorage";

const loadingData = [
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
	{ dummy: "Hello" },
];

const loaderColumns = [
	{
		dataField: "name",
		text: "Name",
		formatter: () => (
			<div className="d-flex flex-row align-items-center">
				<ContentLoader
					style={{ marginRight: 8 }}
					width={26}
					height={26}
				>
					<circle cx="13" cy="13" r="13" fill="#EBEBEB" />
				</ContentLoader>
				<ContentLoader width={91} height={10}>
					<rect width="91" height="10" rx="2" fill="#EBEBEB" />
				</ContentLoader>
			</div>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "category",
		text: "Category",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "addedon",
		text: "Added On",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "addedon",
		text: "Added On",
		formatter: () => (
			<ContentLoader width={91} height={10}>
				<rect width="91" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={80} height={10}>
				<rect width="80" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
	{
		dataField: "addedon",
		text: "Added On",
		formatter: () => (
			<ContentLoader width={10} height={10}>
				<rect width="10" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
		headerFormatter: () => (
			<ContentLoader width={10} height={10}>
				<rect width="10" height="10" rx="2" fill="#EBEBEB" />
			</ContentLoader>
		),
	},
];

export default function ScheduledExports() {
	const ref = useRef();
	const [showFilterDropdown, setShowFilterDropdown] = useState(false);
	const [totalCount, setTotalCount] = useState(0);
	const [showError, setShowError] = useState(false);
	const { refreshTable } = useSelector((state) => state.ui);
	const [filterAppliedName, setFilterAppliedName] = useState();
	const [filterAppliedKey, setFilterAppliedKey] = useState();
	const [activeRow, setActiveRow] = useState();
	const [showEditSchedule, setShowEditSchedule] = useState(false);

	const handleRefresh = () => {
		refreshTable && refreshTable();
		setActiveRow();
	};

	useOutsideClick(ref, () => {
		if (showFilterDropdown) setShowFilterDropdown(false);
	});

	const columns = [
		{
			dataField: "export_name",
			text: "Name",
			formatter: (data, row) => (
				<div className="d-flex flex-row align-items-center">
					<img src={schedulereportstableicon} className="mr-2" />
					<InlineEditField
						updateService={patchScheduleName}
						patch={{
							op: "replace",
							field: "export_name",
							value: data,
						}}
						id={row._id}
						inlineValueClassName="schedule-export-name-in-table-edit"
						type="text"
						onUpdateValue={() => refreshTable()}
						isTable={true}
						isMandatory={true}
					/>
				</div>
			),
			onmouseover: (data, row) =>
				!showEditSchedule && setActiveRow(row._id),
		},
		{
			dataField: "recurring_every",
			text: "Frequency",
			formatter: (data, row) => (
				<div className="d-flex flex-row">
					<div
						className="d-flex flex-column justify-content-center"
						style={{ width: "100px" }}
					>
						<div>{row.is_recurring ? "Recurring" : "One Time"}</div>
						<div
							className="o-8 text-capitalize"
							hidden={!row.is_recurring}
						>
							{row.recurring_frequency &&
								row.recurring_interval &&
								`Every ${row.recurring_interval} ${
									row.recurring_interval === "1"
										? row.recurring_frequency.slice(0, -1)
										: row.recurring_frequency
								}`}
						</div>
						<div
							className="o-8 text-capitalize"
							hidden={row.is_recurring || !row.schedule_date}
						>
							{row.schedule_date
								? moment(row.schedule_date).format(
										"DD MMM YYYY"
								  )
								: "-"}
						</div>
					</div>
					{activeRow === row._id && (
						<EditScheduleButton
							schedule={row}
							handleRefresh={handleRefresh}
							showEditSchedule={showEditSchedule}
							setShowEditSchedule={setShowEditSchedule}
							setActiveRow={setActiveRow}
						/>
					)}
				</div>
			),
			columnStyle: {
				width: "250px",
			},
			onmouseover: (data, row) =>
				!showEditSchedule && setActiveRow(row._id),
		},
		{
			dataField: "created_by",
			text: "Created By",
			formatter: (data, row) => (
				<div className="d-flex flex-row align-items-center">
					{row.created_by && row.created_by?.name}
				</div>
			),
			onmouseover: (data, row) =>
				!showEditSchedule && setActiveRow(row._id),
		},
		{
			dataField: "recurring_on",
			text: "Last Generated",
			formatter: (data, row) => (
				<div className="d-flex flex-row align-items-center">
					{row.is_recurring && row.last_run_at
						? moment(row.last_run_at).format("DD MMM YYYY")
						: "-"}
				</div>
			),
			onmouseover: (data, row) =>
				!showEditSchedule && setActiveRow(row._id),
		},
		{
			formatter: (data, row) => (
				<DeleteScheduleReportExport
					scheduleId={row._id}
					scheduleName={row.export_name}
					scheduleType={row.type}
					scheduleEntity={row.export_entity}
					handleRefresh={handleRefresh}
					setShowError={setShowError}
				/>
			),
			onmouseover: (data, row) =>
				!showEditSchedule && setActiveRow(row._id),
		},
	];

	const setScheduleListFilter = (key) => {
		setFilterAppliedName(scheduleExportTableFilters[key]);
		setFilterAppliedKey(key);
	};

	const fetchFilteredScheduleList = (page, row) => {
		return getScheduleExportList(page, row, filterAppliedKey);
	};

	return (
		<>
			<Helmet>
				<title>
					{"Scheduled Exports - " +
						getValueFromLocalStorage("userInfo")?.org_name +
						" - " +
						getValueFromLocalStorage("partner")?.name}
				</title>
			</Helmet>
			<div className="acc__cont">
				<div className="acc__cont__d1">Scheduled Exports</div>
				<div className="ca__table__cont">
					<div
						className="riskcriticalsecondtab__d1"
						style={{ padding: "0px 0px 0px 10px" }}
					>
						<div className="riskcriticalsecondtab__d1__d1">
							Showing {totalCount} Exports
						</div>
						<div className="riskcriticalsecondtab__d1__d2">
							<div
								onClick={() =>
									setShowFilterDropdown(!showFilterDropdown)
								}
								className="riskcriticalsecondtab__d1__d2__b1 cursor-pointer"
							>
								<span className="riskcriticalsecondtab__d1__d2__b1__d1">
									{filterAppliedKey
										? `Filtered By: ${filterAppliedName}`
										: "Apply Filter"}
								</span>
								<img src={downArrow} />
							</div>
							<div
								className="riskcriticalsecondtab__d1__d2__b1__options mt-1"
								hidden={!showFilterDropdown}
								ref={(el) => {
									if (el) {
										ref.current = el;
									}
								}}
								style={{ transform: "scale(1.1)" }}
							>
								<div
									className="riskcriticalsecondtab__d1__d2__b1__options__d1"
									onClick={() => {
										setFilterAppliedKey();
										setFilterAppliedName();
										setShowFilterDropdown(
											!showFilterDropdown
										);
									}}
								>
									All Schedule Exports
								</div>
								{Object.keys(scheduleExportTableFilters).map(
									(key) => (
										<div
											className="riskcriticalsecondtab__d1__d2__b1__options__d1"
											key={key}
											onClick={() => {
												setScheduleListFilter(key);
												setShowFilterDropdown(
													!showFilterDropdown
												);
											}}
										>
											{scheduleExportTableFilters[key]}
										</div>
									)
								)}
							</div>
						</div>
					</div>
					<div key={filterAppliedKey}>
						<InfiniteTable
							perPage={30}
							handleCheckedChange={(ch) => {}}
							loadingData={loadingData}
							loadingColumns={loaderColumns}
							fetchData={
								filterAppliedKey
									? fetchFilteredScheduleList
									: getScheduleExportList
							}
							columns={columns}
							apiDataKey={"data"}
							keyField="_id"
							emptyState={<Empty />}
							componentWithoutRedux
							searchQuery={""}
							setCount={setTotalCount}
						/>
					</div>
				</div>
			</div>
			{showError && (
				<>
					<div className="modal-backdrop show"></div>
					<ErrorModal
						isOpen={showError}
						handleClose={() => setShowError(false)}
						errorMessage="Server Error! We couldn't complete your request."
					/>
				</>
			)}
		</>
	);
}

export function DeleteScheduleConfirmation(props) {
	const {
		show,
		onHide,
		scheduleId,
		scheduleName,
		scheduleType,
		scheduleEntity,
		handleRefresh,
		setShowError,
	} = props;
	const [deleteInProgress, setDeleteInProgress] = useState(false);

	const handleClose = () => {
		setDeleteInProgress(false);
		onHide && onHide();
	};

	const handleDeleteSchedule = () => {
		setDeleteInProgress(true);
		deleteScheduleExportReport(scheduleId, scheduleType, scheduleEntity)
			.then((res) => {
				if (res.status === "success") {
					handleRefresh && handleRefresh();
					handleClose();
				} else {
					TriggerIssue("Unexpected response on deleting schedule");
					setShowError(true);
					handleClose();
				}
			})
			.catch((error) => {
				TriggerIssue("Unexpected response on deleting schedule", error);
				setShowError(true);
				handleClose();
			});
	};

	return (
		<>
			<div className="modal-backdrop show"></div>
			<Modal centered show={show} onHide={handleClose}>
				{deleteInProgress ? (
					<div className="delete-schedule-confirmation-modal justify-content-center">
						<Loader width={100} height={100} />
					</div>
				) : (
					<div className="delete-schedule-confirmation-modal">
						<div className="delete-schedule-confirmation-close">
							<img
								role="button"
								alt="Close"
								onClick={handleClose}
								src={close}
							/>
						</div>
						<div className="bold-600 font-18 mt-4 mb-4 text-align-center">
							You're about to delete{" "}
							{scheduleName?.length > 50
								? scheduleName.slice(0, 50) + "..."
								: scheduleName}
						</div>
						<div className="mb-5">
							<p>Are you sure you want to continue?</p>
						</div>
						<div className="d-flex flex-row justify-content-center">
							<Button type="link" onClick={handleClose}>
								Cancel
							</Button>
							<Button onClick={handleDeleteSchedule}>
								Delete
							</Button>
						</div>
					</div>
				)}
			</Modal>
		</>
	);
}

export function DeleteScheduleReportExport({
	scheduleId,
	scheduleName,
	scheduleType,
	scheduleEntity,
	handleRefresh,
	setShowError,
}) {
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
	return (
		<>
			<div className="d-flex flex-row align-items-center">
				<img
					src={deleteIcon}
					className="cursor-pointer"
					onClick={() => setShowDeleteConfirmation(true)}
				/>
			</div>
			{showDeleteConfirmation && (
				<DeleteScheduleConfirmation
					show={showDeleteConfirmation}
					onHide={() => setShowDeleteConfirmation(false)}
					scheduleId={scheduleId}
					scheduleName={scheduleName}
					scheduleType={scheduleType}
					scheduleEntity={scheduleEntity}
					handleRefresh={handleRefresh}
					setShowError={setShowError}
				/>
			)}
		</>
	);
}

export function EditScheduleButton(props) {
	const {
		schedule,
		handleRefresh,
		showEditSchedule,
		setShowEditSchedule,
		setActiveRow,
	} = props;
	return (
		<>
			<div style={{ position: "relative" }}>
				<span
					onClick={() => setShowEditSchedule(true)}
					className="cursor-pointer"
					style={{ color: "#2266E2" }}
				>
					Edit
				</span>
				{showEditSchedule && (
					<EditScheduleExportReport
						show={showEditSchedule}
						onHide={() => {
							setShowEditSchedule(false);
						}}
						schedule={schedule}
						handleRefresh={handleRefresh}
					/>
				)}
			</div>
		</>
	);
}
