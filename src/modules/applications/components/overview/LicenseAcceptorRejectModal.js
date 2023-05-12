import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import { NameBadge } from "common/NameBadge";
import { Empty } from "components/Departments/Empty";
import { InfiniteTable } from "components/Departments/InfiniteTable";
import HeaderTitleBC from "components/HeaderTitleAndGlobalSearch/HeaderTitleBC";
import { ErrorModal } from "modules/shared/components/ManualUsage/ErrorModal/ErrorModal";
import React, { useState, useRef, useEffect } from "react";
import { Breadcrumb } from "react-bootstrap";
import ContentLoader from "react-content-loader";
import check from "assets/icons/green-check.svg";
import redClose from "assets/red-close.svg";
import close from "assets/close.svg";
export function LicenseApproveorReject({ app, closeModal }) {
	const isCancelled = React.useRef(false);
	useEffect(() => {
		return () => {
			isCancelled.current = true;
		};
	}, []);
	const ref = useRef();
	const [totalCount, setTotalCount] = useState(0);
	const [showError, setShowError] = useState(false);
	const [filterAppliedKey, setFilterAppliedKey] = useState();
	const [activeRow, setActiveRow] = useState();
	const [showEditSchedule, setShowEditSchedule] = useState(false);

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
	const getData = async () => {
		return {
			data: [
				{
					User: "Jeffery Scott",
					License: "Dynamics 365 Sales Premium",
					"Request Date": "2011-09-24",
					Reason: "Keeping hold on this for some tasks",
				},
				{
					User: "Steve Jason",
					License: "Azure Premium P2",
					"Request Date": "2011-09-25",
					Reason: "Will need this for another month",
				},
				{
					User: "Anne Cooper",
					License: "Azure Premium P1",
					"Request Date": "2011-09-26",
					Reason: "Need this to perform a few tasks",
				},
				{
					User: "Mark Cooper",
					License: "Power BI",
					"Request Date": "2011-09-26",
					Reason: "Request you dont remove the license",
				},
				{
					User: "Mark Cooper",
					License: "Dynamics 365_Customer Service Enterprise",
					"Request Date": "2011-09-26",
					Reason: "Need this license for extended functionality",
				},
				{
					User: "Mark Cooper",
					License: "Azure Premium P2",
					"Request Date": "2011-09-26",
					Reason: "Need to add users",
				},
			],
		};
	};
	const columns = [
		{
			dataField: "User",
			text: "Name",
			formatter: (data, row) => (
				<div className="d-flex flex-row align-items-center">
					<NameBadge name={data} />{" "}
					<label style={{ paddingLeft: "6px", paddingTop: "8px" }}>
						{data}
					</label>
				</div>
			),
		},
		{
			dataField: "License",
			text: "LICENSE",
			formatter: (data, row) => (
				<div className="d-flex flex-row">
					<div className="d-flex flex-column justify-content-center">
						{data}
					</div>
				</div>
			),
			columnStyle: {
				width: "250px",
			},
			onmouseover: (data, row) =>
				!showEditSchedule && setActiveRow(row._id),
		},
		{
			dataField: "Request Date",
			text: "Request Date",
			formatter: (data, row) => (
				<div className="d-flex flex-row align-items-center">{data}</div>
			),
			onmouseover: (data, row) =>
				!showEditSchedule && setActiveRow(row._id),
		},
		{
			dataField: "Reason",
			text: "Reason",
			formatter: (data, row) => (
				<div className="d-flex flex-row align-items-center">{data}</div>
			),
			onmouseover: (data, row) =>
				!showEditSchedule && setActiveRow(row._id),
		},
		{
			formatter: (data, row) => (
				<div
					className="d-flex"
					style={{ width: "55px", justifyContent: "space-between" }}
				>
					<div
						style={{
							background: "rgba(95, 207, 100, 0.2)",
							borderRadius: "50%",
							alignItems: "center",
							justifyContent: "center",
							display: "flex",
							width: "25px",
							height: "25px",
						}}
					>
						<img src={check} />
					</div>
					<div
						style={{
							background: "rgba(254, 105, 85, 0.2)",
							borderRadius: "50%",
							alignItems: "center",
							justifyContent: "center",
							display: "flex",
							width: "25px",
							height: "25px",
						}}
					>
						<img src={redClose} />
					</div>
				</div>
			),
			onmouseover: (data, row) =>
				!showEditSchedule && setActiveRow(row._id),
		},
	];

	return (
		<>
			<div className="modal-backdrop show"></div>
			<div
				className="addContractModal__TOP h-100"
				style={{ width: "80%" }}
			>
				<div
					className="ins-1"
					style={{
						height: "60px",
						padding: "15px",
						justifyContent: "space-around",
					}}
				>
					<Breadcrumb bsPrefix="my-bread">
						<button className="my-bread-item my-bread-itemnew">
							<GetImageOrNameBadge
								url={app?.app_logo}
								name={app?.app_name}
								height={26}
							/>
							{app?.app_name}
						</button>
						<Breadcrumb.Item
							active
							bsPrefix="my-bread-item d-flex align-items-center"
						>
							<div
								style={{
									marginLeft: "5px",
									cursor: "default",
								}}
								title="Review request to keep license"
								className="truncate_breadcrumb_item_name"
							>
								Review request to keep license
							</div>
						</Breadcrumb.Item>
					</Breadcrumb>
					<img src={close} onClick={closeModal} />
				</div>
				<div style={{ padding: "15px" }}>
					<div className="riskcriticalsecondtab__d1">
						<div className="riskcriticalsecondtab__d1__d1">
							Showing 6 Users
						</div>
					</div>
					<div key={filterAppliedKey}>
						<InfiniteTable
							perPage={30}
							handleCheckedChange={(ch) => {}}
							loadingData={loadingData}
							loadingColumns={loaderColumns}
							fetchData={getData}
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
