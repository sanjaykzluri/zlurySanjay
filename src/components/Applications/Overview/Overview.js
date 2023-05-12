import React from "react";
import "./Overview.css";
import { TableNew2 } from "./TableNew2";
import { TableNew3 } from "./TableNew3";
import "../../../App.css";
import commingSoon from "../Recommendations/comingSoon.svg";
import overview1 from "../../../assets/applications/overview1.svg";
import overview2 from "../../../assets/applications/overview2.svg";
import overview3 from "../../../assets/applications/overview3.svg";
import { ChangeOwner } from "./ChangeOwner";
import { ChangeStatus } from "./ChangeStatus";
import { ChangeRenewal } from "./ChangeRenewal";
import downarrow from "../../../assets/downarrow.svg";
import { Loader } from "../../../common/Loader/Loader";
import emptySpendTrend from "../../Overview/spendEmpty.png";
import noData from "../../Overview/noData.svg";
import emptyUsage from "../../../assets/emptyUsage.png";
import { AppEdit } from "./AppEdit";
import uparrow from "../../Overview/uparrow.svg";
import ShowMoreText from "react-show-more-text";
import needsreview from "../../../assets/applications/needsreview.svg";
import restricted from "../../../assets/applications/restricted.svg";
import unmanaged from "../../../assets/applications/unmanaged.svg";
import teammanaged from "../../../assets/applications/teammanaged.svg";
import individuallymanaged from "../../../assets/applications/individuallymanaged.svg";
import ContentLoader from "react-content-loader";
import dropdownarrow from "./dropdownarrow.svg";
import NewGraph from "./NewGraph";
import { Split } from "./Split";
import { SimilarApps } from "./SimilarApps";
import {
	applicationConstants,
	APPLICATION_AUTH_STATUS,
	APPLICATION_RECOMMENDATION_HEADER_TEXT,
} from "../../../constants";
import authorised from "../../../assets/applications/authorised.svg";
import rightarrow from "../../../assets/users/rightarrow.svg";
import { AddTransactionModal } from "../../Transactions/Modals/AddTransactionModal";
import {
	ResponsiveContainer,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
} from "recharts";
import { connect } from "react-redux";
import { allowScroll, preventScroll } from "../../../actions/ui-action";
import {
	fetchAllApplications,
	fetchApplicationActionHistory,
	fetchSpendGraphData,
	fetchUsageGraphData,
} from "../../../actions/applications-action";
import {
	getSpendGraphData,
	getUsageGraphData,
	patchApplication,
	updateApplication,
	updateAppOwner,
	archiveApplications,
	unArchiveApplications,
	getApplicationsActionHistory,
	getApplicationSpendVSEstCostGraph,
} from "../../../services/api/applications";
import { ChangeCategory } from "./ChangeCatgeory";
import dayjs from "dayjs";
import { NameBadge } from "../../../common/NameBadge";
import { NotesList } from "../../Notes/NotesList";
import { InlineUpdateField } from "./InlineUpdateField";
import contract from "../../../assets/icons/contracts.svg";
import EllipsisSVG from "../../../assets/icons/ellipsis-v.svg";
import { Dropdown } from "react-bootstrap";
import { MapToApp } from "./MapToApp";
import { MergeApps } from "./MergeApps";
import { RenewalWidget } from "../../../modules/renewals/containers/RenewalWidget/RenewalWidget";
import { CustomFieldSectionInOverview } from "../../../modules/shared/containers/CustomFieldSectionInOverview/CustomFieldSectionInOverview";
import { CUSTOM_FIELD_ENTITY } from "../../../modules/custom-fields/constants/constant";
import DepartmentCard from "./DepartmentCard";
import { kFormatter } from "../../../constants/currency";
import ArchiveModal from "../../../common/ArchiveModal/ArchiveModal";
import { OverlayTrigger, Tooltip as BootstrapTooltip } from "react-bootstrap";
import RoleContext from "../../../services/roleContext/roleContext";
import { CustomTooltip } from "../../Overview/NewGraph";
import ActionLogHistory from "../../Users/ActionLogHistory/ActionLogHistory";
import overview_live_users from "../../../assets/applications/overview_live_users.svg";
import { UnmapConfirmation } from "./UnmapConfirmation";
import { authStatusObj } from "../../../common/AppAuthStatus";
import { getColor, unescape } from "../../../utils/common";
import noRecommendations from "../../../assets/noRecommendations.svg";
import { CategoryFormatter } from "../AllApps/AllApps";
import RiskIcon from "../SecurityCompliance/RiskIcon";
import Rating from "../SecurityCompliance/Rating";
import { SecurityThreatFormatter } from "../../../modules/security/components/CriticalUsers/CriticalUsers";
import { FULL_MONTH, MONTH } from "../../../utils/DateUtility";
import savingsarrow from "../../../assets/applications/savingsarrow.svg";
import { Link } from "react-router-dom";
import { push } from "connected-react-router";
import SpendVSCostGraph from "../../../modules/spendvscost/components/SpendVSCostGraph";
import ErrorScreen from "../../../common/ErrorModal/ErrorScreen";
import { getValueFromLocalStorage } from "utils/localStorage";

function clickedOnElipsis() {
	//Segment Implementation
	const pathname = window.location.pathname;
	const id = pathname.split("/")[2];

	window.analytics.track("Clicked on Elipsis", {
		currentCategory: "Applications",
		currentPageName: "Overview",
		currentAppId: id,
		orgId: getValueFromLocalStorage("userInfo")?.org_id || "",
		orgName: getValueFromLocalStorage("userInfo")?.org_name || "",
	});
}

const ellipsis = React.forwardRef(({ children, onClick }, ref) => (
	<a
		className="cursor-pointer"
		ref={ref}
		onClick={(e) => {
			e.preventDefault();
			onClick(e);
			clickedOnElipsis();
		}}
	>
		<img src={EllipsisSVG} width="20" />
	</a>
));

const managed_auth_status_dropdown = React.forwardRef(
	({ children, onClick }, ref) => (
		<a
			className="cursor-pointer insidedropdown__overviewusers"
			ref={ref}
			onClick={(e) => onClick(e)}
		>
			{children}
		</a>
	)
);

class OverviewComp extends React.Component {
	static contextType = RoleContext;

