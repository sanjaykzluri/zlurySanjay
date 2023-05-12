import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./OverviewDepartment.css";
import { Loader } from "../../../common/Loader/Loader";
import overview1 from "../../../assets/applications/overview1.svg";
import overview2 from "../../../assets/applications/overview2.svg";
import overview6 from "../../../assets/departments/overview6.svg";
import trendUp from "../../../assets/departments/trend-up.svg";
import { useHistory, useLocation } from "react-router-dom";
import { allowScroll, preventScroll } from "../../../actions/ui-action";
import uparrow from "../../Overview/uparrow.svg";
import emptyUsage from "../../../assets/emptyUsage.png";
import downarrow from "../../../assets/downarrow.svg";
import { TableNew2 } from "./TableNew2";
import { TableNew3 } from "./TableNew3";
import emptySpendTrend from "../../../components/Overview/spendEmpty.png";
import noData from "../../../components/Overview/noData.svg";
import {
	ResponsiveContainer,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
} from "recharts";
import ContentLoader from "react-content-loader";
import {
	getDepartmentSpendGraphData,
	updateDepartment,
	getDepartmentUsageGraphData,
	patchDepartments,
} from "../../../services/api/departments";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { EditDepartment } from "../EditDepartment";
import { ChangeOwner } from "../../Applications/Overview/ChangeOwner";
import { ChangeBudget } from "./ChangeBudget";
import dayjs from "dayjs";
import { NameBadge } from "../../../common/NameBadge";
import { NotesList } from "../../Notes/NotesList";
import { CustomFieldSectionInOverview } from "../../../modules/shared/containers/CustomFieldSectionInOverview/CustomFieldSectionInOverview";
import { CUSTOM_FIELD_ENTITY } from "../../../modules/custom-fields/constants/constant";
import { kFormatter } from "../../../constants/currency";
import { CustomTooltip } from "../../Overview/NewGraph";
import RoleContext from "../../../services/roleContext/roleContext";
import { monthIdNameMap } from "../../Overview/util";
import { departmentConstants } from "../../../constants";
import {
	fetchAllDepartments,
	fetchDepartmentInfo,
} from "../../../actions/departments-action";
import noRecommendations from "../../../assets/noRecommendations.svg";
import { MONTH } from "../../../utils/DateUtility";
import { OverlayTrigger, Tooltip as BootstrapTooltip } from "react-bootstrap";

