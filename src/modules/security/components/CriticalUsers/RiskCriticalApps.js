import React, {
	useContext,
	useEffect,
	useState,
	Fragment,
	useRef,
} from "react";
import {
	DottedRisk,
	getRiskStatus,
} from "../../../../common/DottedRisk/DottedRisk";
import {
	getAllCritcialAppsforUsers,
	getAllCritcialAppsforUsersWithFilter,
} from "../../../../services/api/security";
import ContentLoader from "react-content-loader";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import inactivecheck from "../../../../assets/applications/inactivecheck.svg";
import check from "../../../../assets/applications/check.svg";
import { InfiniteTable } from "../../../../components/Departments/InfiniteTable";
import { NameBadge } from "../../../../common/NameBadge";
import down from "../../../../assets/reports/down.svg";
import { securityConstants } from "../../../../constants/security";
import useOutsideClick from "../../../../common/OutsideClick/OutsideClick";
import "./CriticalUsers.css";
import { Empty } from "../Empty/Empty";
import { AppAuthStatusIconAndTooltip } from "../../../../common/AppAuthStatus";
import AppTableComponent from "../../../../common/AppTableComponent";
import Rating from "../../../../components/Applications/SecurityCompliance/Rating";
import { SecurityThreatFormatter } from "./CriticalUsers";
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
		text: "Department",
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
		dataField: "head",
		text: "Head",
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
		dataField: "usersCount",
		text: "Users",
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
		dataField: "appsCount",
		text: "Apps Used",
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
];
function RiskCriticalApps(props) {
	const ref = useRef();
	const [totalCount, setTotalCount] = useState(0);
	const [reqBody, setReqBody] = useState({
		scope: "",
	});
	const [scopeDropdownActive, setScopeDropdownActive] = useState(false);
	const [scopeFilterValue, setScopeFilterValue] = useState(null);
	const columns = [
		{
			dataField: "app_name",
			text: "Name",
			formatter: (row, data, rowindex) => (
				<AppTableComponent
					app_name={data?.app_name}
					app_logo={data?.app_logo}
					app_auth_status={data?.app_state}
					app_id={data?.app_id}
					logo_height="auto"
					logo_width={28}
				/>
			),
		},
		{
			dataField: "user_app_status",
			text: "Usage",
			formatter: (data, row) => (
				<div className="flex flex-row center">
					{(data || row?.user_status) === "inactive" ? (
						<img src={inactivecheck}></img>
					) : (
						<img src={check} alt="" />
					)}
					<div
						className="flex flex-row justify-content-center align-items-center"
						style={{ marginLeft: "8px" }}
					>
						{(data || row?.user_status)?.toLowerCase() ===
						"inactive"
							? "Not in Use"
							: "In use"}
					</div>
				</div>
			),
		},
		{
			dataField: "user_app_role",
			text: "Role",
			formatter: (row, data, rowindex) => (
				<div className="flex flex-row align-items-center text-capitalize">
					{row || "-"}{" "}
				</div>
			),
		},
		{
			dataField: "risk_level",
			text: "Threat",
			formatter: (data, row) => <SecurityThreatFormatter threat={data} />,
		},
	];
	function fetchDataFn(page, row) {
		return getAllCritcialAppsforUsers(props.id, page, row);
	}
	function fetchDataFnWithFilter(page, row, risk) {
		return getAllCritcialAppsforUsersWithFilter(
			props.id,
			page,
			row,
			risk,
			reqBody
		);
	}
	useOutsideClick(ref, () => {
		if (scopeDropdownActive) setScopeDropdownActive(false);
	});
	useEffect(() => {
		if (props.usingFilter) {
			setScopeFilterValue(props.scope);
		} else {
			setScopeFilterValue(securityConstants.SHOW_ALL);
		}
	}, [props.usingFilter]);
	useEffect(() => {
		let tempObj = { ...reqBody };
		tempObj.scope = props.scope;
		setReqBody(tempObj);
	}, [props.scope]);
	const handleOptionSelect = (option) => {
		if (option === "") {
			props.setScope("");
			setScopeFilterValue(securityConstants.SHOW_ALL);
			props.setUsingFilter(false);
		} else {
			props.setScope(option);
			setScopeFilterValue(option);
			props.setUsingFilter(true);
		}
	};
	return (
		<>
			{props.currentSection === "criticalapps" && (
				<>
					<div
						className="position-relative"
						style={{
							height: "calc(100vh - 112px)",
							overflowY: "auto",
						}}
					>
						<div className="riskcriticalsecondtab__d1">
							<div className="riskcriticalsecondtab__d1__d1">
								Showing {totalCount} Apps
							</div>
							<div className="riskcriticalsecondtab__d1__d2">
								<button
									className="riskcriticalsecondtab__d1__d2__b1"
									onClick={() => setScopeDropdownActive(true)}
								>
									<span
										className="riskcriticalsecondtab__d1__d2__b1__d1 text-truncate"
										style={{ maxWidth: "20vw" }}
									>
										Filter by :{scopeFilterValue}
									</span>
									<img src={down}></img>
								</button>
								<div
									className="riskcriticalsecondtab__d1__d2__b1__options"
									hidden={!scopeDropdownActive}
									ref={(el) => {
										if (el) {
											ref.current = el;
										}
									}}
								>
									<div
										className="riskcriticalsecondtab__d1__d2__b1__options__d1"
										onClick={() => {
											handleOptionSelect("");
											setScopeDropdownActive(false);
										}}
									>
										Show All
									</div>
									{props.scopes && props.scopes.length > 0 ? (
										<>
											{props.scopes.map((el) => (
												<div
													className="riskcriticalsecondtab__d1__d2__b1__options__d1"
													key={el._id}
													onClick={() => {
														handleOptionSelect(
															el.scope
														);
														setScopeDropdownActive(
															false
														);
													}}
												>
													{el.scope}
												</div>
											))}
										</>
									) : null}
								</div>
							</div>
						</div>
						<div key={props.scope}>
							{props.usingFilter ? (
								<InfiniteTable
									perPage={30}
									handleCheckedChange={(ch) => {}}
									loadingData={loadingData}
									loadingColumns={loaderColumns}
									fetchData={fetchDataFnWithFilter}
									columns={columns}
									apiDataKey={"data"}
									keyField="app_id"
									emptyState={<Empty></Empty>}
									componentWithoutRedux
									searchQuery={""}
									setCount={setTotalCount}
									disableCheckColumn={true}
								/>
							) : (
								<InfiniteTable
									perPage={30}
									handleCheckedChange={(ch) => {}}
									loadingData={loadingData}
									loadingColumns={loaderColumns}
									fetchData={fetchDataFn}
									columns={columns}
									apiDataKey={"data"}
									keyField="app_id"
									emptyState={<Empty></Empty>}
									componentWithoutRedux
									searchQuery={""}
									setCount={setTotalCount}
									disableCheckColumn={true}
								/>
							)}
						</div>
					</div>
				</>
			)}
		</>
	);
}

export default RiskCriticalApps;