	constructor(props) {
		super(props);
		this.state = {
			data: {},
			loading: true,
			showHide: false,
			showHideEdit: false,
			showHideCategoryEdit: false,
			AppId: "",
			newcategory: "",
			showLogsMenu: false,
			teams: ["Design", "Market"],
			viewDropdownbutton: true,
			dropdownbuttonclicked: false,
			appstatus: "",
			showHideSplit: false,
			readmore: false,
			showHideSimilarApps: false,
			spendData: [],
			spendDataKeys: [],
			usageData: [],
			usageDataKeys: [],
			spendTable: [],
			usageTable: [],
			spendLoading: true,
			usageLoading: true,
			edited: false,
			editedAuth: false,
			patchObj: {
				op: "replace",
				field: "",
				value: "",
			},
			appFormErrors: [],
			appSubmitInProgress: false,
			type: "",
			showSpendEmptyState: false,
			showMapAppModal: false,
			mergeTargetApp: null,
			showMergeAppModal: false,
			showUnmapModal: false,
			appDepartments: [],
			showAddTransactionModal: false,
			showArchiveModal: false,
			isAppArchived: false,
			showActionHistory: false,
			isViewer: false,
			app_parent_name: "",
			newAppData: {},
		};
		this.closeLogsMenu = this.closeLogsMenu.bind(this);
		this.hideComponent = this.hideComponent.bind(this);
		this.handleClickOutside = this.handleClickOutside.bind(this);
		this.container__overview__ref = React.createRef();
		this.showLogsMenu = this.showLogsMenu.bind(this);
		this.line_seperator = <hr style={{ margin: "0px 18px" }}></hr>;
		this.handleOnUpdate = this.handleOnUpdate.bind(this);
		this.authRef = React.createRef();
		this.handleClickOutsideAuthDropdown =
			this.handleClickOutsideAuthDropdown.bind(this);
		this.handleAuthClick = this.handleAuthClick.bind(this);
		this.clickedOnSimilarApps = this.clickedOnSimilarApps.bind(this);
		this.authStatus = {
			AUTHORISED: "authorized",
			RESTRICTED: "restricted",
			NEEDSREVIEW: "needs review",
			CENTRALLY_MANAGED: "centrally managed",
			TEAM_MANAGED: "team managed",
			INDIVIDUALLY_MANAGED: "individually managed",
			UNMANAGED: "unmanaged",
		};
		this.handleDepartments = this.handleDepartments.bind(this);
		this.handleArchivingApp = this.handleArchivingApp.bind(this);
		this.handleUnArchivingApp = this.handleUnArchivingApp.bind(this);
		this.handleMergeComplete = this.handleMergeComplete.bind(this);
		this.refreshReduxState = this.refreshReduxState.bind(this);
		this.clickedOnEdit = this.clickedOnEdit.bind(this);
		this.clickedOnDepartmentSplitEdit =
			this.clickedOnDepartmentSplitEdit.bind(this);
		this.commonSegmentTrack = this.commonSegmentTrack.bind(this);
		this.clickedOnAddContract = this.clickedOnAddContract.bind(this);
		this.clickedOnAddUser = this.clickedOnAddUser.bind(this);
		this.clickedOnAddTransaction = this.clickedOnAddTransaction.bind(this);
		this.clickedOnMaptoApp = this.clickedOnMaptoApp.bind(this);
		this.clickedOnMergeWithAnotherApp =
			this.clickedOnMergeWithAnotherApp.bind(this);
		this.clickedOnReviewNow = this.clickedOnReviewNow.bind(this);
	}

	auth_status_dropdown = React.forwardRef(({ children, onClick }, ref) => (
		<a
			className="cursor-pointer overview__dropdownbutton text-decoration-none"
			ref={ref}
			onClick={(e) => {
				e.preventDefault();
				if (!this.state.isViewer) {
					onClick(e);
				}
			}}
		>
			{children}
		</a>
	));

	showLogsMenu(event) {
		event.preventDefault();

		this.setState({ showLogsMenu: true }, () => {
			document.addEventListener("click", this.closeLogsMenu);
		});
	}

	closeLogsMenu(event) {
		if (!this.dropdownMenu.contains(event.target)) {
			this.setState({ showLogsMenu: false }, () => {
				document.removeEventListener("click", this.closeLogsMenu);
			});
		}
	}

	hideComponent(name) {
		switch (name) {
			case "showHide":
				this.setState({ showHide: !this.state.showHide });
				break;
		}
	}

	handleClickOutsideAuthDropdown(event) {
		if (
			this.authRef.current &&
			!this.authRef.current?.contains(event.target)
		) {
			this.setState({ dropdownbuttonclicked: false });
		}
	}

	updateGraphs() {
		const pathname = window.location.pathname;
		const id = pathname.split("/")[2];
		let userInfo = getValueFromLocalStorage("userInfo");

		const start_month = userInfo["org_fy_start_month"] || 4;
		const end_month = dayjs().month() + 1;
		const end_year = dayjs().year();
		const start_year = start_month > end_month ? end_year - 1 : end_year;

		this.setState({
			AppId: id,
			type: this.props.application?.app_type,
			appstatus: this.props.application?.app_auth_status,
		});

		this.props.getSpendGraphData(
			id,
			start_month,
			end_month,
			start_year,
			end_year
		);
		this.props.getUsageGraphData(
			id,
			start_month,
			end_month,
			start_year,
			end_year
		);
	}

	componentDidMount() {
		this.props.application?.app_id && this.updateGraphs();
		document.addEventListener(
			"mousedown",
			this.handleClickOutsideAuthDropdown
		);

		this.props?.application?.app_departments &&
			this.setState({
				appDepartments: this.props?.application?.app_departments,
			});

		this.setState({
			isAppArchived: this.props?.application?.app_archive || false,
			isViewer: this.context?.isViewer,
		});

		//Segment Implementation
		if (this.props.application?.app_name) {
			window.analytics.page("Applications", "Application-Overview", {
				app_name: this.props.application?.app_name,
				app_id: this.props.application?.app_id,
				orgId: getValueFromLocalStorage("userInfo")?.org_id || "",
				orgName: getValueFromLocalStorage("userInfo")?.org_name || "",
			});
		}
	}

	componentWillUnmount() {
		document.removeEventListener(
			"mousedown",
			this.handleClickOutsideAuthDropdown
		);
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.application?.app_id !== this.props.application?.app_id) {
			this.setState({ showHideSimilarApps: false });
			this.updateGraphs();
			this.props.allowScroll();
		}

		if (
			this.props.application &&
			this.props.application.app_auth_status !==
				prevProps.application?.app_auth_status
		) {
			this.setState({
				appstatus: this.props.application.app_auth_status,
			});
		}

