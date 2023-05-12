import React, { useState } from "react";
import ContentLoader from "react-content-loader";
import close from "../../../../assets/close.svg";
import { InfiniteTable } from "../../../../components/Departments/InfiniteTable";
import {
	getScheduleReportList,
	patchScheduleName,
} from "../../../../services/api/scheduleReportExport";
import { Empty } from "../../../security/components/Empty/Empty";
import schedulereportstableicon from "../../../../assets/reports/schedulereportstableicon.svg";
import { ErrorModal } from "../../../../modules/shared/components/ManualUsage/ErrorModal/ErrorModal";
import {
	DeleteScheduleReportExport,
	EditScheduleButton,
} from "../../../../components/Settings/ScheduledExports/ScheduledExports";
import { useSelector } from "react-redux";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import moment from "moment";
import { InlineEditField } from "../../../shared/containers/InlineEditField/InlineEditField";

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

export default function ScheduleReportsTableModal(props) {
	const handleClose = () => {
		props.onHide();
	};
	const [totalCount, setTotalCount] = useState(0);
	const [showError, setShowError] = useState(false);
	const { refreshTable } = useSelector((state) => state.ui);
	const [activeRow, setActiveRow] = useState();
	const [showEditSchedule, setShowEditSchedule] = useState(false);

	const handleRefresh = () => {
		refreshTable && refreshTable();
		setActiveRow();
	};

	const columns = [
		{
			dataField: "export_name",
			text: "Report Name",
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
						inlineValueClassName="schedule-report-name-in-table-edit"
						inlineInputClassName="schedule-report-name-in-table-input"
						editStyle={{ maxWidth: "125px" }}
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
				width: "150px",
			},
			headerStyle: {
				width: "150px",
			},
			onmouseover: (data, row) =>
				!showEditSchedule && setActiveRow(row._id),
		},
		{
			dataField: "recurring_on",
			text: "Last Generated On",
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

	return (
		<>
			<div className="modal-backdrop show"></div>
			<div
				className="securityRiskModal h-100"
				style={{ overflowY: "scroll" }}
			>
				<div className="d-flex flex-row align-items-centre py-4">
					<div className="mx-auto">
						<span className="contracts__heading">
							Scheduled Reports
						</span>
					</div>
					<img
						alt="Close"
						onClick={handleClose}
						src={close}
						className="cursor-pointer mr-3"
					/>
				</div>
				<div className="riskcriticalsecondtab__d1__d1 ml-2 mb-2">
					Showing {totalCount} Reports
				</div>
				<InfiniteTable
					perPage={30}
					handleCheckedChange={(ch) => {}}
					loadingData={loadingData}
					loadingColumns={loaderColumns}
					fetchData={getScheduleReportList}
					columns={columns}
					apiDataKey={"data"}
					keyField="_id"
					emptyState={<Empty />}
					componentWithoutRedux
					searchQuery={""}
					setCount={setTotalCount}
				/>
			</div>
			{showError && (
				<ErrorModal
					isOpen={showError}
					handleClose={() => setShowError(false)}
					errorMessage="Server Error! We couldn't complete your request."
				/>
			)}
		</>
	);
}