export function OverviewDepartment(props) {
	const [editVisible, setEditVisible] = useState(false);
	const { department } = props;
	const dispatch = useDispatch();
	const location = useLocation();
	const id = location.pathname.split("/")[2];
	const longTimeFormat = new Intl.DateTimeFormat("en", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
	const [spendData, setSpendData] = useState([]);
	const [spendDataKeys, setSpendDataKeys] = useState([]);
	const [spendTable, setspendTable] = useState([]);
	const [usageData, setUsageData] = useState([]);
	const [usageDataKeys, setUsageDataKeys] = useState([]);
	const [usageTable, setusageTable] = useState([]);
	const [spendloading, setSpendLoading] = useState(true);
	const [usageLoading, setUsageLoading] = useState(true);
	const [deptFormErrors, setDeptFormErrors] = useState([]);
	const [deptSubmitInProgress, setDeptSubmitState] = useState(false);
	const [avgUsage, setAvgUsage] = useState();
	const [currentMonthAvgUsage, setCurrentMonthAvgUsage] = useState(0);
	const history = useHistory();
	const userInfo = useSelector((state) => state.userInfo);
	const orgId = userInfo?.org_id;
	const orgName = userInfo?.org_name;
	const [invalidBudget, setInvalidBudget] = useState(false);
	useEffect(() => {
		//Segment Implementation
		if (props.department && Object.keys(props.department) > 0) {
			window.analytics.page("Departments", "Department-Overview", {
				department_name: props.department.department_name,
				department_id: props.department.department_id,
				orgId: orgId || "",
				orgName: orgName || "",
			});
		}
	}, []);

	const { isViewer, partner } = useContext(RoleContext);

	useEffect(() => {
		const start_month = userInfo?.org_fy_start_month || 4;
		const end_month = dayjs().month() + 1;
		const end_year = dayjs().year();
		const start_year = start_month > end_month ? end_year - 1 : end_year;

		getDepartmentSpendGraphData(
			id,
			start_month,
			end_month,
			start_year,
			end_year
		).then((res) => {
			setSpendLoading(false);
			const color = [
				"#2266E2",
				"#FF6767",
				"#5CAF53",
				"#FFB169",
				"#6967E0",
				"#717171",
			];
			const data = res.spend_trend;
			let data2 = res.spend_table_data;
			if (data && data.length != 0) {
				let datakeys = [];
				data.forEach((el) => {
					el.month_name = monthIdNameMap[el.month_id];

					el.applications.forEach((item) => {
						datakeys.push(item.application_name);
						el[item.application_name] = item.application_spend;
						el["Total"] = item.monthly_total;
					});
				});
				const uniq = [...new Set(datakeys)];

				uniq.sort((a, b) => (a > b ? 1 : -1));

				let obj = uniq.find((x) => x === "Total");
				let index = uniq.indexOf(obj);
				uniq.splice(index, 1);
				uniq.push(obj);
				let newuniq = new Array(uniq.length);
				for (var i = 0; i < uniq.length; i++) {
					newuniq[i] = [uniq[i], null];
				}
				for (var i = 0; i < newuniq.length; i++) {
					let obj3 = data2.find(
						(x) =>
							x?.application_name?.toLowerCase() ===
							newuniq[i][0]?.toLowerCase()
					);
					newuniq[i][2] = obj3?.total_spend;
				}
				newuniq.sort(function (a, b) {
					return b[2] - a[2];
				});
				let obj4 = newuniq.find((x) => x[0]?.toLowerCase() === "total");
				let index4 = newuniq.indexOf(obj4);
				newuniq.splice(index4, 1);
				newuniq.unshift(obj4);
				if (newuniq.length > 6) {
					newuniq.length = 6;
				}
				if (newuniq.length > 0 && newuniq[0] != undefined) {
					color.length = newuniq.length;
					for (var j = 0; j < newuniq.length; j++) {
						newuniq[j] = [
							newuniq[j][0],
							color[Math.abs(color.length - newuniq.length - j)],
							newuniq[j][2],
						];
					}
				}
				data2.sort(function (a, b) {
					return b.total_spend - a.total_spend;
				});
				if (data2.length > 6) {
					data2.length = 6;
				}
				color.length = data2.length;
				color.length = data2.length;
				var newArray = [];
				if (data2[0].application_name != "TOTAL") {
					for (var j = 0; j < data2.length; j++) {
						if (data2[j].application_name == "TOTAL") {
							newArray.unshift(data2[j]);
						} else {
							newArray.push(data2[j]);
						}
					}
					data2 = newArray;
				}
				for (var j = 0; j < data2.length; j++) {
					data2[j].color =
						color[Math.abs(color.length - data2.length - j)];
				}
				setSpendDataKeys(newuniq);
				data.sort(
					(a, b) => a.year_id - b.year_id || a.month_id - b.month_id
				);
				setSpendData(data);
				setspendTable(data2);
			}
		});

		getDepartmentUsageGraphData(
			id,
			start_month,
			end_month,
			start_year,
			end_year
		).then((res) => {
			setUsageLoading(false);
			const color = [
				"#2266E2",
				"#FF6767",
				"#5CAF53",
				"#FFB169",
				"#6967E0",
				"#717171",
			];
			let data;
			let data2;
			if (!res.error) {
				if (res.usage_trend.length > 0) {
					data = res.usage_trend;
				}

				if (res?.usage_table_data?.length > 0) {
					data2 = res.usage_table_data;
				}

				if (res?.avg_usage) {
					setAvgUsage(Number.parseInt(res.avg_usage).toFixed(0));
					setCurrentMonthAvgUsage(res.change_in_usage || 0);
				}
			}

			if (data && data2) {
				let datakeys = [];
				data.forEach((el) => {
					el.month_name = monthIdNameMap[el.month_id];

					el.applications.forEach((item) => {
						datakeys.push(item.application_name);
						el[item.application_name] = item.application_usage;
						el["Total"] = item.monthly_avg;
					});
				});
				const uniq = [...new Set(datakeys)];

				uniq.sort((a, b) => (a > b ? 1 : -1));

				let obj = uniq.find((x) => x === "Total");
				let index = uniq.indexOf(obj);
				uniq.splice(index, 1);
				uniq.push(obj);
				let newuniq = new Array(uniq.length);
				for (var i = 0; i < uniq.length; i++) {
					newuniq[i] = [uniq[i], null];
				}
				for (var i = 0; i < newuniq.length; i++) {
					let obj3 = data2.find(
						(x) =>
							x?.application_name?.toLowerCase() ===
							newuniq[i][0]?.toLowerCase()
					);
					newuniq[i][2] = obj3?.total_usage || obj3?.average_usage;
				}
				newuniq.sort(function (a, b) {
					return b[2] - a[2];
				});
				let obj4 = newuniq.find((x) => x[0]?.toLowerCase() === "total");
				let index4 = newuniq.indexOf(obj4);
				newuniq.splice(index4, 1);
				newuniq.unshift(obj4);
				if (newuniq.length > 6) {
					newuniq.length = 6;
				}

				for (var i = 0; i < newuniq.length; i++) {
					newuniq[i] = [newuniq[i][0], color[i], newuniq[i][2]];
				}
				data2.sort((a, b) =>
					a.application_name > b.application_name ? 1 : -1
				);
				data2.sort(function (a, b) {
					return b.total_usage - a.total_usage;
				});
				let obj2 = data2.find((x) => x.application_name === "TOTAL");
				let index2 = data2.indexOf(obj2);
				data2.splice(index2, 1);
				data2.unshift(obj2);
				if (data2.length > 6) {
					data2.length = 6;
				}
				color.length = data2.length;
				var newArray = [];
				if (data2[0].application_name != "TOTAL") {
					for (var j = 0; j < data2.length; j++) {
						if (data2[j].application_name == "TOTAL") {
							newArray.unshift(data2[j]);
						} else {
							newArray.push(data2[j]);
						}
					}
					data2 = newArray;
				}
				for (var j = 0; j < data2.length; j++) {
					data2[j].color =
						color[Math.abs(color.length - data2.length - j)];
				}
				setUsageDataKeys(newuniq);
				data.sort(
					(a, b) => a.year_id - b.year_id || a.month_id - b.month_id
				);
				setUsageData(data);
				setusageTable(data2);
			}
		});
	}, []);

	const onEditClose = () => {
		dispatch(allowScroll());
		setEditVisible(false);
		setDeptFormErrors([]);
	};

	const handleDepEdit = (department) => {
		setDeptSubmitState(true);
		updateDepartment(department.department_id, department)
			.then(() => {
				props.onDepartmentChange();
				setDeptSubmitState(false);
				setDeptFormErrors([]);
				onEditClose();
			})
			.catch((err) => {
				console.error("Error while updating department info:", err);

				setDeptSubmitState(false);
				if (err.response && err.response.data) {
					setDeptFormErrors(err.response.data.errors);
				}
			});
	};

	const getHeadProfileImage = () => {
		const head = department.department_head;
		if (!head) {
			return (
				<NameBadge
					name={head.user_name}
					borderRadius={50}
					width={40}
				></NameBadge>
			);
		}
		if (head.user_profile_img && head.user_profile_img !== "") {
			return (
				<img
					style={{
						height: "26px",
						width: "26px",
						borderRadius: "50%",
					}}
					alt={head.user_name}
					src={head.user_profile_img}
				/>
			);
		} else {
			return (
				<NameBadge
					name={head.user_name}
					borderRadius={50}
					width={40}
				></NameBadge>
			);
		}
	};

	const getDepartmentLogo = () => {
		const logo = department.logo;
		if (!logo) {
			return (
				<NameBadge
					style={{ paddingTop: "10%" }}
					name={department.department_name}
					borderRadius={50}
					width={40}
				></NameBadge>
			);
		}
		if (logo && logo !== "") {
			return (
				<img
					style={{
						height: "72px",
						width: "72px",
						borderRadius: "50%",
					}}
					alt={department.department_name}
					src={department.logo}
				/>
			);
		} else {
			return (
				<NameBadge
					name={department.department_name}
					borderRadius={50}
					width={40}
				></NameBadge>
			);
		}
	};

	const color = [
		"#2266E2",
		"#FF6767",
		"#5CAF53",
		"#FFB169",
		"#6967E0",
		"#717171",
	];

	const refreshDepartmentsStore = () => {
		dispatch({
			type: departmentConstants.DELETE_DEPARTMENTS_CACHE,
		});
		dispatch(fetchDepartmentInfo(id));
		dispatch(fetchAllDepartments(0));
	};
	const clickedOnEdit = () => {
		//Segment Implementation
		window.analytics.track(
			"Clicked on Edit Department",
			{
				currentCategory: "Departments",
				currentPageName: "Department-Overview",
				app_name: props.application?.app_name,
				app_id: props.application?.app_id,
				orgId: orgId || "",
				orgName: orgName || "",
			},
			true
		);
		dispatch(preventScroll());
		setEditVisible(true);
	};

	return (
		<>
			{department ? (
				<div>
					<div className="overview__container">
						<div className="overview__top">
							<div className="overview__topleft">
								<div className="overview__logo d-flex">
									{getDepartmentLogo()}
								</div>
								<div
									className="overview__logodata"
									style={{ marginLeft: "16px" }}
								>
									<div className="overview__logodata1">
										<OverlayTrigger
											placement="top"
											overlay={
												<BootstrapTooltip>
													{department &&
													department.dept_name_path
														? department.dept_name_path
														: ""}

													{/* {department?.department_path || ''} */}
												</BootstrapTooltip>
											}
										>
											<div className="truncate_overview_department_name">
												{department &&
												department.dept_name_path
													? department.dept_name_path
													: ""}
												{/* {department?.department_path || ''} */}
											</div>
										</OverlayTrigger>
									</div>
									{/* <div className="overview__logodata2">
                  Graphic design and video software
                </div> */}
								</div>
							</div>
							<div className="overview__topright">
								{!isViewer && (
									<div>
										<button
											type="submit"
											className="overview__editbutton"
											onClick={clickedOnEdit}
										>
											<span id="overview__text1">
												Edit
											</span>
										</button>
										{editVisible && (
											<EditDepartment
												department={department}
												handleSubmit={handleDepEdit}
												isOpen={editVisible}
												submitInProgress={
													deptSubmitInProgress
												}
												handleClose={onEditClose}
												validationErrors={
													deptFormErrors
												}
											/>
										)}
									</div>
								)}
								<div hidden>
									<button
										type="sumbit"
										className="overview__logsbutton"
									></button>
								</div>
							</div>
						</div>
						<hr
							style={{
								marginLeft: "40px",
								marginRight: "40px",
								marginTop: "0px",
								marginBottom: "0px",
							}}
						/>
						<div className="overview__top__next">
							<div
								className="overview__top__next__ins"
								style={{ flexBasis: "24%" }}
							>
								<div className="overview__top__next__ins1">
									Active Users
								</div>
								<div className="overview__top__next__ins2">
									<div>
										<img src={overview1} />
									</div>
									<div className="overview__top__next__instext">
										{department
											? department.department_users
													?.users_count
												? department.department_users
														?.users_count
												: 0
											: 0}
									</div>
									<div className="overview__top__next__instext2">
										<img
											src={trendUp}
											style={{ marginRight: 4 }}
										/>
										{department.department_users?.change} in{" "}
										{
											MONTH[
												department.department_users
													?.month_id - 1
											]
										}
									</div>
								</div>
							</div>
							<div
								className="overview__top__next__ins"
								style={{ flexBasis: "27%" }}
							>
								<div className="overview__top__next__ins1">
									Applications
								</div>
								<div className="overview__top__next__ins2">
									<div>
										<img src={overview6} />
									</div>
									<div className="overview__top__next__instext">
										{department
											? department.department_apps
													?.apps_count
											: 0}
									</div>
									<div className="overview__top__next__instext2">
										<img
											style={{ marginRight: 4 }}
											src={
												department.department_apps
													?.change >= 0
													? uparrow
													: downarrow
											}
										/>
										{Math.abs(
											department.department_apps
												?.change || 0
										)}{" "}
										in{" "}
										{
											MONTH[
												department.department_apps
													?.month_id - 1
											]
										}
									</div>
								</div>
							</div>
							<div
								className="overview__top__next__ins"
								style={{
									flexBasis: "27%",
									marginRight: "10px",
									marginLeft: "10px",
								}}
							>
								<div className="overview__top__next__ins1">
									Avg. Monthly Spend
								</div>
								<div className="overview__top__next__ins2">
									<div style={{ marginTop: "4px" }}>
										<img src={overview2} />
									</div>
									<div className="overview__top__next__instext">
										{kFormatter(
											parseInt(
												(
													department
														?.department_avg_monthly_spend
														?.avg_monthly_spend || 0
												).toFixed(0)
											)
										)}
									</div>
									<div></div>
									<div
										className="overview__top__next__instext2"
										style={{ whiteSpace: "nowrap" }}
									>
										<img
											style={{ marginRight: 4 }}
											src={
												department
													.department_avg_monthly_spend
													?.change >= 0
													? uparrow
													: downarrow
											}
										/>
										{kFormatter(
											Math.abs(
												(
													department
														.department_avg_monthly_spend
														?.change || 0
												).toFixed(0)
											)
										)}{" "}
										in{" "}
										{
											MONTH[
												department
													.department_avg_monthly_spend
													?.month_id - 1
											]
										}
									</div>
								</div>
							</div>
							<div
								className="overview__top__next__ins"
								style={{ flexBasis: "24%" }}
							>
								<div className="overview__top__next__ins1">
									Avg. Monthly Cost
								</div>
								<div className="overview__top__next__ins2">
									<div style={{ marginTop: "4px" }}>
										<img src={overview2} />
									</div>
									<div className="overview__top__next__instext">
										{kFormatter(
											parseFloat(
												(
													department
														?.department_avg_monthly_cost
														?.avg_monthly_cost || 0
												).toFixed(2)
											)
										)}
									</div>
									<div></div>
									<div className="overview__top__next__instext2">
										<img
											style={{ marginRight: 4 }}
											src={
												department
													.department_avg_monthly_cost
													?.change >= 0
													? uparrow
													: downarrow
											}
										/>
										{kFormatter(
											Math.abs(
												(
													department
														.department_avg_monthly_cost
														?.change || 0
												).toFixed(0)
											)
										)}{" "}
										in{" "}
										{
											MONTH[
												department
													.department_avg_monthly_cost
													?.month_id - 1
											]
										}
									</div>
								</div>
							</div>
							<div
								className="overview__top__next__ins"
								style={{ flexBasis: "20%" }}
							>
								<div className="overview__top__next__ins1">
									Budget
								</div>
								<div className="overview__top__next__ins2">
									<div>
										<CircularProgressbar
											styles={buildStyles({
												pathColor: "#2266E2",
												strokeLinecap: "butt",
											})}
											strokeWidth={16}
											value={
												department.department_budget_used
											}
											maxValue={
												department.department_budget_total
											}
										/>
									</div>
									<ChangeBudget
										budgetUsed={
											department.department_budget_used ||
											0
										}
										totalBudget={
											department.department_budget_total ||
											0
										}
										kFormatter={kFormatter}
										department_id={department.department_id}
										invalid={invalidBudget}
										setInvalid={setInvalidBudget}
										min_budget={
											department.department_minimum_budget
										}
									/>
								</div>
								{invalidBudget && (
									<div className="overview__dept-budget__invalid-text">
										Budget can not be smaller than the sum
										of budget of child departments
									</div>
								)}
							</div>
						</div>
						<hr
							style={{
								marginLeft: "40px",
								marginRight: "40px",
								marginTop: "0px",
								marginBottom: "0px",
							}}
						/>
					</div>
					<div className="overview__middle" style={{ minHeight: 0 }}>
						<div
							className="overview__middle__left"
							style={{ marginTop: "28px" }}
						>
							<div className="overview__middle__left__top">
								<div
									className="overview__middle__topcont"
									style={{ flexBasis: "30%" }}
								>
									<div className="overview__middle__topconttext">
										Head
									</div>

									<ChangeOwner
										fieldName="head"
										updateFunc={patchDepartments}
										refreshReduxState={() => {
											props.onDepartmentChange();
											refreshDepartmentsStore();
										}}
										idFromTable={department.department_id}
										userId={
											department.department_head?.user_id
										}
										userName={
											department.department_head
												?.user_name
										}
										userImage={
											department.department_head
												?.user_profile_img
										}
										userAccountType={
											department.department_head
												?.user_account_type
										}
									/>
								</div>
								<div
									className="overview__middle__topcont"
									style={{ flexBasis: "25%" }}
								>
									<div className="overview__middle__topconttext">
										Budget Spend
									</div>
									<div
										style={{ marginBottom: "25px" }}
										className="overview__middle__topconttext2"
									>
										{kFormatter(
											Math.abs(
												department?.department_average_budget_spend?.[0]?.average_spend?.toFixed(
													0
												) || 0
											)
										)}
									</div>
								</div>
								<div
									className="overview__middle__topcont"
									style={{ flexBasis: "20%" }}
								>
									<div className="overview__middle__topconttext">
										Dept Added on
									</div>
									<div
										style={{ marginBottom: "25px" }}
										className="overview__middle__topconttext2"
									>
										{department.department_added_on
											? longTimeFormat.format(
													new Date(
														department.department_added_on
													)
											  )
											: "-"}
									</div>
								</div>
								<div
									className="overview__middle__topcont"
									style={{ flexBasis: "20%" }}
								>
									<div className="overview__middle__topconttext">
										Budget Remaining
									</div>
									<div
										style={{ marginBottom: "25px" }}
										className="overview__middle__topconttext2"
									>
										{kFormatter(
											parseInt(
												(isNaN(
													department.department_budget_remaining
												)
													? 0
													: department.department_budget_remaining
												)?.toFixed(0)
											)
										)}
									</div>
								</div>
							</div>
							<div className="d-flex flex-column">
								<hr />
								<CustomFieldSectionInOverview
									customFieldData={
										department.department_custom_fields ||
										[]
									}
									entityId={department.department_id}
									cfEntitiy={CUSTOM_FIELD_ENTITY.DEPARTMENTS}
									patchAPI={patchDepartments}
									refresh={props.onDepartmentChange}
								/>
								<hr />
							</div>
							<NotesList
								className="mt-4"
								notes={department.department_notes}
								entity={{
									id: department.department_id,
									name: department.department_name,
									image: department.department_logo,
									type: "department",
								}}
							/>
						</div>
						<div
							className="overview__middle__right"
							style={{
								marginTop: "28px",
								width: "25%",
								wordBreak: "break-word",
							}}
						>
							<div className="overview__middle__right__top">
								{`${partner?.name} Recommends`}
							</div>
							<div className="overview_no_recommendations">
								<img
									src={noRecommendations}
									width={125}
									height={70}
								/>
								<div className="text-align-center o-6 truncate-department-name">
									There are no recommendations for{" "}
									{department.department_name}
								</div>
								<div className="text-capitalize o-6"></div>
							</div>
							{/* <div className="overview__middle__right__bottom">
								<img
									src={emptyrecomm}
									style={{ marginTop: "40px" }}
								></img>
								<div
									className="empty__recomm__d1"
									style={{ marginLeft: "40px" }}
								>
									You're all caught up!
								</div>
								<div
									className="empty__recomm__d2"
									style={{ marginLeft: "40px" }}
								>
									There are no recommendations
								</div>
							</div> */}
						</div>
					</div>
					<div className="overview__bottom">
						<div
							className="overview__bottom__up"
							style={{ margin: "12px 0px" }}
						>
							<div>App wise Spend</div>
							{spendloading ? (
								<div className="allapps__spendgraph">
									<div
										style={{
											height: "100%",
											width: "100%",
											display: "flex",
											flexDirection: "row",
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										<Loader
											height={100}
											width={100}
										></Loader>
									</div>
								</div>
							) : (
								<>
									{spendData.length != 0 ? (
										<div
											style={{
												marginTop: "16px",
												padding: "20px 0px",
											}}
											className="allapps__spendgraph"
										>
											<div className="allapps__spendgraph__d1">
												<ResponsiveContainer width="98%">
													<AreaChart
														data={spendData}
														margin={{
															top: 22,
															right: 0,
															left: 0,
															bottom: 0,
														}}
													>
														<CartesianGrid strokeDasharray="3 3" />
														<XAxis
															dataKey="month_name"
															tick={{
																fontSize: 10,
																color: "#717171",
															}}
															tickLine={false}
															axisLine={false}
														/>
														<YAxis
															tick={{
																fontSize: 10,
																color: "#717171",
																marginLeft: 1,
															}}
															tickFormatter={(
																tick
															) =>
																kFormatter(tick)
															}
															tickLine={false}
															axisLine={false}
															interval={0}
															width={60}
															domain={[0, "auto"]}
														/>
														<Tooltip
															content={
																<CustomTooltip
																	formatter={(
																		value
																	) =>
																		kFormatter(
																			value
																		)
																	}
																/>
															}
															wrapperStyle={{
																backgroundColor:
																	"white",
															}}
														/>
														{spendDataKeys.map(
															(
																dataKey,
																index
															) => (
																<Area
																	key={
																		dataKey[0]
																	}
																	type="monotone"
																	dataKey={
																		dataKey[0]
																	}
																	stackId={
																		dataKey[0]
																	}
																	stroke={
																		dataKey[1]
																	}
																	connectNulls={
																		false
																	}
																	strokeWidth={
																		2
																	}
																	fill={`${dataKey[1]}4D`}
																	dot={{
																		stroke: dataKey[1],
																		fill: "white",
																		r: 4,
																	}}
																	activeDot={{
																		fill: dataKey[1],
																		stroke: dataKey[1],
																		r: 6,
																	}}
																/>
															)
														)}
													</AreaChart>
												</ResponsiveContainer>

												<div
													className="ov__d5__d2__d1__d1"
													style={{
														top: "45px",
														left: "64px",
													}}
												>
													<div className="ov__d5__d2__d1__d1__d1">
														<div className="ov__d5__d2__d1__d1__d1__d1">
															{kFormatter(
																department
																	?.department_avg_monthly_spend
																	?.avg_monthly_spend ||
																	0
															)}
														</div>
														<img
															className="overviewins__top__next__insimage"
															src={
																department
																	.department_avg_monthly_spend
																	?.change >=
																0
																	? uparrow
																	: downarrow
															}
														/>
														<div className="ov__d5__d2__d1__d1__d1__d2">
															{kFormatter(
																Math.abs(
																	department.department_avg_monthly_spend?.change.toFixed(
																		0
																	)
																)
															)}
														</div>
														<div className="ov__d5__d2__d1__d1__d1__d3">
															in{" "}
															{
																MONTH[
																	department
																		.department_apps
																		?.month_id -
																		1
																]
															}
														</div>
													</div>
													<div className="ov__d5__d2__d1__d1__d2">
														Avg. Monthly Spend
													</div>
												</div>
												{/* <div className="ov__d5__d2__selectdiv">
														<select>
															<option selected>
																{" "}
																Department{" "}
															</option>
															<option>Category</option>
														</select>
													</div> */}
											</div>
											<div className="allapps__spendgraph__d2">
												<TableNew2
													data={spendTable}
												></TableNew2>
											</div>
										</div>
									) : (
										<div
											style={{
												backgroundImage: `url(${emptySpendTrend})`,
												height: "306px",
												marginTop: "16px",
											}}
											className="d-flex flex-column justify-content-center align-items-center allapps__spendgraph"
										>
											<div className="d-flex flex-column justify-content-center align-items-center m-auto">
												<img
													src={noData}
													className="m-auto"
												/>
												<span className="empty-header">
													No Data Available
												</span>
												<span className="empty-lower">
													Add spend data for this app
												</span>
												<button
													type="button"
													className="btn btn-outline-primary emptyDocButton"
													style={{
														width: "max-content",
														marginTop: "5px",
													}}
													onClick={() =>
														history.push(
															"/transactions#recognised"
														)
													}
												>
													<img
														style={{
															paddingRight: "5px",
														}}
													/>
													Add transactions
												</button>
											</div>
										</div>
									)}
								</>
							)}
						</div>
						<div
							className="overview__bottom__down"
							style={{ margin: "12px 0px" }}
						>
							<div>App wise Usage</div>
							{usageLoading ? (
								<div className="allapps__spendgraph">
									<div
										style={{
											height: "100%",
											width: "100%",
											display: "flex",
											flexDirection: "row",
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										<Loader
											height={100}
											width={100}
										></Loader>
									</div>
								</div>
							) : usageData.length != 0 ? (
								<div
									style={{
										marginTop: "16px",
										padding: "20px 0px",
									}}
									className="allapps__spendgraph"
								>
									<div className="allapps__spendgraph__d1">
										<ResponsiveContainer width="98%">
											<AreaChart
												data={usageData}
												margin={{
													top: 22,
													right: 0,
													left: 0,
													bottom: 0,
												}}
											>
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis
													dataKey="month_name"
													tick={{
														fontSize: 10,
														color: "#717171",
													}}
													tickLine={false}
													axisLine={false}
												/>
												<YAxis
													tick={{
														fontSize: 10,
														color: "#717171",
														marginLeft: 1,
													}}
													tickFormatter={(tick) =>
														Number(
															tick.toFixed(1)
														) + "%"
													}
													tickLine={false}
													axisLine={false}
													interval={0}
													domain={[
														0,
														(dataMax) => 100,
													]}
												/>
												<Tooltip
													content={
														<CustomTooltip
															formatter={(
																value
															) =>
																Number(
																	value.toFixed(
																		1
																	)
																) + "%"
															}
														/>
													}
													wrapperStyle={{
														backgroundColor:
															"white",
													}}
												/>
												{usageDataKeys.map(
													(dataKey, index) => (
														<Area
															key={dataKey[0]}
															type="monotone"
															dataKey={dataKey[0]}
															stackId={dataKey[0]}
															stroke={dataKey[1]}
															connectNulls={false}
															strokeWidth={2}
															fill={`${dataKey[1]}4D`}
															dot={{
																stroke: dataKey[1],
																fill: "white",
																r: 4,
															}}
															activeDot={{
																fill: dataKey[1],
																stroke: dataKey[1],
																r: 6,
															}}
														/>
													)
												)}
											</AreaChart>
										</ResponsiveContainer>
										<div
											className="ov__d5__d2__d1__d1"
											style={{
												top: "45px",
												left: "64px",
											}}
										>
											<div className="ov__d5__d2__d1__d1__d1">
												<div className="ov__d5__d2__d1__d1__d1__d1">
													{avgUsage}%
												</div>
												<img
													className="overviewins__top__next__insimage"
													src={
														currentMonthAvgUsage > 0
															? uparrow
															: downarrow
													}
												/>
												<div className="ov__d5__d2__d1__d1__d1__d2">
													{Number(
														Math.abs(
															currentMonthAvgUsage.toFixed(
																1
															)
														)
													)}
													%
												</div>
												<div className="ov__d5__d2__d1__d1__d1__d3">
													in{" "}
													{
														MONTH[
															department
																.department_apps
																?.month_id - 1
														]
													}
												</div>
											</div>
											<div className="ov__d5__d2__d1__d1__d2">
												Avg. Usage
											</div>
										</div>
										{/* <div className="ov__d5__d2__selectdiv">
										<select>
											<option selected>
												{" "}
												Department{" "}
											</option>
											<option>Category</option>
										</select>
									</div> */}
									</div>
									<div className="allapps__spendgraph__d2">
										<TableNew3 data={usageTable} />
									</div>
								</div>
							) : (
								<div
									style={{
										backgroundImage: `url(${emptyUsage})`,
										height: "306px",
										marginTop: "16px",
									}}
									className="d-flex flex-column justify-content-center align-items-center allapps__spendgraph"
								>
									<div className="d-flex flex-column justify-content-center align-items-center m-auto">
										<img src={noData} className="m-auto" />
										<span className="empty-header">
											No Data Available
										</span>
										<span className="empty-lower">
											Add usage data for this app
										</span>
										<button
											type="button"
											className="btn btn-outline-primary emptyDocButton"
											style={{
												width: "max-content",
												marginTop: "5px",
											}}
											onClick={() =>
												history.push(
													"/transactions#recognised"
												)
											}
										>
											<img
												style={{ paddingRight: "5px" }}
											/>
											Add transactions
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			) : (
				<div>
					<div className="overview__container">
						<div className="overview__top">
							<div className="overview__topleft">
								<div className="overview__logo">
									<ContentLoader width={72} height={72}>
										<rect
											rx="36"
											width={72}
											height={72}
											fill="#EBEBEB"
										/>
									</ContentLoader>
								</div>
								<div
									className="overview__logodata"
									style={{ marginLeft: "16px" }}
								>
									<ContentLoader
										width={215}
										height={21}
										className="overview__logodata1"
									>
										<rect
											width="215"
											height="21"
											rx="4"
											fill="#EBEBEB"
										/>
									</ContentLoader>
									{/* <div className="overview__logodata2">
                  Graphic design and video software
                </div> */}
								</div>
							</div>
						</div>
						<hr
							style={{
								marginLeft: "40px",
								marginRight: "40px",
								marginTop: "0px",
								marginBottom: "0px",
							}}
						/>
						<div className="overview__top__next">
							<div
								className="overview__top__next__ins"
								style={{ flexBasis: "24%" }}
							>
								<div className="overview__top__next__ins1">
									<ContentLoader width={76} height={9}>
										<rect
											width="76"
											height="9"
											rx="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								</div>
								<div className="overview__top__next__ins2">
									<ContentLoader
										style={{ marginRight: 8 }}
										width={28}
										height={28}
										viewBox="0 0 28 28"
									>
										<circle
											cx="14"
											cy="14"
											r="14"
											fill="#EBEBEB"
										/>
									</ContentLoader>
									<div className="overview__top__next__instext2">
										<ContentLoader
											width={65}
											height={18}
											viewBox="0 0 65 18"
										>
											<rect
												width="65"
												height="18"
												rx="4"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								</div>
							</div>
							<div
								className="overview__top__next__ins"
								style={{ flexBasis: "27%" }}
							>
								<div className="overview__top__next__ins1">
									<ContentLoader width={76} height={9}>
										<rect
											width="76"
											height="9"
											rx="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								</div>
								<div className="overview__top__next__ins2">
									<ContentLoader
										style={{ marginRight: 8 }}
										width={28}
										height={28}
										viewBox="0 0 28 28"
									>
										<circle
											cx="14"
											cy="14"
											r="14"
											fill="#EBEBEB"
										/>
									</ContentLoader>
									<div className="overview__top__next__instext2">
										<ContentLoader
											width={65}
											height={18}
											viewBox="0 0 65 18"
										>
											<rect
												width="65"
												height="18"
												rx="4"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								</div>
							</div>
							<div
								className="overview__top__next__ins"
								style={{ flexBasis: "24%" }}
							>
								<div className="overview__top__next__ins1">
									<ContentLoader width={76} height={9}>
										<rect
											width="76"
											height="9"
											rx="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								</div>
								<div className="overview__top__next__ins2">
									<ContentLoader
										style={{ marginRight: 8 }}
										width={28}
										height={28}
										viewBox="0 0 28 28"
									>
										<circle
											cx="14"
											cy="14"
											r="14"
											fill="#EBEBEB"
										/>
									</ContentLoader>
									<div className="overview__top__next__instext2">
										<ContentLoader
											width={65}
											height={18}
											viewBox="0 0 65 18"
										>
											<rect
												width="65"
												height="18"
												rx="4"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								</div>
							</div>
							<div
								className="overview__top__next__ins"
								style={{ flexBasis: "20%" }}
							>
								<div className="overview__top__next__ins1">
									<ContentLoader width={76} height={9}>
										<rect
											width="76"
											height="9"
											rx="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								</div>
								<div className="overview__top__next__ins2">
									<ContentLoader
										style={{ marginRight: 8 }}
										width={28}
										height={28}
										viewBox="0 0 28 28"
									>
										<circle
											cx="14"
											cy="14"
											r="14"
											fill="#EBEBEB"
										/>
									</ContentLoader>
									<div className="overview__top__next__instext2">
										<ContentLoader
											width={65}
											height={18}
											viewBox="0 0 65 18"
										>
											<rect
												width="65"
												height="18"
												rx="4"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								</div>
							</div>
						</div>
						<hr
							style={{
								marginLeft: "40px",
								marginRight: "40px",
								marginTop: "0px",
								marginBottom: "0px",
							}}
						/>
					</div>
					<div className="overview__middle">
						<div
							className="overview__middle__left"
							style={{ marginTop: "28px" }}
						>
							<div className="overview__middle__left__top">
								<div
									className="overview__middle__topcont"
									style={{ flexBasis: "20%" }}
								>
									<div className="overview__middle__topconttext">
										<ContentLoader width={76} height={9}>
											<rect
												width="76"
												height="9"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
									<div
										style={{ marginBottom: "25px" }}
										className="overview__middle__topconttext2"
									>
										<ContentLoader width={108} height={12}>
											<rect
												width="108"
												height="12"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								</div>
								<div
									className="overview__middle__topcont"
									style={{ flexBasis: "27%" }}
								>
									<div className="overview__middle__topconttext">
										<ContentLoader width={76} height={9}>
											<rect
												width="76"
												height="9"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
									<div
										style={{ marginBottom: "25px" }}
										className="overview__middle__topconttext2"
									>
										<ContentLoader width={108} height={12}>
											<rect
												width="108"
												height="12"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								</div>
								<div
									className="overview__middle__topcont"
									style={{ flexBasis: "25%" }}
								>
									<div className="overview__middle__topconttext">
										<ContentLoader width={76} height={9}>
											<rect
												width="76"
												height="9"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
									<div
										style={{ marginBottom: "25px" }}
										className="overview__middle__topconttext2"
									>
										<ContentLoader width={108} height={12}>
											<rect
												width="108"
												height="12"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								</div>
							</div>
						</div>
						<div
							className="overview__middle__right"
							style={{ marginTop: "28px" }}
						>
							<div className="overview__middle__right__bottom">
								<div className="overview__middle__right__bottom_1">
									<div
										style={{
											paddingTop: 20,
											paddingLeft: 16,
										}}
										className="overview__middle__right__bottom_1left"
									>
										<ContentLoader width={40} height={40}>
											<circle
												cx="20"
												cy="20"
												r="20"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
									<div
										className="overview__middle__right__bottom_1right"
										style={{ marginLeft: "12px" }}
									>
										<div>
											<ContentLoader
												width={209}
												height={16}
											>
												<rect
													width="209"
													height="16"
													rx="4"
													fill="#EBEBEB"
												/>
											</ContentLoader>
										</div>
										<div>
											<ContentLoader
												width={134}
												height={10}
											>
												<rect
													width="134"
													height="10"
													rx="2"
													fill="#EBEBEB"
												/>
											</ContentLoader>
										</div>
										<div>
											<ContentLoader
												width={134}
												height={10}
											>
												<rect
													width="134"
													height="10"
													rx="2"
													fill="#EBEBEB"
												/>
											</ContentLoader>
										</div>
									</div>
								</div>
								<div className="overview__middle__right__bottom_1">
									<div
										style={{
											paddingTop: 20,
											paddingLeft: 16,
										}}
										className="overview__middle__right__bottom_1left"
									>
										<ContentLoader width={40} height={40}>
											<circle
												cx="20"
												cy="20"
												r="20"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
									<div
										className="overview__middle__right__bottom_1right"
										style={{ marginLeft: "12px" }}
									>
										<div>
											<ContentLoader
												width={209}
												height={16}
											>
												<rect
													width="209"
													height="16"
													rx="4"
													fill="#EBEBEB"
												/>
											</ContentLoader>
										</div>
										<div>
											<ContentLoader
												width={134}
												height={10}
											>
												<rect
													width="134"
													height="10"
													rx="2"
													fill="#EBEBEB"
												/>
											</ContentLoader>
										</div>
										<div>
											<ContentLoader
												width={134}
												height={10}
											>
												<rect
													width="134"
													height="10"
													rx="2"
													fill="#EBEBEB"
												/>
											</ContentLoader>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="overview__bottom"></div>
				</div>
			)}
		</>
	);
}