		if (
			this.props.application &&
			this.props.application.app_type != prevProps.application?.app_type
		) {
			this.setState({ type: this.props.application.app_type });
		}
	}

	handleClickOutside(event) {
		if (
			this.container__overview__ref.current &&
			!this.container__overview__ref.current.contains(event.target)
		) {
			this.setState({
				showHide: false,
			});
		}
	}

	getAppLogo = (width) => {
		const logo = this.props.application?.app_logo;
		if (!logo) {
			return (
				<NameBadge
					name={this.props.application.app_name}
					borderRadius={50}
					width={width || 72}
				></NameBadge>
			);
		}
		if (logo && logo !== "") {
			return (
				<div
					className="background-contain background-no-repeat background-position-center"
					style={{
						backgroundImage: `url(${unescape(logo)})`,
						width: `${width || 72}px`,
						height: `${width || 72}px`,
					}}
				></div>
			);
		} else {
			return (
				<NameBadge
					name={this.props.application.app_name}
					borderRadius={50}
					width={width || 72}
				></NameBadge>
			);
		}
	};

	handleAppSubmit(application) {
		this.setState({
			appSubmitInProgress: true,
			appFormErrors: [],
			newAppData: application,
		});

		updateApplication(this.props.application.app_id, application)
			.then((res) => {
				if (res.error) {
					this.setState({
						appFormErrors: [res.error],
					});
				} else {
					this.setState({
						appFormErrors: [],
						showHideEdit: false,
					});
					this.props.allowScroll();
					this.props.onAppChange();
				}
				this.setState({
					appSubmitInProgress: false,
				});
			})
			.catch((err) => {
				console.log("Error updating application:", err);
				this.setState({
					appSubmitInProgress: false,
				});

				if (err && err.response && err.response.data) {
					this.setState({
						appFormErrors: err.response.data.errors || [],
					});
				}
			});
	}

	handleStatusUpdate(patchValue) {
		this.setState({ appstatus: patchValue });
		let data = {
			patches: [
				{
					...this.state.patchObj,
					field: "applicationState",
					value: patchValue,
				},
			],
		};
		patchApplication(this.state.AppId, data);

		//Segment Implementation
		window.analytics.track("Changed App Status", {
			currentCategory: "Applications",
			currentPageName: "Application-Overview",
			app_name: this.props.application?.app_name,
			app_id: this.props.application?.app_id,
			newAppStatus: patchValue,
			orgId: getValueFromLocalStorage("userInfo")?.org_id || "",
			orgName: getValueFromLocalStorage("userInfo")?.org_name || "",
		});
	}

	handleOnUpdate(key, val) {
		this.setState({ [key]: val });
		this.props.onAppChange();
		this.refreshReduxState();
	}

	commonSegmentTrack(message) {
		//Segment Implementation
		window.analytics.track(message, {
			currentCategory: "Applications",
			currentPageName: "Application-Overview",
			app_name: this.props.application?.app_name,
			app_id: this.props.application?.app_id,
			orgId: getValueFromLocalStorage("userInfo")?.org_id || "",
			orgName: getValueFromLocalStorage("userInfo")?.org_name || "",
		});
	}

	handleAuthClick() {
		this.setState({
			dropdownbuttonclicked: !this.state.dropdownbuttonclicked,
			editedAuth: true,
		});
		this.commonSegmentTrack("Clicked on App Status");
	}

	handleDepartments(departments) {
		departments.map((department) => {
			department.department_split = department.split_percent;
		});
		this.setState({
			appDepartments: departments,
		});
	}

	handleArchivingApp() {
		this.setState({
			showArchiveModal: !this.state.showArchiveModal,
		});
		this.commonSegmentTrack("Clicked on Archive App");
	}
	clickedOnAddContract() {
		window.open("/contract/new", "_self");

		this.commonSegmentTrack("Clicked on Add Contract");
	}
	clickedOnAddUser() {
		this.props.setShowAddUser(true);
		this.commonSegmentTrack("Clicked on User");
	}
	clickedOnAddTransaction() {
		this.props.setShowAddTransaction(true);
		//Segment Implementation
		window.analytics.page(
			"Applications",
			"Application-Overview; Add-New-Transaction",
			{
				orgId: getValueFromLocalStorage("userInfo")?.org_id || "",
				orgName: getValueFromLocalStorage("userInfo")?.org_name || "",
			}
		);
		this.commonSegmentTrack("Clicked on Add Transaction");
	}
	clickedOnMaptoApp() {
		this.setState({
			showMapAppModal: true,
		});
		this.commonSegmentTrack("Clicked on Map to App");
	}
	clickedOnUnmapApp(id) {
		this.commonSegmentTrack("Clicked on Unmap App");
		this.setState({ showUnmapModal: true });
	}
	clickedOnMergeWithAnotherApp() {
		this.setState({
			showMergeAppModal: true,
		});
		this.commonSegmentTrack("Clicked on Merge with another app");
	}
	handleUnArchivingApp() {
		try {
			unArchiveApplications([this.props.application?.app_id]).then(
				(res) => {
					if (res.status === "success") {
						this.setState({
							isAppArchived: false,
						});
						this.props.onAppChange();
						this.props.refreshAppTable &&
							this.props.refreshAppTable();
					} else {
						console.log(
							"UnExpceted response when unArchiving App",
							res
						);
					}
				}
			);
		} catch (error) {
			console.log("Error when unArchiving App ", error);
		}
		this.commonSegmentTrack("Clicked on unArchive App");
	}

	handleMergeComplete() {
		this.setState({
			showMergeAppModal: false,
			mergeTargetApp: null,
		});
		this.props.onAppChange();
		this.props.deleteApplicationCache();
		this.props.history.push(`/applications#allapps`);
	}

	refreshReduxState() {
		this.props.deleteApplicationCache();
	}

	clickedOnSimilarApps() {
		this.commonSegmentTrack("Clicked on Similar Apps");

		this.props.preventScroll();
		this.setState({
			showHideSimilarApps: true,
		});
	}

	clickedOnEdit() {
		this.commonSegmentTrack("Clicked on Edit App");

		this.props.preventScroll();
		this.setState({
			showHideEdit: true,
		});
	}

	clickedOnDepartmentSplitEdit() {
		this.commonSegmentTrack("Clicked on Edit Department Split");

		this.setState({
			showHideSplit: true,
		});
	}

	clickedOnReviewNow(recommendation) {
		const id = window.location.pathname.split("/")[2];
		let IdArray;
		IdArray = recommendation.users.map((el) => el.user_id);
		let metaData = {};
		metaData.filter_by = [
			{
				field_name: "User Id",
				filter_type: "objectId",
				field_values: IdArray,
				field_id: "user_id",
				negative: false,
				is_custom: false,
			},
		];
		this.props.redirectToAppUser(metaData, `${id}`);
	}
	render() {
		const id = window.location.pathname.split("/")[2];
		const { showHide } = this.state;
		let addCardClose = () => this.setState({ showHide: false });
		let addHideEditClose = () => {
			this.props.allowScroll();
			this.setState({ showHideEdit: false });
		};
		let similarAppsClose = () => {
			this.props.allowScroll();
			this.setState({ showHideSimilarApps: false });
		};
		let showHideSpiltClose = () => {
			this.setState({ showHideSplit: false });
		};

		const color = ["#2266E2", "#FF6767", "#5CAF53", "#FFB169", "#6967E0"];

		const { application } = this.props;
		const getRecommendationText = (recommendation, key) => {
			let textObject = {
				no_activity_in_30_days: `${
					recommendation.user_count > 1
						? `${recommendation.user_count} users have`
						: "1 user has"
				} been inactive on ${
					this.props.application?.app_name
				} for 30+ days`,
				low_usage: `${
					recommendation.user_count > 1
						? `${recommendation.user_count} users have`
						: "1 user has"
				} usage < 30% on ${
					this.props.application?.app_name
				} since last 30 days`,
				deprovisioned: `${
					recommendation.user_count > 1
						? `${recommendation.user_count} users are`
						: "1 user is"
				} marked inactive in SSO but not in ${
					this.props.application?.app_name
				}`,
			};

			return textObject[key];
		};
		return (
			<>
				{this.props.application ? (
					<>
						<div className="overview__container">
							<div className="overview__top__new">
								<div className="overview__topleft__new">
									<div
										style={{ maxHeight: 72 }}
										className="overview__logo d-flex align-items-center mt-1"
									>
										{this.getAppLogo()}
									</div>
									<div
										className="overview__logodata"
										style={{ marginLeft: "16px" }}
									>
										<div className="overview__logodata1">
											<div className="overview__logodata1__d1">
												{this.props.application
													? this.props.application
															?.app_name
													: ""}
											</div>
											<Dropdown>
												<Dropdown.Toggle
													as={
														this
															.auth_status_dropdown
													}
												>
													<img
														src={
															this.state.appstatus
																? authStatusObj?.[
																		this.state.appstatus?.replace(
																			/ /g,
																			"_"
																		)
																  ]?.image
																: authStatusObj
																		.needs_review
																		.image
														}
													/>
													<OverlayTrigger
														placement="top"
														overlay={
															<BootstrapTooltip>
																{this.state
																	.appstatus
																	? authStatusObj?.[
																			this.state.appstatus?.replace(
																				/ /g,
																				"_"
																			)
																	  ]
																			?.overviewTooltip
																	: authStatusObj
																			.needs_review
																			.overviewTooltip}
															</BootstrapTooltip>
														}
													>
														<div className="overview__dropdownbutton__d2 grey bold-normal text-capitalize">
															{this.state
																.appstatus ||
																"Needs Review"}
															<img
																className="ml-1"
																src={
																	dropdownarrow
																}
															/>
														</div>
													</OverlayTrigger>
												</Dropdown.Toggle>
												<Dropdown.Menu>
													<Dropdown>
														<Dropdown.Toggle
															as={
																managed_auth_status_dropdown
															}
														>
															<div className="d-flex flex-row align-items-center">
																<img
																	src={
																		authorised
																	}
																	width={
																		15.33
																	}
																/>
																<div className="overview__dropdownbutton__d2 bold-normal">
																	Managed
																</div>
																<img
																	src={
																		rightarrow
																	}
																	className="ml-4"
																/>
															</div>
														</Dropdown.Toggle>
														<Dropdown.Menu className="managed_auth_status_dropdown_menu">
															<Dropdown.Item
																onClick={() =>
																	this.handleStatusUpdate(
																		this
																			.authStatus
																			.CENTRALLY_MANAGED
																	)
																}
															>
																<div className="d-flex flex-row align-items-center">
																	<img
																		src={
																			authorised
																		}
																		width={
																			15.33
																		}
																	/>
																	<div className="overview__dropdownbutton__d2">
																		Centrally
																		Managed
																	</div>
																</div>
															</Dropdown.Item>
															<Dropdown.Item
																onClick={() =>
																	this.handleStatusUpdate(
																		this
																			.authStatus
																			.TEAM_MANAGED
																	)
																}
															>
																<div className="d-flex flex-row align-items-center">
																	<img
																		src={
																			teammanaged
																		}
																		width={
																			15.33
																		}
																	/>
																	<div className="overview__dropdownbutton__d2">
																		Team
																		Managed
																	</div>
																</div>
															</Dropdown.Item>
															<Dropdown.Item
																onClick={() =>
																	this.handleStatusUpdate(
																		this
																			.authStatus
																			.INDIVIDUALLY_MANAGED
																	)
																}
															>
																<div className="d-flex flex-row align-items-center">
																	<img
																		src={
																			individuallymanaged
																		}
																		width={
																			15.33
																		}
																	/>
																	<div className="overview__dropdownbutton__d2">
																		Individually
																		Managed
																	</div>
																</div>
															</Dropdown.Item>
														</Dropdown.Menu>
													</Dropdown>
													<Dropdown.Item
														onClick={() =>
															this.handleStatusUpdate(
																this.authStatus
																	.NEEDSREVIEW
															)
														}
													>
														<div className="d-flex flex-row align-items-center">
															<img
																src={
																	needsreview
																}
																width={15.33}
															/>
															<div className="overview__dropdownbutton__d2">
																Needs Review
															</div>
														</div>
													</Dropdown.Item>
													<Dropdown.Item
														onClick={() =>
															this.handleStatusUpdate(
																this.authStatus
																	.UNMANAGED
															)
														}
													>
														<div className="d-flex flex-row align-items-center">
															<img
																src={unmanaged}
																width={15.33}
															/>
															<div className="overview__dropdownbutton__d2">
																Unmanaged
															</div>
														</div>
													</Dropdown.Item>
													<Dropdown.Item
														onClick={() =>
															this.handleStatusUpdate(
																this.authStatus
																	.RESTRICTED
															)
														}
													>
														<div className="d-flex flex-row align-items-center">
															<img
																src={restricted}
																width={15.33}
															/>
															<div className="overview__dropdownbutton__d2">
																Restricted
															</div>
														</div>
													</Dropdown.Item>
												</Dropdown.Menu>
											</Dropdown>
										</div>
										<div className="overview__logodata2__new">
											{
												this.props.application
													.app_short_description
											}
										</div>
										<div className="overview__logodata3">
											<ShowMoreText
												lines={1}
												more="View more"
												less="View less"
												expanded={false}
												width={542}
											>
												{" "}
												<>
													{
														this.props.application
															?.app_description
													}
													<div className="overview__tags__div__cont">
														{this.props.application?.app_tags?.map(
															(el, index) => (
																<div className="overview__tags__div">
																	{el}
																</div>
															)
														)}
													</div>
												</>
											</ShowMoreText>
										</div>
									</div>
								</div>
								<div
									className="overview__topright"
									style={{ paddingTop: "24px" }}
								>
									{!this.props.application.app_is_custom ? (
										<button
											className="similar__apps__button mb-auto"
											onClick={this.clickedOnSimilarApps}
										>
											{
												this.props.application
													.alternate_apps_count
											}{" "}
											Alternative Apps
										</button>
									) : null}
									{this.state.showHideSimilarApps ? (
										<SimilarApps
											show={
												this.state.showHideSimilarApps
											}
											onHide={similarAppsClose}
											appName={
												this.props.application.app_name
											}
											appstatus={this.state.appstatus}
											appSmallDescription={
												this.props.application
													.app_short_description
											}
											appLogo={
												this.props.application.app_logo
											}
											appId={
												this.props.application.app_id
											}
										></SimilarApps>
									) : null}
									<>
										{!this.state.isViewer && (
											<button
												type="submit"
												className="overview__editbutton mb-auto"
												onClick={this.clickedOnEdit}
											>
												<span id="overview__text1">
													Edit
												</span>
											</button>
										)}
										{this.state.showHideEdit && (
											<AppEdit
												application={
													this.props.application
												}
												submitting={
													this.state
														.appSubmitInProgress
												}
												show={this.state.addHideEdit}
												validationErrors={
													this.state.appFormErrors
												}
												onHide={addHideEditClose}
												onSubmit={this.handleAppSubmit.bind(
													this
												)}
											/>
										)}
									</>
									{!this.state.isViewer && (
										<Dropdown className="ml-2 mb-auto mt-1">
											<Dropdown.Toggle as={ellipsis} />

											<Dropdown.Menu>
												<Dropdown.Item
													onClick={
														this
															.clickedOnAddContract
													}
												>
													Add Contract
												</Dropdown.Item>
												<Dropdown.Item
													onClick={
														this.clickedOnAddUser
													}
												>
													Add Users
												</Dropdown.Item>
												<Dropdown.Item
													onClick={
														this
															.clickedOnAddTransaction
													}
												>
													Add Transactions
												</Dropdown.Item>
												<Dropdown.Divider className="mx-3 my-1" />
												{this.props.application
													?.app_parent_id != null &&
													this.props.application
														?.app_parent_id !=
														"" && (
														<Dropdown.Item
															onClick={() =>
																this.clickedOnUnmapApp(
																	this.state
																		.AppId
																)
															}
														>
															Unmap app
														</Dropdown.Item>
													)}
												<Dropdown.Item
													onClick={
														this.clickedOnMaptoApp
													}
												>
													Map to a different app
												</Dropdown.Item>
												<Dropdown.Item
													onClick={
														this
															.clickedOnMergeWithAnotherApp
													}
												>
													Merge with another app
												</Dropdown.Item>
												<Dropdown.Divider className="mx-3 my-1" />
												{!this.state.isAppArchived ? (
													<Dropdown.Item
														onClick={
															this
																.handleArchivingApp
														}
													>
														Archive App
													</Dropdown.Item>
												) : (
													<Dropdown.Item
														onClick={
															this
																.handleUnArchivingApp
														}
													>
														Un-archive App
													</Dropdown.Item>
												)}
												<Dropdown.Item
													onClick={() => {
														this.props.getApplicationHistory(
															this.props
																.application
																.app_id
														);
														this.setState({
															showActionHistory: true,
														});
														//Segment Implementation
														window.analytics.track(
															"Clicked on View Action History",
															{
																currentCategory:
																	"Applications",
																currentPageName:
																	"Application-Overview",
																app_name:
																	this.props
																		.application
																		?.app_name,
																app_id: this
																	.props
																	.application
																	?.app_id,
																orgId:
																	getValueFromLocalStorage(
																		"userInfo"
																	)?.org_id ||
																	"",
																orgName:
																	getValueFromLocalStorage(
																		"userInfo"
																	)
																		?.org_name ||
																	"",
															}
														);
													}}
												>
													View Action History
												</Dropdown.Item>
											</Dropdown.Menu>
										</Dropdown>
									)}
									{this.state.showActionHistory &&
										this.props.actionHistory && (
											<ActionLogHistory
												actionHistory={
													this.props.actionHistory
												}
												onHide={() =>
													this.setState({
														showActionHistory: false,
													})
												}
												historyType="app"
											/>
										)}
									{this.state.showMapAppModal && (
										<MapToApp
											show={this.state.showMapAppModal}
											application={this.props.application}
											onMapComplete={() => {
												this.setState({
													showMapAppModal: false,
												});
												this.props.onAppChange();
											}}
											onMergeClick={(targetApp) => {
												this.setState({
													mergeTargetApp: targetApp,
													showMapAppModal: false,
													showMergeAppModal: true,
												});
											}}
											onHide={() => {
												this.setState({
													showMapAppModal: false,
												});
											}}
										/>
									)}
									{this.state.showUnmapModal && (
										<UnmapConfirmation
											show={this.state.showUnmapModal}
											onClose={() =>
												this.setState({
													showUnmapModal: false,
												})
											}
											onAppChange={() =>
												this.props.onAppChange()
											}
											app_id={
												this.props.application?.app_id
											}
											app_name={
												this.props.application?.app_name
											}
										/>
									)}
									{this.state.showMergeAppModal && (
										<MergeApps
											show={this.state.showMergeAppModal}
											application={this.props.application}
											targetApp={
												this.state.mergeTargetApp
											}
											onMergeComplete={() =>
												this.handleMergeComplete()
											}
											onHide={() => {
												this.setState({
													showMergeAppModal: false,
													mergeTargetApp: null,
												});
											}}
										/>
									)}

									{this.state.showArchiveModal && (
										<ArchiveModal
											isOpen={this.state.showArchiveModal}
											ArchiveFunc={archiveApplications}
											successResponse={() => {
												this.setState({
													isAppArchived: true,
												});
												this.props.onAppChange();
												this.props.refreshAppTable &&
													this.props.refreshAppTable();
											}}
											closeModal={() => {
												this.setState({
													showArchiveModal: false,
												});
											}}
											name={
												this.props.application?.app_name
											}
											type="app"
											id={this.props.application?.app_id}
										/>
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
							></hr>
							<div className="overview__top__next">
								<div className="overview__top__next__ins">
									<div className="overview__top__next__ins1">
										Active Users
									</div>
									<div className="overview__top__next__ins2">
										<div>
											<img
												src={overview_live_users}
											></img>
										</div>
										<div className="overviewins__top__next__instext">
											{
												this.props.application
													?.app_active_users?.count
											}
										</div>
										{this.props.application
											?.app_active_users?.change_count >=
										0 ? (
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
										<div className="overviewins__top__next__insvalue">
											{Math.abs(
												this.props.application
													?.app_active_users
													?.change_count
											)}
										</div>
										<div className="overviewins__top__next__instext2">
											in{" "}
											{
												MONTH[
													this.props.application
														?.app_active_users
														?.month_id - 1
												]
											}
										</div>
									</div>
								</div>
								<div className="overview__top__next__ins">
									<div className="overview__top__next__ins1">
										Monthly Spend
									</div>
									<div className="overview__top__next__ins2">
										<div style={{ marginTop: "4px" }}>
											<img src={overview2}></img>
										</div>
										<div className="overview__top__next__instext">
											{kFormatter(
												Math.abs(
													this.props.application
														?.app_monthly_spend
														?.monthly_spend
												) || 0
											)}
										</div>
										{this.props.application
											?.app_monthly_spend?.change >= 0 ? (
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
										<div className="overview__top__next__instext2">
											{kFormatter(
												Math.abs(
													this.props.application
														?.app_monthly_spend
														?.change
												) || 0
											)}
										</div>
										<div className="overviewins__top__next__instext2">
											in{" "}
											{
												MONTH[
													this.props.application
														?.app_active_users
														?.month_id - 1
												]
											}
										</div>
									</div>
								</div>
								<div className="overview__top__next__ins">
									<div className="overview__top__next__ins1">
										Est Cost [YTD]
									</div>
									<div className="overview__top__next__ins2">
										<div style={{ marginTop: "4px" }}>
											<img src={overview2}></img>
										</div>
										<div className="overview__top__next__instext">
											{kFormatter(
												Math.abs(
													this.props.application
														?.app_cost?.cost_YTD
												) || 0
											)}
										</div>
										{this.props.application?.app_cost
											?.change >= 0 ? (
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
										<div className="overview__top__next__instext2">
											{kFormatter(
												Math.abs(
													this.props.application
														?.app_cost?.change
												) || 0
											)}
										</div>
										<div className="overviewins__top__next__instext2">
											in{" "}
											{
												MONTH[
													this.props.application
														?.app_active_users
														?.month_id - 1
												]
											}
										</div>
									</div>
								</div>
								<div className="overview__top__next__ins">
									<div className="overview__top__next__ins1">
										Average Usage
									</div>
									<div className="overview__top__next__ins2">
										<div>
											<img src={overview3}></img>
										</div>
										<div className="overview__top__next__instext">
											{isNaN(
												parseInt(
													this.props.application
														?.app_average_usage
														?.avg_usage
												)
											)
												? 0
												: this.props.application?.app_average_usage?.avg_usage?.toFixed(
														0
												  )}
											%
										</div>
										{this.props.application
											?.app_average_usage?.change >= 0 ? (
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
										<div className="overviewins__top__next__insvalue">
											{this.props.application
												?.app_average_usage?.change > 0
												? (this.props.application?.app_average_usage?.change.toFixed(
														2
												  ) || 0) + "%"
												: -1 *
														(isNaN(
															parseInt(
																this.props
																	.application
																	?.app_average_usage
																	?.change
															)
														)
															? 0
															: this.props.application?.app_average_usage?.change.toFixed(
																	2
															  )) +
												  "%"}
										</div>
										<div className="overviewins__top__next__instext2">
											in{" "}
											{
												MONTH[
													this.props.application
														?.app_active_users
														?.month_id - 1
												]
											}
										</div>
									</div>
								</div>
								<div className="overview__top__next__ins">
									<div className="overview__top__next__ins1">
										Total Users
									</div>
									<div className="overview__top__next__ins2">
										<div>
											<img src={overview1}></img>
										</div>
										<div className="overviewins__top__next__instext">
											{
												this.props.application
													?.app_total_users
													?.users_count
											}
										</div>
										{this.props.application?.app_total_users
											?.change >= 0 ? (
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
										<div className="overviewins__top__next__insvalue">
											{Math.abs(
												this.props.application
													?.app_total_users?.change
											)}
										</div>
										<div className="overviewins__top__next__instext2">
											in{" "}
											{
												MONTH[
													this.props.application
														?.app_total_users
														?.month_id - 1
												]
											}
										</div>
									</div>
								</div>
								<div className="overview__top__next__ins">
									<RenewalWidget
										application={this.props.application}
										onRenewalAdded={this.props.onAppChange}
									/>
								</div>
							</div>
							<hr
								style={{
									marginLeft: "40px",
									marginRight: "40px",
									marginTop: "0px",
									marginBottom: "0px",
								}}
							></hr>
						</div>
						<div className="overview__middle">
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
											Type
										</div>
										<InlineUpdateField
											value={this.state.type}
											name="type"
											onUpdate={(val) =>
												this.handleOnUpdate("type", val)
											}
										/>
									</div>
									<div
										className="overview__middle__topcont"
										style={{ flexBasis: "30%" }}
									>
										<div className="overview__middle__topconttext">
											Owner
										</div>
										<ChangeOwner
											updateFunc={(appId, patchObj) =>
												updateAppOwner(
													appId,
													Array.isArray(
														patchObj?.patches
													)
														? patchObj.patches[0]
																.value
														: ""
												)
											}
											userId={
												this.props.application
													?.app_owner?.owner_id
											}
											userName={
												this.props.application
													?.app_owner?.owner_name
											}
											fieldName={"owner"}
											userImage={
												this.props.application
													?.app_owner
													?.owner_profile_img
											}
											page={"appOverview"}
											refreshReduxState={() => {
												this.refreshReduxState();
												this.props.onAppChange();
											}}
											userAccountType={
												this.props.application
													?.app_owner?.account_type
											}
										/>
									</div>
									<div
										className="overview__middle__topcont"
										style={{ flexBasis: "30%" }}
									>
										<div className="overview__middle__topconttext">
											Category
										</div>

										<CategoryFormatter
											data={application}
											handleRefresh={
												this.refreshReduxState
											}
										></CategoryFormatter>
									</div>
									<div
										className="overview__middle__topcont"
										style={{ flexBasis: "20%" }}
									>
										<div className="overview__middle__topconttext">
											Auto Renew
										</div>
										<ChangeRenewal
											status={
												this.props.application
													?.app_autorenew
											}
											refreshPage={() => {
												this.props.onAppChange();
												this.refreshReduxState();
											}}
										></ChangeRenewal>
									</div>
									<div
										className="overview__middle__topcont"
										style={{ flexBasis: "15%" }}
									>
										<div className="overview__middle__topconttext">
											Status
										</div>
										<ChangeStatus
											disableEdit={true}
											status={
												this.props?.application
													?.app_archive ||
												this.state.isAppArchived
													? "archived"
													: this.props.application
															?.app_status
											}
										></ChangeStatus>
									</div>
									<div
										className="overview__middle__topcont"
										style={{ flexBasis: "15%" }}
									>
										<div className="overview__middle__topconttext">
											Risk
										</div>
										<RiskIcon
											showLable={true}
											riskValue={
												this.props.appSecurityData
													?.manual_risk_level
													? this.props.appSecurityData
															?.manual_risk_level
													: this.props.appSecurityData
															?.risk_level
											}
											className={
												"font-12 text-capitalize"
											}
											dataUnavailableStyle={{
												marginTop: "3px",
											}}
										/>
									</div>
									<div
										className="overview__middle__topcont"
										style={{ flexBasis: "15%" }}
									>
										<div className="overview__middle__topconttext">
											Threat
										</div>
										{!this.props.appSecurityData?.threat ? (
											<div
												className="font-12 grey-1 o-6"
												style={{ marginTop: "3px" }}
											>
												Data Unavailable
											</div>
										) : (
											<div className="d-flex flex-row">
												<Rating
													rating={
														this.props
															.appSecurityData
															?.threat || 0
													}
													iconType="scope"
													width={12}
													height={15}
													showValueInsideIcon={true}
													valueTopPosition={"0.9px"}
													valueLeftPosition={"3.1px"}
												/>
												<div className="font-12 pl-3">
													{`Level ${
														this.props
															.appSecurityData
															?.threat || 0
													}`}
												</div>
											</div>
										)}
									</div>
									<div
										className="overview__middle__topcont"
										style={{ flexBasis: "25%" }}
									>
										<div className="overview__middle__topconttext">
											Active contracts
										</div>
										<span style={{ fontSize: 13 }}>
											{application.app_active_contracts}
										</span>
									</div>

									<CustomFieldSectionInOverview
										className="overview__middle__topcont mb-4 mr-4"
										style={{ minWidth: 180 }}
										of={CUSTOM_FIELD_ENTITY.APPLICATIONS}
										segmentCategory={"Application"}
										customFieldData={
											this.props.application
												?.app_custom_fields || []
										}
										updateService={patchApplication.bind(
											null,
											this.props.application?.app_id
										)}
										refreshPage={() => {
											this.props.onAppChange();
											this.refreshReduxState();
										}}
									/>
								</div>
								<div
									className={`overview__middle__left__bottom__new ${
										this.state.isAppArchived ||
										this.props.application?.app_archive
											? "disabledState"
											: ""
									}`}
									style={{ marginTop: "6.5px" }}
								>
									<div className="overview__middle__left__bottom__new__d1">
										<div className="overview__middle__left__bottom__new__d1__left">
											Departments - Split based on total
											users
										</div>
										<div className="overview__middle__left__bottom__new__d1__right__div">
											{!this.state.isViewer && (
												<button
													className="overview__middle__left__bottom__new__d1__right"
													onClick={
														this
															.clickedOnDepartmentSplitEdit
													}
												>
													Edit
												</button>
											)}
										</div>
									</div>
									<div className="overview__middle__left__bottom__new__d2">
										<div className="overview__middle__left__bottom__new__d2__d1">
											{kFormatter(
												this.props.application
													?.app_previous_year_dept_spend
											)}
										</div>
										<div className="overview__middle__left__bottom__new__d2__d2">
											Spend(YTD)
										</div>
									</div>
									<div className="overview__middle__left__bottom__newgraphcont">
										<NewGraph
											data={this.state?.appDepartments}
										></NewGraph>
										<div className="overview__middle__left__bottom__newgraph__d2">
											{this.state?.appDepartments?.map(
												(element, index) => (
													<DepartmentCard
														key={index}
														element={element}
														color={getColor(
															index,
															this.state
																?.appDepartments
																?.length
														)}
													/>
												)
											)}
										</div>
									</div>
								</div>
								{this.state.showHideSplit && (
									<Split
										info={
											this.state?.appDepartments ||
											this.props.application
												?.app_departments
										}
										show={this.state.showHideSplit}
										app_name={
											this.props.application.app_name
										}
										handleClose={showHideSpiltClose}
										handleDepartments={
											this.handleDepartments
										}
									></Split>
								)}
								<NotesList
									className="mt-4"
									notes={this.props.application.app_notes}
									entity={{
										id: this.props.application.app_id,
										name: this.props.application.app_name,
										image: this.props.application.app_logo,
										type: "application",
									}}
								/>
							</div>
							<div
								className="overview__middle__right ml-4"
								style={{ marginTop: "28px" }}
							>
								{this.props.loadingRecommendation ? (
									<>
										<div className="overview__middle__right__bottom">
											<div className="overview__middle__right__bottom_1">
												<div
													style={{
														paddingTop: 20,
														paddingLeft: 16,
													}}
													className="overview__middle__right__bottom_1left"
												>
													<ContentLoader
														width={40}
														height={40}
													>
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
													style={{
														marginLeft: "12px",
													}}
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
									</>
								) : (
									<>
										{" "}
										<div className="overview__middle__right__top">
											{this.context?.partner?.name}{" "}
											Recommends
										</div>
										{Array.isArray(
											this.props.appRecommendations
										) &&
										this.props.appRecommendations.length >
											0 ? (
											<>
												<div className="overview__middle__right__bottom">
													<div className="overview__middle__right__bottom_1">
														<div className="overview__middle__right__bottom_1left">
															{this.getAppLogo(
																40
															)}
														</div>
														<div
															className="overview__middle__right__bottom_1right"
															style={{
																marginLeft:
																	"12px",
															}}
														>
															<div>
																<span className="overview__middle__righttext1">
																	{
																		APPLICATION_RECOMMENDATION_HEADER_TEXT[
																			Object.keys(
																				this
																					.props
																					.appRecommendations[0]
																			)[0]
																		]
																	}
																</span>
															</div>
															<div>
																<span className="overview__middle__righttext2">
																	{getRecommendationText(
																		this
																			.props
																			.appRecommendations?.[0][
																			Object.keys(
																				this
																					.props
																					.appRecommendations?.[0]
																			)[0]
																		],
																		Object.keys(
																			this
																				.props
																				.appRecommendations[0]
																		)[0]
																	)}
																</span>
															</div>
															<div
																className="d-flex align-items-center"
																style={{
																	marginTop:
																		"5px",
																}}
															>
																<img
																	src={
																		savingsarrow
																	}
																></img>
																<div className="bold-600 font-12 ml-1">
																	{kFormatter(
																		this
																			.props
																			.appRecommendations?.[0][
																			Object.keys(
																				this
																					.props
																					.appRecommendations?.[0]
																			)[0]
																		]
																			?.savings
																	)}
																</div>
																<div className="o-5 grey-1 font-12 ml-1">
																	in Potential
																	Savings
																</div>
															</div>
															<div
																className="font-13 cursor-pointer bold-600 primary-color"
																style={{
																	marginTop:
																		"10px",
																}}
																onClick={() =>
																	this.clickedOnReviewNow(
																		this
																			.props
																			.appRecommendations?.[0][
																			Object.keys(
																				this
																					.props
																					.appRecommendations?.[0]
																			)[0]
																		]
																	)
																}
															>
																REVIEW NOW
															</div>
														</div>
													</div>
													{this.props
														.appRecommendations
														.length > 1 && (
														<Link
															to={`/applications/${this.props.application.app_id}#recommendations`}
															style={{
																marginRight:
																	"40px",
															}}
														>
															<button
																className="overview__middle__right__bottom_3 w-100"
																type="submit"
															>
																<span
																	style={{
																		color: " #2266E2",
																	}}
																>
																	Show More
																</span>
															</button>
														</Link>
													)}
												</div>
											</>
										) : (
											<div className="overview_no_recommendations">
												<img
													src={noRecommendations}
													width={125}
													height={70}
												/>
												<div className="text-align-center o-6">
													There are no recommendations
													for{" "}
													{
														this.props.application
															.app_name
													}
												</div>
												<div className="text-capitalize o-6"></div>
											</div>
										)}
									</>
								)}
							</div>
						</div>
						<div
							style={{
								padding: "0px 40px",
								marginBottom: "30px",
							}}
						>
							<div className="mt-5">Actual Spend vs Est Cost</div>
							<div className="spendvscost__exterior__cont">
								<SpendVSCostGraph
									graphHeight={"226px"}
									calendarContainerClassName="app-vendor-overview-date-range-calendar"
									graphAPI={getApplicationSpendVSEstCostGraph}
									id={id}
								/>
							</div>
						</div>
						<div
							className={`overview__bottom ${
								this.state.isAppArchived ||
								this.props.application?.app_archive
									? "disabledState"
									: ""
							}`}
						>
							<div className="overview__bottom__up mt-4">
								<div>Department wise Spend</div>
								{this.props.computed_data.spendLoading ? (
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
								) : this.props.computed_data
										.showSpendEmptyState ? (
									<div
										style={{
											marginTop: "16px",
											padding: "20px 0px",
										}}
										className="allapps__spendgraph"
									>
										<div className="allapps__spendgraph__d1">
											<ResponsiveContainer width="95%">
												<AreaChart
													data={
														this.props.computed_data
															.spendData
													}
													margin={{
														top: 22,
														right: 0,
														left: 15,
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
															kFormatter(tick)
														}
														tickLine={false}
														axisLine={false}
														interval={0}
														width={45}
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
													{Array.isArray(
														this.props.computed_data
															.spendDataKeys
													) &&
														this.props.computed_data
															.spendDataKeys
															.length > 0 &&
														this.props.computed_data.spendDataKeys.map(
															(
																dataKey,
																index
															) => {
																if (
																	Array.isArray(
																		dataKey
																	) &&
																	dataKey.length >
																		2
																) {
																	return (
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
																	);
																}
															}
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
															this.props
																.application
																?.app_monthly_spend
																? this.props
																		.application
																		?.app_monthly_spend
																		.monthly_spend
																: 0
														)}
													</div>
													{this.props.application
														?.app_monthly_spend
														?.change >= 0 ? (
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
															this.props
																.application
																?.app_monthly_spend
																? Math.abs(
																		this
																			.props
																			.application
																			?.app_monthly_spend
																			.change
																  )
																: 0
														)}
													</div>
													<div className="ov__d5__d2__d1__d1__d1__d3">
														in{" "}
														{
															MONTH[
																this.props
																	.application
																	?.app_active_users
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
										</div>
										<div className="allapps__spendgraph__d2">
											<TableNew2
												data={
													this.props.computed_data
														.spendTable
												}
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
												onClick={() =>
													this.props.history.push(
														"/transactions#recognised"
													)
												}
												type="button"
												className="btn btn-outline-primary emptyDocButton"
												style={{
													width: "max-content",
													marginTop: "5px",
												}}
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
							<div className="overview__bottom__down my-4">
								<div>Department wise Usage</div>
								{this.props.usage_computed_data.usageLoading ? (
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
								) : this.props.usage_computed_data
										.showUsageEmptyState ? (
									<div
										style={{
											marginTop: "16px",
											padding: "20px 0px",
										}}
										className="allapps__spendgraph"
									>
										<div className="allapps__spendgraph__d1">
											<ResponsiveContainer width="95%">
												<AreaChart
													data={
														this.props
															.usage_computed_data
															.usageData
													}
													margin={{
														top: 22,
														right: 0,
														left: 9,
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
														width={50}
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
													{this.props.usage_computed_data.usageDataKeys.map(
														(dataKey, index) => (
															<Area
																key={dataKey[0]}
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
														{this.props.application
															?.app_average_usage
															?.avg_usage
															? Number(
																	isNaN(
																		parseInt(
																			this
																				.props
																				.application
																				?.app_average_usage
																				?.avg_usage
																		)
																	)
																		? 0
																		: this.props.application?.app_average_usage?.avg_usage.toFixed(
																				1
																		  )
															  )
															: 0}
														%
													</div>
													{this.props.application
														?.app_average_usage
														?.change >= 0 ? (
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
														{Number(
															this.props
																.application
																?.app_average_usage
																? Math.abs(
																		isNaN(
																			parseInt(
																				this
																					.props
																					.application
																					?.app_average_usage
																					?.change
																			)
																		)
																			? 0
																			: this.props.application?.app_average_usage?.change.toFixed(
																					1
																			  )
																  )
																: 0
														)}
														%
													</div>
													<div className="ov__d5__d2__d1__d1__d1__d3">
														{" "}
														in{" "}
														{
															FULL_MONTH[
																this.props
																	.application
																	?.app_active_users
																	?.month_id -
																	1
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
                              <option selected> Department </option>
                              <option>Category</option>
                            </select>
                          </div> */}
										</div>
										<div className="allapps__spendgraph__d2">
											<TableNew3
												data={
													this.props
														.usage_computed_data
														.usageTable
												}
											></TableNew3>
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
											<img
												src={noData}
												className="m-auto"
											/>
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
													this.props.history.push(
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
					</>
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
								<div className="overview__topright"></div>
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
											<ContentLoader
												width={76}
												height={9}
											>
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
											<ContentLoader
												width={108}
												height={12}
											>
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
											<ContentLoader
												width={76}
												height={9}
											>
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
											<ContentLoader
												width={108}
												height={12}
											>
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
											<ContentLoader
												width={76}
												height={9}
											>
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
											<ContentLoader
												width={108}
												height={12}
											>
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
											<ContentLoader
												width={76}
												height={9}
											>
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
											<ContentLoader
												width={108}
												height={12}
											>
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
											<ContentLoader
												width={76}
												height={9}
											>
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
											<ContentLoader
												width={108}
												height={12}
											>
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
								className="overview__middle__right ml-4"
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
											<ContentLoader
												width={40}
												height={40}
											>
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
				{this.state.appFormErrors.length > 0 &&
					this.state.showHideEdit && (
						<ErrorScreen
							isOpen={
								this.state.appFormErrors.length > 0 &&
								this.state.showHideEdit
							}
							closeModal={() => {
								this.setState({
									appFormErrors: [],
								});
							}}
							isSuccess={!this.state.appFormErrors.length > 0}
							loading={this.state.appSubmitInProgress}
							successMsgHeading={
								"Application edited successfully!"
							}
							warningMsgHeading={
								"The application could not be edited."
							}
							warningMsgDescription={
								"An error occured while adding new application. Would you like to retry?"
							}
							retryFunction={() => {
								this.handleAppSubmit(this.state.newAppData);
							}}
						/>
					)}
			</>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		preventScroll: () => {
			dispatch(preventScroll());
		},
		allowScroll: () => {
			dispatch(allowScroll());
		},
		setShowAddContract: (value) => {
			dispatch({
				type: applicationConstants.TOGGLE_ADD_CONTRACT,
				payload: value,
			});
		},

		getSpendGraphData: (
			id,
			start_month,
			end_month,
			start_year,
			end_year
		) => {
			dispatch(
				fetchSpendGraphData(
					id,
					start_month,
					end_month,
					start_year,
					end_year
				)
			);
		},
		getUsageGraphData: (
			id,
			start_month,
			end_month,
			start_year,
			end_year
		) => {
			dispatch(
				fetchUsageGraphData(
					id,
					start_month,
					end_month,
					start_year,
					end_year
				)
			);
		},
		setShowAddContract: (value) => {
			dispatch({
				type: applicationConstants.TOGGLE_ADD_CONTRACT,
				payload: value,
			});
		},
		setShowAddUser: (value) => {
			dispatch({
				type: applicationConstants.TOGGLE_ADD_USER,
				payload: value,
			});
		},
		setShowAddTransaction: (value) => {
			dispatch({
				type: applicationConstants.TOGGLE_ADD_TRANSACTION,
				payload: value,
			});
		},
		getApplicationHistory: (appId) => {
			dispatch(fetchApplicationActionHistory(appId));
		},
		deleteApplicationCache: () => {
			dispatch({
				type: applicationConstants.DELETE_APPLICATIONS_CACHE,
			});
			dispatch(fetchAllApplications(0));
		},
		redirectToAppUser: (metaData, pathname) => {
			dispatch(
				push(`${pathname}?metaData=${JSON.stringify(metaData)}#users`)
			);
		},
	};
};

function mapStateToProps(state) {
	const pathname = window.location.pathname;
	const id = pathname.split("/")[2];
	if (
		state.applications.allApplications[id]?.spendgraph &&
		state.applications.allApplications[id]?.usagegraph
	) {
		return {
			computed_data:
				state.applications.allApplications[id]?.spendgraph
					?.computed_data,
			usage_computed_data:
				state.applications.allApplications[id]?.usagegraph
					?.usage_computed_data,
			actionHistory: state.applicationActionHistory,
		};
	} else {
		return {
			computed_data: state?.applications?.spendgraph?.computed_data,
			usage_computed_data:
				state?.applications?.usagegraph?.usage_computed_data,
			actionHistory: state?.applicationActionHistory,
		};
	}
}

export const Overview = connect(
	mapStateToProps,
	mapDispatchToProps
)(OverviewComp);
