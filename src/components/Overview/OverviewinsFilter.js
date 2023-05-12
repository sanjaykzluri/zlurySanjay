import React, { useState, useEffect } from "react";
import colors from "../../colors.json";
import downarrow from "../../assets/downarrow.svg";
import info from "../../assets/applications/info.svg";
import emptyrenewal from "./emptyRenewalsNew.svg";
import { Link, useLocation, useHistory } from "react-router-dom";
import "./Overviewins.css";
import { TableNew } from "./TableNew";
import { GraphBarHor } from "./GraphBarHor";
import { GraphBarHorStack } from "./GraphBarHorStack";
import emptySpendTrend from "./spendEmpty.png";
import emptyBudget from "./emptyBudget.png";
import noData from "./noData.svg";
import uparrow from "./uparrow.svg";
import ContentLoader from "react-content-loader";
import { useDispatch, useSelector } from "react-redux";
import {
	fetchTopRow,
	fetchMiniCharts,
	fetchBudget,
	fetchApplications,
	fetchDepartmentSpendData,
	fetchCategorySpendData,
	clearCategorySpendData,
	clearDepartmentSpendData,
} from "../../actions/overview-action";
import { Loader } from "../../common/Loader/Loader";
import refresh from "../../assets/icons/refresh.svg";
import _ from "underscore";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";
import { OverlayTrigger, Tooltip as BootstrapTooltip } from "react-bootstrap";
import UIAreaChart from "./NewGraph";
import dayjs from "dayjs";
import { SelectOld } from "../../UIComponents/SelectOld/Select";
import { kFormatter } from "../../constants/currency";
import Strips from "../../common/restrictions/Strips";
import { monthIdNameMap } from "./util";
import { ENTITIES } from "../../constants";
import { FULL_MONTH } from "../../utils/DateUtility";
import { IntegrationErrorInfo } from "modules/integrations/components/IntegrationErrorInfo";
import rightarrow from "components/Transactions/Recognised/rightarrow.svg";
import leftarrow from "components/Transactions/Recognised/leftarrow.svg";
import { getValueFromLocalStorage } from "utils/localStorage";
import TopRow from "modules/Overview/components/TopRow";

var months = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

var currentDate = new Date();
var currentYear = currentDate.getFullYear();
var currentMonth = currentDate.getMonth();

const graphTitle = {
	category: "Category",
	department: "Department",
};
const graphKeys = {
	CATEGORY: "category",
	DEPARTMENT: "department",
};

const categoryKeyLabelMap = {
	total_apps: "Apps",
	users_count: "Users",
	monthly_spend: "Avg. Monthly Spend",
	total_spend: "Spend(YTD)",
	category_name: "Category",
	total_user_count: "Users",
	monthly_spend: "Avg. Monthly Spend",
};
class CustomTooltip extends React.Component {
	render() {
		const { active, dataKey, dataText } = this.props;
		if (active) {
			const { payload, label } = this.props;
			return (
				<div className="custom-tooltip">
					<div className="custom-tooltip-div1">
						{months?.[
							payload?.[0]?.payload.month_id - 1
						]?.toUpperCase()}{" "}
						{payload?.[0]?.payload.year_id}
					</div>
					<div className="custom-tooltip-div2">
						<span id="custom-tooltip-text1">
							{kFormatter(payload?.[0]?.payload?.[dataKey])}
						</span>
						<span id="custom-tooltip-text2">{dataText}</span>
					</div>
				</div>
			);
		}

		return null;
	}
}

class Table2 extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			color: colors.Colors,
			pageNo: 1, // 1-indexed
			itemsPerPage: 5,
		};
		this.callSegment = this.callSegment.bind(this);
		this.boldTotalData = this.boldTotalData.bind(this);
	}

	componentDidUpdate(prevProps) {
		// force the initial state on selection change (Department/Category)
		if (this.props.selectedGraph !== prevProps.selectedGraph)
			this.setState({
				pageNo: 1,
				itemsPerPage: 5,
			});
	}

	nPages() {
		if (!this.props.data?.length > 0) return 0;
		return Math.ceil(this.props.data.length / this.state.itemsPerPage);
	}

	callSegment(id, name) {
		window.analytics.track("Clicked on Department wise Spend Table", {
			department_id: id,
			department_name: name,
			orgId: this.props?.userInfo?.org_id || "",
			orgName: this.props?.userInfo?.org_name || "",
		});
	}

	changePageTo(to) {
		this.setState({
			pageNo: Math.min(this.nPages(), Math.max(1, to)),
		});
	}

	infoSection(nItems) {
		const handleSelectChange = (e) => {
			this.setState({ pageNo: 1, itemsPerPage: Number(e.target.value) });
		};

		return (
			<div className="overviewins__filter__info__section">
				<b>
					Showing {nItems - 1}{" "}
					{this.props.selectedGraph === graphKeys.DEPARTMENT
						? nItems === 1
							? "department"
							: "departments"
						: nItems === 1
						? "category"
						: "categories"}
				</b>
				<div className="overviewins__filter__page__control">
					Items per page:{" "}
					<select
						value={this.state.itemsPerPage}
						onChange={handleSelectChange}
					>
						<option value={5}>5</option>
						<option value={10}>10</option>
						<option value={20}>20</option>
						<option value={nItems}>all</option>
					</select>
					<div className="overviewins__filter__page__control">
						<div
							hidden={this.state.pageNo === 1}
							onClick={() =>
								this.changePageTo(this.state.pageNo - 1)
							}
							className="overviewins__filter__arrow cursor-pointer"
						>
							<img src={leftarrow} alt="Prev" />
						</div>
						Page {this.state.pageNo} of {this.nPages()}
						<div
							hidden={this.state.pageNo === this.nPages()}
							onClick={() =>
								this.changePageTo(this.state.pageNo + 1)
							}
							className="overviewins__filter__arrow cursor-pointer"
						>
							<img src={rightarrow} alt="Next" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	renderTableHeader() {
		if (!this.props.data[0]) return;
		let header = Object.keys(this.props.data[0]).map((key) => key);
		header.unshift("");
		return header.map((key, index) => {
			if (key === "department_name") {
				return <th key={index}>Department </th>;
			} else if (key === "apps_count") {
				return <th key={index}>Apps </th>;
			} else if (key === "users_count") {
				return <th key={index}>Users </th>;
			} else if (key === "monthly_spend") {
				return <th key={index}>Avg. Monthly Spend </th>;
			} else if (key === "total_spend") {
				return <th key={index}>Spend(YTD) </th>;
			} else if (key === "category_name") {
				return <th key={index}>Category </th>;
			} else if (key === "total_apps") {
				return <th key={index}>Apps </th>;
			} else if (key === "users_count") {
				return <th key={index}>Users </th>;
			} else if (key === "monthly_spend") {
				return <th key={index}>Avg. Monthly Spend </th>;
			} else if (key === "total_spend") {
				return <th key={index}>Spend(YTD) </th>;
			} else {
				return <th key={index}>{key}</th>;
			}
		});
	}

	renderCategoryTableHeader() {
		if (!this.props.data[0]) return;
		const categoryHeaderSortOrder = [
			"category_name",
			"total_apps",
			"total_user_count",
			"monthly_spend",
			"total_spend",
		];
		let header = Object.keys(this.props.data[0])
			.map((key) => key)
			.sort(
				(a, b) =>
					categoryHeaderSortOrder.findIndex((val) => a === val) -
					categoryHeaderSortOrder.findIndex((val) => b === val)
			);
		header.unshift("");
		return header.map((key, index) => {
			const label = categoryKeyLabelMap[key] || key;
			return <th key={index}>{label} </th>;
		});
	}

	boldTotalData(data) {
		return <div className="bold-600">{data}</div>;
	}

	renderTableData() {
		return this.props.data
			.slice(
				(this.state.pageNo - 1) * this.state.itemsPerPage,
				this.state.pageNo * this.state.itemsPerPage
			)
			.map((row, index) => {
				const {
					department_name,
					apps_count,
					users_count,
					monthly_spend,
					total_spend,
				} = row; //destructuring
				let color = this.state.color[index];

				if (
					department_name &&
					department_name.toLowerCase() === "total"
				) {
					color = "#2266E2";
				}

				return (
					<>
						<tr>
							<td style={{ width: "50px" }}>
								{" "}
								<div
									style={{
										height: "16px",
										width: "16px",
										borderRadius: "4px",
										backgroundColor: color,
									}}
								></div>
							</td>
							<td>
								{row.department_id ? (
									<Link
										to={`/departments/${encodeURI(
											row.department_id
										)}#overviewdep`}
										className="table-link"
										onClick={() =>
											this.callSegment(
												row.department_id,
												row.department_name
											)
										}
									>
										<div className="truncate_name">
											{department_name}
										</div>
									</Link>
								) : (
									<div className="bold-600">
										{department_name}
									</div>
								)}
							</td>
							<td>
								{row.department_id
									? apps_count
									: this.boldTotalData(apps_count)}
							</td>
							<td>
								{row.department_id
									? users_count
									: this.boldTotalData(users_count)}
							</td>
							<td style={{ width: "200px" }}>
								{row.department_id
									? kFormatter(monthly_spend)
									: this.boldTotalData(
											kFormatter(monthly_spend)
									  )}
							</td>
							<td>
								{row.department_id
									? kFormatter(total_spend)
									: this.boldTotalData(
											kFormatter(total_spend)
									  )}
							</td>
						</tr>
					</>
				);
			});
	}

	renderCategoryTableData() {
		return this.props.data
			.slice(
				(this.state.pageNo - 1) * this.state.itemsPerPage,
				this.state.pageNo * this.state.itemsPerPage
			)
			.map((row, index) => {
				const {
					category_name,
					total_apps,
					monthly_spend,
					total_spend,
					total_user_count,
				} = row; //destructuring
				let color = this.state.color[index];

				if (category_name && category_name.toLowerCase() === "total") {
					color = "#2266E2";
				}
				let metaData = {};
				metaData.filter_by = [
					{
						filter_type: "objectId",
						field_values: [row.category_id],
						negative: false,
						is_custom: false,
						field_id: "app_sub_categories.category_id",
						field_name: "Category",
					},
				];
				return (
					<>
						<tr>
							<td style={{ width: "50px" }}>
								{" "}
								<div
									style={{
										height: "16px",
										width: "16px",
										borderRadius: "4px",
										backgroundColor: color,
									}}
								></div>
							</td>
							<td>
								{row.category_id ? (
									<Link
										to={`applications?metaData=${JSON.stringify(
											metaData
										)}#managed`}
										className="table-link"
									>
										<div className="truncate_name">
											{category_name}
										</div>
									</Link>
								) : (
									this.boldTotalData(category_name)
								)}
							</td>
							<td>
								{row.category_id
									? total_apps
									: this.boldTotalData(total_apps)}
							</td>
							<td>
								{row.category_id
									? total_user_count
									: this.boldTotalData(total_user_count)}
							</td>
							<td style={{ width: "200px" }}>
								{row.category_id
									? kFormatter(monthly_spend)
									: this.boldTotalData(
											kFormatter(monthly_spend)
									  )}
							</td>
							<td>
								{row.category_id
									? kFormatter(total_spend)
									: this.boldTotalData(
											kFormatter(total_spend)
									  )}
							</td>
						</tr>
					</>
				);
			});
	}

	pageNoSection() {
		return (
			<div className="overviewins__filter__page__no__section">
				<div className="overviewins__filter__page__no__section">
					<li
						role="button"
						onClick={() => this.changePageTo(this.state.pageNo - 1)}
						className={`page-item-prev-next ${
							this.state.pageNo === 1
								? "overviewins__filter__disabled"
								: ""
						}`}
					>
						<img
							src={leftarrow}
							style={{ marginRight: 8 }}
							alt="Prev"
						/>
						Prev
					</li>
					{this.getPageNoSandwich()}
					<li
						role="button"
						onClick={() => this.changePageTo(this.state.pageNo + 1)}
						className={`page-item-prev-next ${
							this.state.pageNo === this.nPages()
								? "overviewins__filter__disabled"
								: ""
						}`}
					>
						Next{" "}
						<img
							src={rightarrow}
							style={{ marginLeft: 8 }}
							alt="Next"
						/>
					</li>
				</div>
			</div>
		);
	}

	getPageNoSandwich() {
		const getPageButton = ({ page, active, handleClick }) => {
			return (
				<li
					role="button"
					onClick={() => handleClick(page)}
					className={
						typeof page === "string"
							? "overviewins__filter__wrap__marker"
							: active
							? "page-item-active"
							: "page-item"
					}
					key={`page-${page}`}
				>
					{typeof page === "string" ? "..." : page}
				</li>
			);
		};

		// no wraping
		if (this.nPages() <= 6)
			return Array(this.nPages())
				.fill(0)
				.map((_, i) =>
					getPageButton({
						page: i + 1,
						active: this.state.pageNo === i + 1,
						handleClick: this.changePageTo.bind(this),
					})
				);

		// wrap it
		return (
			<>
				{/* first page no. is always visible */}
				{getPageButton({
					page: 1,
					active: this.state.pageNo === 1,
					handleClick: this.changePageTo.bind(this),
				})}
				{/* if pageNo >= 4: show ... front wrap */}
				{this.state.pageNo >= 4 &&
					getPageButton({
						page: "...head",
						active: false,
						handleClick: () => {},
					})}
				{/* 3 in-between pages */}
				{((start) =>
					Array(3)
						.fill(0)
						.map((_, i) =>
							getPageButton({
								page: i + start,
								active: this.state.pageNo === i + start,
								handleClick: this.changePageTo.bind(this),
							})
						))(
					this.state.pageNo < 4
						? 2
						: this.state.pageNo >= 4 &&
						  this.state.pageNo < this.nPages() - 3
						? this.state.pageNo - 1
						: this.nPages() - 3
				)}
				{/* if pageNo < this.nPages() - 3: show ... back wrap */}
				{this.state.pageNo < this.nPages() - 3 &&
					getPageButton({
						page: "...tail",
						active: false,
						handleClick: () => {},
					})}
				{/* last page no. is visible if there is more than one page */}
				{this.nPages() > 1 &&
					getPageButton({
						page: this.nPages(),
						active: this.state.pageNo === this.nPages(),
						handleClick: this.changePageTo.bind(this),
					})}
			</>
		);
	}

	render() {
		if (!this.props.data?.length > 0) return <></>;

		return (
			<div>
				{this.infoSection(this.props.data.length)}
				<table id="appsdata2">
					<tr>
						{this.props.selectedGraph === graphKeys.DEPARTMENT
							? this.renderTableHeader()
							: this.renderCategoryTableHeader()}
					</tr>

					<tbody>
						{this.props.selectedGraph === graphKeys.DEPARTMENT
							? this.renderTableData()
							: this.renderCategoryTableData()}
					</tbody>
				</table>
				{this.pageNoSection(this.props.data.length)}
			</div>
		);
	}
}

export function OverviewinsFilter() {
	const [selectedGraph, setSelectedGraph] = useState(graphKeys.DEPARTMENT);
	const [spendData, setSpendData] = useState([]);
	const [categoryData, setCategoryData] = useState([]);
	const [spendDataKeys, setSpendDataKeys] = useState([]);
	const [categoryDataKeys, setCategoryDataKeys] = useState([]);
	const [appusage, setappusage] = useState([]);
	const [upgraded, setupgraded] = useState(false);
	const width = window.innerWidth;
	const [loadingspend, setloadingspend] = useState(true);
	const [budgetdata, setbudgetdata] = useState([]);
	const [graphfooter, setgraphfooter] = useState([]);
	const [graphupper, setgraphupper] = useState([]);
	const [firstmini, setfirstmini] = useState([]);
	const [secondmini, setsecondmini] = useState([]);
	const [thirdmini, setthirdmini] = useState([]);
	const [spendtabledata, setspendtabledata] = useState([]);
	const [categorytabledata, setcategorytabledata] = useState([]);
	const [spendGraphMonthlySpend, setSpendGraphMonthlySpend] = useState(null);
	const [spendGraphChange, setSpendGraphChange] = useState(null);
	const [spendpermonth, setspendpermonth] = useState([]);
	const userInfo = useSelector((state) => state.userInfo);
	const orgName = userInfo?.org_name;
	const dispatch = useDispatch();
	let {
		toprow,
		minigraphs,
		budget,
		applicationsov,
		spendtrendov,
		department_spend_data,
		category_spend_data,
	} = useSelector((state) => state.overview);
	const location = useLocation();
	const history = useHistory();

	const orgId = getValueFromLocalStorage("userInfo")?.org_id;
	useEffect(() => {
		//Segment Implementation
		window.analytics.page("Overview", "Overview-HomeScreen", {
			orgId: orgId || "",
			orgName: orgName || "",
		});

		if (!toprow.loaded) {
			dispatch(fetchTopRow(orgId));
		}
		if (!minigraphs.loaded) {
			dispatch(fetchMiniCharts(orgId));
		}
		if (_.isEmpty(budget.data)) {
			dispatch(fetchBudget(orgId));
		}

		if (!applicationsov.loaded) {
			dispatch(fetchApplications(orgId, "users"));
		}
		setSelectedGraph(graphKeys.DEPARTMENT);
	}, []);
	useEffect(() => {
		setappusage(minigraphs?.data?.app_usage);
		setbudgetdata(budget.data);
		setgraphfooter(minigraphs?.data?.consolidated_data);
		if (budgetdata) {
			budgetdata.sort((el1, el2) => el2.budget - el1.budget);
		}

		if (minigraphs?.data?.consolidated_graphs_data) {
			setspendpermonth(minigraphs?.data?.consolidated_graphs_data);
			setgraphupper(minigraphs?.data?.consolidated_graphs_data);
		}
	}, [
		spendDataKeys,
		spendData,
		budget,
		budgetdata,
		minigraphs,
		toprow,
		spendtabledata,
	]);

	const org_fy_start_month = useEffect(() => {
		if (department_spend_data.loaded && !department_spend_data.err) {
			let data = [...department_spend_data?.data?.spend_trend];
			let tabledata = [...department_spend_data?.data?.spend_table_data];

			tabledata.sort((a, b) =>
				a.department_name > b.department_name ? 1 : -1
			);
			let obj = tabledata.find(
				(x) =>
					typeof x.department_name === "string" &&
					x.department_name?.toLowerCase() === "total"
			);
			let index = tabledata.indexOf(obj);
			tabledata.splice(index, 1);
			tabledata.unshift(obj);
			setspendtabledata(tabledata);

			if (data) {
				let datakeys = [];
				data.forEach((el) => {
					el.month_name = monthIdNameMap[el.month_id];

					el.departments.forEach((item) => {
						datakeys.push(item.department_name);
						el[item.department_name] = item.department_spend;
					});
				});
				const uniq = [...new Set(datakeys)];
				uniq.sort((a, b) => (a > b ? 1 : -1));
				const spendToolTip = [];
				uniq.map((eachSpend, index) => {
					if (
						typeof eachSpend === "string" &&
						eachSpend?.toLowerCase() === "total"
					) {
						spendToolTip.unshift([
							eachSpend,
							colors.Colors[index % colors.Colors.length],
						]);
					} else {
						spendToolTip.push([
							eachSpend,
							colors.Colors[index % colors.Colors.length],
						]);
					}
				});
				setSpendDataKeys(spendToolTip);
				data.sort(
					(a, b) => a.year_id - b.year_id || a.month_id - b.month_id
				);
				setSpendData(data);
			}
			setloadingspend(false);
		}
	}, [department_spend_data]);

	useEffect(() => {
		if (category_spend_data.loaded && !category_spend_data?.err) {
			let data = [...category_spend_data?.data?.category_spend_data];
			let tabledata = [...category_spend_data?.data?.category_table_data];

			tabledata.sort((a, b) =>
				a.category_name > b.category_name ? 1 : -1
			);
			let obj = tabledata.find(
				(x) =>
					typeof x.category_name === "string" &&
					x.category_name?.toLowerCase() === "total"
			);
			let index = tabledata.indexOf(obj);
			tabledata.splice(index, 1);
			tabledata.unshift(obj);
			setcategorytabledata(tabledata);

			if (data) {
				let datakeys = [];
				data.forEach((el) => {
					el.month_name = monthIdNameMap[el.month];
					el.categories.forEach((item) => {
						datakeys.push(item.category_name);
						el[item.category_name] = item.spend;
					});
				});
				const uniq = [...new Set(datakeys)];
				uniq.sort((a, b) => (a > b ? 1 : -1));
				const categoryToolTip = [];
				uniq.map((eachSpend, index) => {
					categoryToolTip.push([
						eachSpend,
						colors.Colors[index % colors.Colors.length],
					]);
				});
				setCategoryDataKeys(categoryToolTip);
				data.sort(
					(a, b) => a.year_id - b.year_id || a.month_id - b.month_id
				);
				setCategoryData(data);
			}
			setloadingspend(false);
		}
	}, [category_spend_data]);

	useEffect(() => {
		let start_month = userInfo?.org_fy_start_month || 1;
		let end_month = dayjs().month() + 1;
		let end_year = dayjs().year();
		let start_year = start_month > end_month ? end_year - 1 : end_year;
		if (_.isEmpty(department_spend_data?.data)) {
			dispatch(
				fetchDepartmentSpendData(
					orgId,
					start_month,
					end_month,
					start_year,
					end_year
				)
			);
		}
		if (_.isEmpty(category_spend_data?.data)) {
			dispatch(
				fetchCategorySpendData(
					orgId,
					start_month,
					end_month,
					start_year,
					end_year
				)
			);
		}
	}, []);

	function handleOnSelectGraphOption(selectedValue) {
		setSelectedGraph(selectedValue);
		//Segment Implementation
		if (selectedValue) {
			let header =
				"Overview Spend Selector Changed; " +
				selectedValue?.charAt(0).toUpperCase() +
				selectedValue?.slice(1);
			window.analytics.track(header, {
				currentSection: "Overview",
				currentPage: "Overview-HomeScreen",
				orgId: orgId || "",
				orgName: orgName || "",
			});
		}
	}

	var today = new Date();
	var curHr = today.getHours();
	var textToday;
	if (curHr < 12) {
		textToday = "Good Morning";
	} else if (curHr < 16) {
		textToday = "Good Afternoon";
	} else {
		textToday = "Good Evening";
	}
	const m = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];

	const refreshOverviewScreen = () => {
		dispatch(clearCategorySpendData());
		dispatch(clearDepartmentSpendData());
		dispatch(fetchTopRow(orgId));
		dispatch(fetchMiniCharts(orgId));
		dispatch(fetchBudget(orgId));
	};

	useEffect(() => {
		if (spendpermonth.length === 12) {
			let tempspendpermonth = spendpermonth;
			Array.isArray(tempspendpermonth) &&
				tempspendpermonth.forEach((month_data) => {
					if (!month_data.avg_spend_per_user) {
						month_data.avg_spend_per_user = 0;
					}
					if (!month_data.apps_spend_per_month) {
						month_data.apps_spend_per_month = 0;
					}
					if (!month_data.contract_avg_spend_month) {
						month_data.contract_avg_spend_month = 0;
					}
				});
			setspendpermonth(tempspendpermonth);
			if (toprow.data) {
				let currentMonthSpendObj = spendpermonth.find(
					(x) => x.month_id === toprow?.data?.month_id
				);
				let indexOfCurrentMonth =
					spendpermonth.indexOf(currentMonthSpendObj);
				if (currentMonthSpendObj) {
					setSpendGraphMonthlySpend(
						currentMonthSpendObj?.apps_spend_per_month
					);
					setSpendGraphChange(
						currentMonthSpendObj?.apps_spend_per_month -
							spendpermonth[indexOfCurrentMonth - 1]
								?.apps_spend_per_month
					);
				}
			}
		}
	}, [spendpermonth, toprow]);

	return (
		<>
			<Strips entity={ENTITIES.OVERVIEW} />
			{toprow.loading ? (
				<div className="Overviewins__cont">
					<ContentLoader className="ov__top">
						<rect
							x="0"
							y="30"
							rx="4"
							ry="4"
							width="219"
							height="21"
						/>
					</ContentLoader>
					<hr style={{ margin: "0px 0px" }}></hr>
					<div className="overviewins__top__next">
						<ContentLoader
							className="overviewins__top__next__ins"
							style={{ flexBasis: "24%" }}
						>
							<rect
								x="0"
								y="19"
								rx="2"
								ry="2"
								width="76"
								height="9"
							/>
							<circle cx="14" cy="53" r="14" />
							<rect
								x="36"
								y="43"
								rx="4"
								ry="4"
								width="65"
								height="18"
							></rect>
						</ContentLoader>
						<ContentLoader
							className="overviewins__top__next__ins"
							style={{ flexBasis: "23%" }}
						>
							<rect
								x="0"
								y="19"
								rx="2"
								ry="2"
								width="76"
								height="9"
							/>
							<circle cx="14" cy="53" r="14" />
							<rect
								x="36"
								y="43"
								rx="4"
								ry="4"
								width="65"
								height="18"
							></rect>
						</ContentLoader>
						<ContentLoader
							className="overviewins__top__next__ins"
							style={{ flexBasis: "26%" }}
						>
							<rect
								x="0"
								y="19"
								rx="2"
								ry="2"
								width="76"
								height="9"
							/>
							<circle cx="14" cy="53" r="14" />
							<rect
								x="36"
								y="43"
								rx="4"
								ry="4"
								width="65"
								height="18"
							></rect>
						</ContentLoader>
						<ContentLoader
							className="overviewins__top__next__ins"
							style={{ flexBasis: "26%" }}
						>
							<rect
								x="0"
								y="19"
								rx="2"
								ry="2"
								width="76"
								height="9"
							/>
							<circle cx="14" cy="53" r="14" />
							<rect
								x="36"
								y="43"
								rx="4"
								ry="4"
								width="65"
								height="18"
							></rect>
						</ContentLoader>
						<ContentLoader
							className="overviewins__top__next__ins"
							style={{ flexBasis: "14%" }}
						>
							<rect
								x="0"
								y="19"
								rx="2"
								ry="2"
								width="76"
								height="9"
							/>
							<circle cx="14" cy="53" r="14" />
							<rect
								x="36"
								y="43"
								rx="4"
								ry="4"
								width="65"
								height="18"
							></rect>
						</ContentLoader>
					</div>
					<div className="ov__div3__conload">
						<ContentLoader className="ov__div3__conload__d1">
							<rect
								x="20"
								y="94"
								rx="2"
								ry="2"
								width="207"
								height="14"
							/>
							<rect
								x="20"
								y="127"
								rx="2"
								ry="2"
								width="172"
								height="10"
							/>
							<rect
								x="20"
								y="150"
								rx="2"
								ry="2"
								width="145"
								height="10"
							/>
							<rect
								x="20"
								y="233"
								rx="4"
								ry="4"
								width="94"
								height="34"
							/>
						</ContentLoader>
						<ContentLoader className="ov__div3__conload__d1">
							<rect
								x="20"
								y="94"
								rx="2"
								ry="2"
								width="207"
								height="14"
							/>
							<rect
								x="20"
								y="127"
								rx="2"
								ry="2"
								width="172"
								height="10"
							/>
							<rect
								x="20"
								y="150"
								rx="2"
								ry="2"
								width="145"
								height="10"
							/>
							<rect
								x="20"
								y="233"
								rx="4"
								ry="4"
								width="94"
								height="34"
							/>
						</ContentLoader>
						<ContentLoader className="ov__div3__conload__d1">
							<rect
								x="20"
								y="94"
								rx="2"
								ry="2"
								width="207"
								height="14"
							/>
							<rect
								x="20"
								y="127"
								rx="2"
								ry="2"
								width="172"
								height="10"
							/>
							<rect
								x="20"
								y="150"
								rx="2"
								ry="2"
								width="145"
								height="10"
							/>
							<rect
								x="20"
								y="233"
								rx="4"
								ry="4"
								width="94"
								height="34"
							/>
						</ContentLoader>
						<ContentLoader className="ov__div3__conload__d1">
							<rect
								x="20"
								y="94"
								rx="2"
								ry="2"
								width="207"
								height="14"
							/>
							<rect
								x="20"
								y="127"
								rx="2"
								ry="2"
								width="172"
								height="10"
							/>
							<rect
								x="20"
								y="150"
								rx="2"
								ry="2"
								width="145"
								height="10"
							/>
							<rect
								x="20"
								y="233"
								rx="4"
								ry="4"
								width="94"
								height="34"
							/>
						</ContentLoader>
					</div>
					<div className="ov__div4">
						<ContentLoader className="ov__div4__div1">
							<rect
								x="20"
								y="50"
								rx="4"
								ry="4"
								width="196"
								height="128"
							/>
							<rect
								x="20"
								y="205"
								rx="4"
								ry="4"
								width="156"
								height="20"
							/>
							<rect
								x="20"
								y="239"
								rx="2"
								ry="2"
								width="107"
								height="10"
							/>
						</ContentLoader>
						<ContentLoader className="ov__div4__div1">
							<rect
								x="20"
								y="50"
								rx="4"
								ry="4"
								width="196"
								height="128"
							/>
							<rect
								x="20"
								y="205"
								rx="4"
								ry="4"
								width="156"
								height="20"
							/>
							<rect
								x="20"
								y="239"
								rx="2"
								ry="2"
								width="107"
								height="10"
							/>
						</ContentLoader>

						<ContentLoader className="ov__div4__div1">
							<rect
								x="20"
								y="50"
								rx="4"
								ry="4"
								width="196"
								height="128"
							/>
							<rect
								x="20"
								y="205"
								rx="4"
								ry="4"
								width="156"
								height="20"
							/>
							<rect
								x="20"
								y="239"
								rx="2"
								ry="2"
								width="107"
								height="10"
							/>
						</ContentLoader>
						<ContentLoader className="ov__div4__div1">
							<rect
								x="20"
								y="50"
								rx="4"
								ry="4"
								width="196"
								height="128"
							/>
							<rect
								x="20"
								y="205"
								rx="4"
								ry="4"
								width="156"
								height="20"
							/>
							<rect
								x="20"
								y="239"
								rx="2"
								ry="2"
								width="107"
								height="10"
							/>
						</ContentLoader>
					</div>
				</div>
			) : (
				<div className="Overviewins__cont">
					<div className="d-flex flex-row">
						<div className="ov__top">
							{textToday}, {userInfo?.user_name}
						</div>
						<div
							className="ml-auto mt-auto mb-auto cursor-pointer"
							style={{ paddingRight: "40px" }}
							onClick={() => refreshOverviewScreen()}
						>
							<img src={refresh} className="border rounded p-2" />
						</div>
					</div>
					<IntegrationErrorInfo type={"overview"} />
					<TopRow toprow={toprow} />
					<div className="ov__div4">
						<div className="ov__div4__div1">
							{minigraphs.loading ? (
								<div
									style={{
										height: "100%",
										width: "100%",
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
									}}
								>
									<Loader height={100} width={100}></Loader>
								</div>
							) : (
								<>
									<div
										className="ov__div4__div1__div1"
										style={{ marginTop: "20px" }}
									>
										Spend per Month
									</div>
									<div
										className="ov__div4__div1__div2"
										style={{ marginTop: "15px" }}
									>
										<ResponsiveContainer width="95%">
											<BarChart
												height={151}
												data={spendpermonth}
												margin={{ top: 5 }}
												barSize={14}
											>
												<Tooltip
													content={
														<CustomTooltip
															dataKey="apps_spend_per_month"
															dataText="spend "
														/>
													}
												></Tooltip>
												<XAxis
													scale={"auto"}
													axisLine={false}
													tickLine={false}
													dataKey="month_id"
													minTickGap={0}
													tick={{ fontSize: 10 }}
													tickFormatter={(tick) =>
														FULL_MONTH[
															tick - 1
														].slice(0, 1)
													}
												/>

												<Bar
													dataKey="apps_spend_per_month"
													fill="#6967E0"
													radius={[4, 4, 4, 4]}
													background={{
														fill: "#EBEBEB",
														radius: [4, 4, 4, 4],
													}}
												/>
											</BarChart>
										</ResponsiveContainer>
									</div>
									<div
										className="ov__div4__div1__div3"
										style={{ marginTop: "6px" }}
									>
										<div className="ov__div4__div1__div3__text1">
											{graphfooter
												? kFormatter(
														graphfooter[
															"spend_month"
														]
												  )
												: ""}
										</div>
										<div
											className="ov__div4__div1__div3__text2"
											style={{ marginLeft: "5px" }}
										>
											this month
										</div>
									</div>
									<div
										className="ov__div4__div1__div4"
										style={{ marginTop: "5px" }}
									>
										<div className="ov__div4__div1__div4__text1">
											{graphfooter
												? kFormatter(
														graphfooter[
															"spend_year"
														]
												  )
												: ""}
										</div>
										<div
											className="ov__div4__div1__div4__text2"
											style={{ marginLeft: "5px" }}
										>
											this year
										</div>
									</div>
								</>
							)}
						</div>
						<div className="ov__div4__div1">
							{minigraphs.loading ? (
								<div
									style={{
										height: "100%",
										width: "100%",
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
									}}
								>
									<Loader height={100} width={100}></Loader>
								</div>
							) : (
								<>
									<div
										className="ov__div4__div1__div1"
										style={{ marginTop: "20px" }}
									>
										Spend per User
									</div>
									<div
										className="ov__div4__div1__div2"
										style={{ marginTop: "15px" }}
									>
										<ResponsiveContainer width="95%">
											<BarChart
												width={width * 0.17}
												height={151}
												data={spendpermonth}
												margin={{ top: 5 }}
												barSize={14}
											>
												<XAxis
													scale={"auto"}
													axisLine={false}
													tickLine={false}
													dataKey="month_id"
													minTickGap={0}
													tick={{ fontSize: 10 }}
													tickFormatter={(tick) =>
														FULL_MONTH[
															tick - 1
														].slice(0, 1)
													}
												/>
												<Tooltip
													content={
														<CustomTooltip
															dataKey="avg_spend_per_user"
															dataText="per User "
														/>
													}
												></Tooltip>
												<Bar
													dataKey="avg_spend_per_user"
													fill="#FFB169"
													radius={[4, 4, 4, 4]}
													background={{
														fill: "#EBEBEB",
														radius: [4, 4, 4, 4],
													}}
												/>
											</BarChart>
										</ResponsiveContainer>
									</div>
									<div
										className="ov__div4__div1__div3"
										style={{ marginTop: "6px" }}
									>
										<div className="ov__div4__div1__div3__text1">
											{graphfooter
												? kFormatter(
														graphfooter[
															"avg_user_spend_month"
														]
												  )
												: ""}
										</div>
										<div
											className="ov__div4__div1__div3__text2"
											style={{ marginLeft: "5px" }}
										>
											this month
										</div>
									</div>
									<div
										className="ov__div4__div1__div4"
										style={{ marginTop: "5px" }}
									>
										<div className="ov__div4__div1__div4__text1">
											{graphfooter
												? kFormatter(
														graphfooter[
															"avg_user_spend_year"
														]
												  )
												: ""}
										</div>
										<div
											className="ov__div4__div1__div4__text2"
											style={{ marginLeft: "5px" }}
										>
											this year
										</div>
									</div>
								</>
							)}
						</div>
						<div className="ov__div4__div1">
							{minigraphs.loading ? (
								<div
									style={{
										height: "100%",
										width: "100%",
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
									}}
								>
									<Loader height={100} width={100}></Loader>
								</div>
							) : (
								<>
									<div
										className="ov__div4__div1__div1"
										style={{ marginTop: "20px" }}
									>
										Cost of Contracts
									</div>
									<div
										className="ov__div4__div1__div2"
										style={{ marginTop: "15px" }}
									>
										<ResponsiveContainer width="95%">
											<BarChart
												width={width * 0.17}
												height={151}
												data={spendpermonth}
												margin={{ top: 5 }}
												barSize={14}
											>
												<XAxis
													scale={"auto"}
													axisLine={false}
													tickLine={false}
													dataKey="month_id"
													minTickGap={0}
													tick={{ fontSize: 10 }}
													tickFormatter={(tick) =>
														FULL_MONTH[
															tick - 1
														].slice(0, 1)
													}
												/>
												<Tooltip
													content={
														<CustomTooltip
															dataKey="contracts_spend_per_month"
															dataText="spent "
														/>
													}
												></Tooltip>
												<Bar
													dataKey="contracts_spend_per_month"
													fill="#5CAF53"
													radius={[4, 4, 4, 4]}
													background={{
														fill: "#EBEBEB",
														radius: [4, 4, 4, 4],
													}}
												/>
											</BarChart>
										</ResponsiveContainer>
									</div>
									<div
										className="ov__div4__div1__div3"
										style={{ marginTop: "6px" }}
									>
										<div className="ov__div4__div1__div3__text1">
											{kFormatter(
												graphfooter?.contract_avg_spend_month
											)}
										</div>
										<div
											className="ov__div4__div1__div3__text2"
											style={{ marginLeft: "5px" }}
										>
											this month
										</div>
									</div>
									<div
										className="ov__div4__div1__div4"
										style={{ marginTop: "5px" }}
									>
										<div className="ov__div4__div1__div4__text1">
											{kFormatter(
												graphfooter?.contract_avg_spend_year
											)}
										</div>
										<div
											className="ov__div4__div1__div4__text2"
											style={{ marginLeft: "5px" }}
										>
											this year
										</div>
									</div>
								</>
							)}
						</div>
						<div className="ov__div4__div1">
							{minigraphs.loading ? (
								<div
									style={{
										height: "100%",
										width: "100%",
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
									}}
								>
									<Loader height={100} width={100}></Loader>
								</div>
							) : (
								<>
									<div
										className="ov__div4__div1__div1 d-flex"
										style={{ marginTop: "20px" }}
									>
										Top Apps by Usage
										<OverlayTrigger
											placement="top"
											overlay={
												<BootstrapTooltip>
													Usage is calculated for each
													individual user taking the
													highest usage by any user as
													benchmark. The usage for an
													application shows the
													average usage for all users
												</BootstrapTooltip>
											}
										>
											<img
												src={info}
												style={{ marginLeft: "5px" }}
											/>
										</OverlayTrigger>
									</div>
									<div
										className="ov__div4__div1__div2__appusage"
										style={{ marginTop: "10px" }}
									>
										<ResponsiveContainer width="95%">
											<GraphBarHor
												graphdata={appusage || []}
											></GraphBarHor>
										</ResponsiveContainer>
									</div>
									<div className="ov__div4__div1__div3">
										<div className="ov__div4__div1__div3__text1">
											{graphfooter?.app_avg_usage?.toFixed(
												2
											) || 0}
											%
										</div>
										<div
											className="ov__div4__div1__div3__text2"
											style={{ marginLeft: "5px" }}
										>
											Avg. Usage
										</div>
									</div>
								</>
							)}
						</div>
					</div>
					<div className="ov__div5">
						<div className="ov__div5__div1">
							<div>{graphTitle[selectedGraph]} Wise Spend</div>
							<SelectOld
								className="graphTypeSelector"
								value={selectedGraph}
								onSelect={({ value }) =>
									handleOnSelectGraphOption(value)
								}
								options={[
									{
										label: "Department",
										value: graphKeys.DEPARTMENT,
									},
									{
										label: "Category",
										value: graphKeys.CATEGORY,
									},
								]}
							/>
						</div>

						<div className="ov__div5__div2">
							{loadingspend ? (
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
									<Loader height={100} width={100}></Loader>
								</div>
							) : spendData.length !== 0 ||
							  categoryData.length !== 0 ? (
								<div className="ov__d5__d2__d1">
									<UIAreaChart
										spendData={
											selectedGraph ===
											graphKeys.DEPARTMENT
												? spendData
												: categoryData
										}
										spendDatakeys={
											selectedGraph ===
											graphKeys.DEPARTMENT
												? spendDataKeys
												: categoryDataKeys
										}
									></UIAreaChart>
									<div
										className="ov__d5__d2__d1__d1"
										style={{ top: "40px", left: "64px" }}
									>
										<div className="ov__d5__d2__d1__d1__d1">
											<div className="ov__d5__d2__d1__d1__d1__d1">
												{kFormatter(
													spendGraphMonthlySpend
												)}
											</div>
											{spendGraphChange >= 0 ? (
												<img
													className="overviewins__top__next__insimage"
													src={uparrow}
												></img>
											) : (
												<img
													className="overviewins__top__next__insimage"
													src={downarrow}
												></img>
											)}
											<div className="ov__d5__d2__d1__d1__d1__d2">
												{kFormatter(
													Math.abs(
														isNaN(spendGraphChange)
															? 0
															: spendGraphChange
													)
												)}
											</div>
										</div>
										<div className="ov__d5__d2__d1__d1__d2">
											Spent in{" "}
											{m[toprow?.data?.month_id - 1]}
										</div>
									</div>
									{/* <div className="ov__d5__d2__selectdiv">
              <select>
                <option selected> Department </option>
                <option>Category</option>
              </select>
            </div> */}
									<hr
										style={{ margin: "0px", width: "100%" }}
									></hr>
									<div className="ov__d5__d2__d2">
										<Table2
											selectedGraph={selectedGraph}
											data={
												selectedGraph ===
												graphKeys.DEPARTMENT
													? spendtabledata
													: categorytabledata
											}
											userInfo={userInfo}
										/>
									</div>
								</div>
							) : (
								<div
									style={{
										backgroundImage: `url(${emptySpendTrend})`,
										height: "306px",
									}}
									className="d-flex flex-column justify-content-center align-items-center"
								>
									<div className="d-flex flex-column justify-content-center align-items-center m-auto">
										<img src={noData} className="m-auto" />
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
												style={{ paddingRight: "5px" }}
											/>
											Add transactions
										</button>
									</div>
								</div>
							)}
						</div>
					</div>

					<div className="ov__div6">
						<div className="ov__div6__div1 pr-1">
							<div className="ov__div6__div1__top">
								Budget per Department
							</div>
							<div className="ov__div6__div1__botgraph">
								{budget.loading ? (
									<div
										style={{
											height: "100%",
											width: "100%",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										<Loader
											height={100}
											width={100}
										></Loader>
									</div>
								) : budgetdata?.length != 0 ? (
									<div>
										<GraphBarHorStack
											graphdata2={budgetdata}
										/>
									</div>
								) : (
									<div
										style={{
											backgroundImage: `url(${emptyBudget})`,
											height: "400px",
											backgroundPositionY: "center",
										}}
										className="d-flex flex-column justify-content-center align-items-center"
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
												Add budget for departments
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
							</div>
						</div>
						<div className="ov__div6__div1">
							<div className="ov__div6__div1__top">
								Top Apps by Users/Spend
							</div>
							<div className="ov__div6__div1__bot">
								{applicationsov.loading ? (
									<div
										style={{
											height: "100%",
											widows: "100%",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										<Loader
											height={100}
											width={100}
										></Loader>
									</div>
								) : (
									<TableNew
										data={applicationsov.data?.applications}
									></TableNew>
								)}
							</div>
						</div>
					</div>
					<div className="ov__lastdiv" hidden>
						<div className="ov__lastdiv__d1">Renewals</div>
						{/* <OverviewBox data={data}></OverviewBox> */}
						<div
							style={{
								width: "100%",
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
							}}
						>
							<img src={emptyrenewal}></img>
							<div className="departments-empty-lower">
								No Upcoming Renewals
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
