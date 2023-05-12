import React, { useContext, useEffect, useRef, useState } from "react";
import search from "../../../../assets/search.svg";
import { PageHeader } from "../../../shared/components/PageHeader/PageHeader";
import refresh_icon from "../../../../assets/icons/refresh.svg";
import rc1 from "../../../../assets/reports/rc1.svg";
import { getAllDepartments } from "../../../../services/api/departments";
import rc2 from "../../../../assets/reports/rc2.svg";
import rc3 from "../../../../assets/reports/rc3.svg";
import rc4 from "../../../../assets/reports/rc4.svg";
import rc5 from "../../../../assets/reports/rc5.svg";
import rc6 from "../../../../assets/reports/rc6.svg";
import rc7 from "../../../../assets/reports/rc7.svg";
import rc8 from "../../../../assets/reports/rc8.svg";
import rc9 from "../../../../assets/reports/rc9.svg";
import rc10 from "../../../../assets/reports/rc10.svg";
import rc11 from "../../../../assets/reports/rc11.svg";
import rc12 from "../../../../assets/reports/rc12.svg";
import rc13 from "../../../../assets/reports/rc13.svg";
import rc14 from "../../../../assets/reports/rc14.svg";
import rc15 from "../../../../assets/reports/rc15.svg";
import rc16 from "../../../../assets/reports/rc16.svg";
import rc17 from "../../../../assets/reports/rc17.svg";
import rc18 from "../../../../assets/reports/rc18.svg";
import rc19 from "../../../../assets/reports/rc19.svg";
import rc20 from "../../../../assets/reports/rc20.svg";
import rc21 from "../../../../assets/reports/rc21.svg";
import rc22 from "../../../../assets/reports/rc22.svg";
import rc23 from "../../../../assets/reports/rc23.svg";
import rc24 from "../../../../assets/reports/rc24.svg";
import rc25 from "../../../../assets/reports/rc25.svg";
import rc26 from "../../../../assets/reports/rc26.svg";
import rc27 from "../../../../assets/reports/rc27.svg";
import rc28 from "../../../../assets/reports/rc28.svg";
import rc29 from "../../../../assets/reports/rc29.svg";
import rc30 from "../../../../assets/reports/rc30.svg";
import rc31 from "../../../../assets/reports/rc31.svg";
import rc32 from "../../../../assets/reports/rc32.svg";
import upcomingRenewals from "../../../../assets/reports/upcomingRenewals.svg";

import { CategoryLoader } from "../../components/CategoryLoader/CategoryLoader";
import { EmptySearch } from "../../../../common/EmptySearch";
import { ReportCardLoader } from "../../components/ReportCardLoader/ReportCardLoader";
import { ReportCard } from "../../components/ReportCard/ReportCard";
import {
	exportAlternateAppsCSV,
	exportAppCost,
	exportDepartmentSpend,
	exportDeptCost,
	exportSecurityComplianceReport,
	exportUpcomingRenewals,
	exportUserCost,
	getAllApplicationsV1,
} from "../../../../services/api/applications";
import { getPaymentMethods } from "../../../../services/api/transactions";
import { Helmet } from "react-helmet";
import "./Reports.css";
import calendarClock from "../../../../assets/calendarClock.svg";
import ScheduleReportsTableModal from "../../components/Modals/ScheduleReportsTableModal";
import RoleContext from "../../../../services/roleContext/roleContext";
import UnauthorizedToView from "../../../../common/restrictions/UnauthorizedToView";
import { userRoles } from "../../../../constants/userRole";
import { exportDepartmentCSV } from "../../../../services/api/departments";
import {
	exportUserActivityforAllApps,
	exportUserCSV,
	exportLicenseOptimizationforAllApps,
	exportInactiveUsersReport,
} from "../../../../services/api/users";
import {
	exportApplicationsCSV,
	exportApplicationUserCSV,
	exportMonthWiseSpendCSV,
	exportOptimizationSummaryReport,
} from "../../../../services/api/applications";
import { exportRecognisedTransCSV } from "../../../../services/api/transactions";
import HeaderTitleBC from "../../../../components/HeaderTitleAndGlobalSearch/HeaderTitleBC";
import { getValueFromLocalStorage } from "utils/localStorage";

export function Reports(props) {
	const { userRole, partner } = useContext(RoleContext);

	let textWise;
	if (partner?.name === "Tangoe") textWise = "wide";
	else textWise = "wise";

	const categories = [
		{
			id: 1,
			Name: "All Reports",
		},
		{
			id: 2,
			Name: "Organization Data",
		},
		{
			id: 3,
			Name: "Workable Insights",
		},
		{
			id: 4,
			Name: "Spend Reports",
		},
		{
			id: 5,
			Name: "Usage Reports",
		},
	];
	const reports = [
		{
			id: 1,
			cat: "Organization Data",
			name: "List of Apps",
			description:
				"This report contains the list of all SaaS applications along with their Metadata like Name, Owner, Category of the application etc.",
			filters: [],
			columns: [
				"app_name",
				"app_owner_name",
				"app_category_name",
				"app_user_count",
				"app_spend",
				"app_usage",
				"app_type",
			],
			url: rc1,
			isPublished: true,
			reportMailDesc: `The report containing all applications data from your ${partner?.name} dashboard is ready to download.`,
			entity: "applications",
			exportApiEndpoint: exportApplicationsCSV,
		},
		{
			id: 2,
			cat: "Organization Data",
			name: "List of Users",
			description:
				"This report contains details about an employee(User Name, Department, Email ID, Number of Apps used)",
			filters: [],
			columns: [
				"user_name",
				"user_department_name_path",
				"user_email",
				"user_app_count",
			],
			url: rc2,
			isPublished: true,
			reportMailDesc: `The report containing all user information from your ${partner?.name} dashboard is ready to download.`,
			entity: "users",
			exportApiEndpoint: exportUserCSV,
		},
		{
			id: 3,
			cat: "Organization Data",
			name: "List of Departments",
			description:
				"This report contains the details regarding department information(Department Name, Head of the Department, Total Users, Spending and applications used)",
			filters: [],
			columns: [
				"dept_name_path",
				"dept_head_name",
				"dept_user_count",
				"dept_budget_spend",
				"dept_app_count",
			],
			url: rc3,
			isPublished: true,
			reportMailDesc: `The report containing all department information from you ${partner?.name} dashboard is ready to download.`,
			entity: "departments",
			exportApiEndpoint: exportDepartmentCSV,
		},
		{
			id: 4,
			cat: "Organization Data",
			name: "List of Transactions",
			description:
				"This report contains the transaction details( Transaction date, Description, Application name, Payment method). You can filter the data based on month, application name & payment method.",
			filters: ["Month", "App Name", "Payment Method", "Date Range"],
			columns: [
				"transaction_date",
				"transaction_description",
				"app_name",
				"payment_method_name",
			],
			url: rc4,
			isPublished: true,
			reportMailDesc: `The report containing all transaction information from your ${partner?.name} dashboard is ready to download.`,
			entity: "recognized_transactions",
			exportApiEndpoint: exportRecognisedTransCSV,
			dateRangeFilterId: "transaction_date",
			dateRangeFilterRadioId: "transaction_date_radio",
		},
		{
			id: 5,
			cat: "Organization Data",
			name: "List of Contracts",
			description:
				"This report gives the details about the Contracts of an Organization like Contract name, Application name, Payment Terms etc",
			filters: [],
			url: rc5,
			isPublished: false,
			reportMailDesc: `The report containing all contract information from your ${partner?.name} dashboard is ready to download.`,
		},
		{
			id: 6,
			cat: "Workable Insights",
			name: "Upcoming Renewals",
			description:
				"This report contains details about the licenses of the application that needs to be renewed in near future along with the renewal amount and date. You can filter the data based on week, month and Year ",
			filters: ["7 days", "Month", "Financial Year"],
			url: rc6,
			isPublished: false,
			reportMailDesc: `The report containing all upcoming renewal information from your ${partner?.name} dashboard is ready to download.`,
		},
		{
			id: 7,
			cat: "Workable Insights",
			name: "List of Inactive Users",
			description:
				"This report contains details about the inactive users  along with their email id and the date since which they are inactive.",
			columns: ["user_name", "user_email", "user_status"],
			// filters: ["7 days", "Month", "Financial Year"],
			defaultFilter: {
				field_values: ["inactive"],
				field_id: "user_status",
				filter_type: "string",
				negative: false,
				is_custom: false,
			},
			filters: [],
			url: rc7,
			isPublished: true,
			reportMailDesc: `The report containing the list of inactive users from your ${partner?.name} dashboard is ready to download.`,
			entity: "users",
			exportApiEndpoint: exportUserCSV,
		},
		{
			id: 8,
			cat: "Workable Insights",
			name: "Contracts Expiring",
			description:
				"This report contains details about the contracts  that needs to be renewed in near future along with the owner name, application name and renewal date. You can filter the data based on week, month and Year ",
			filters: ["7 days", "Month", "Financial Year"],
			url: rc8,
			isPublished: false,
			reportMailDesc: `The report containing all upcoming contract renewals from your ${partner?.name} dashboard is ready to download.`,
		},
		{
			id: 9,
			cat: "Workable Insights",
			name: "List of Restricted Apps",
			description:
				"This report contains the names of restricted application in the organization along witth Metadata(App Name, Number of users)",
			filters: [],
			defaultFilter: {
				field_values: ["restricted"],
				field_id: "app_state",
				filter_type: "string",
				negative: false,
				is_custom: false,
			},
			columns: ["app_name", "app_user_count"],
			url: rc9,
			isPublished: true,
			reportMailDesc: `The report containing the list of restricted applications from your ${partner?.name} dashboard is ready to download.`,
			entity: "applications",
			exportApiEndpoint: exportApplicationsCSV,
		},
		{
			id: 10,
			cat: "Workable Insights",
			name: "List of Apps that needs review",
			description:
				"This report contains the list of application that needs to be reviewed along with the metadata(App Name Number of users)",
			filters: [],
			defaultFilter: {
				field_values: ["needs review"],
				field_id: "app_state",
				filter_type: "string",
				negative: false,
				is_custom: false,
			},
			columns: ["app_name", "app_user_count"],
			url: rc10,
			isPublished: true,
			reportMailDesc: `The report containing the list of applications which need review is ready to download from your ${partner?.name} dashboard.`,
			entity: "applications",
			exportApiEndpoint: exportApplicationsCSV,
		},
		{
			id: 11,
			cat: "Workable Insights",
			name: "List of Archived Apps",
			description:
				"This report contains the list of Archived Applications along with the metadata(App Name, Number of users)",
			filters: [],
			defaultFilter: {
				field_values: [true],
				field_id: "app_archive",
				filter_type: "string",
				negative: false,
				is_custom: false,
			},
			columns: ["app_name", "app_user_count"],
			url: rc11,
			isPublished: true,
			reportMailDesc: `The report containing the list of archived applications from your ${partner?.name} dashboard is ready to download.`,
			entity: "applications",
			exportApiEndpoint: exportApplicationsCSV,
		},
		{
			id: 12,
			cat: "Workable Insights",
			name: "List of Archived Users",
			description:
				"This report contains the list of Archived Users along with the metadata(User Name, Number of Applications used)",
			filters: [],
			defaultFilter: {
				field_values: [true],
				field_id: "user_archive",
				filter_type: "string",
				negative: false,
				is_custom: false,
			},
			columns: ["user_name", "user_app_count"],
			url: rc12,
			isPublished: true,
			reportMailDesc: `The report containing the list of archived users from your ${partner?.name} dashboard is ready to download`,
			entity: "users",
			exportApiEndpoint: exportUserCSV,
		},
		{
			id: 13,
			cat: "Workable Insights",
			name: `App ${textWise} Inactive Users`,
			description:
				"This report gives the the list of Inactive users according to applications along with the Meta data(App Name, Deleted Users, Suspended Users, Users with last usage date)",
			filters: [],
			defaultFilter: {
				field_values: ["suspended"],
				field_id: "user_app_status",
				filter_type: "string",
				negative: false,
				is_custom: false,
			},
			columns: ["app_name"],
			url: rc13,
			isPublished: false,
			reportMailDesc: `The report containing the list of inactive users from your ${partner?.name} dashboard is ready to download.`,
			exportApiEndpoint: exportApplicationUserCSV,
		},
		{
			id: 14,
			cat: "Spend Reports",
			name: `Department ${textWise} Budget`,
			description: `This report gives the spend analysis Department ${textWise} along with the metadata( Department Name, Budget, Spend). You can filter the data based on Department Name, Budget value, Month and Financial Year `,
			filters: [
				"Department Name",
				"Budget Value",
				"Month",
				"Financial Year",
				"Month Range",
			],
			columns: [
				"dept_name_path",
				"dept_budget_spend",
				"dept_budget_allocated",
			],
			url: rc14,
			isPublished: true,
			reportMailDesc: `The report containing the department ${textWise} budget from your ${partner?.name} dashboard is ready to download.`,
			entity: "department_budget",
			exportApiEndpoint: exportDepartmentCSV,
		},
		{
			id: 15,
			cat: "Spend Reports",
			name: `Department ${textWise} Monthly Spend`,
			description: `This report contains the details about Department ${textWise} Monthly spending along with the metadat(Department Name, Month, Spend). You can filter the data based on Department Name,  Month and Financial Year `,
			filters: ["Department Name", "Month", "Financial Year"],
			columns: ["dept_name_path", "dept_budget_spend"],
			url: rc15,
			isPublished: false,
			reportMailDesc: `The report containing department ${textWise} monthly spend from your ${partner?.name} dashboard is ready to download`,
			exportApiEndpoint: exportDepartmentCSV,
		},
		{
			id: 16,
			cat: "Spend Reports",
			name: `Month ${textWise} Total Spend`,
			description:
				"This report contains details about the total spending of the Organization  per month. You can filter the data based on Financial Year ",
			filters: ["Financial Year"],
			url: rc16,
			isPublished: false,
			reportMailDesc: `The report containing month ${textWise} total spend from your ${partner?.name} dashboard is ready to download.`,
		},
		{
			id: 17,
			cat: "Spend Reports",
			name: `Month ${textWise} Unrecognized Spend`,
			description:
				"This report contains details about the total unrecognized spending of the Organization  per month  along with the amount. You can filter the data based on the Month and Financial Year ",
			filters: ["Month", "Financial Year"],
			url: rc17,
			isPublished: false,
			reportMailDesc: `The report containing month ${textWise} unrecognized spend from your ${partner?.name} dashboard is ready to download.`,
		},
		{
			id: 18,
			cat: "Spend Reports",
			name: `Month ${textWise} Spend not Attributed to Users`,
			description:
				"This report contains details about the total spending of the Organization apart from the spend on the users  along with the amount. You can filter the data based on Month, Financial Year and other factors ",
			filters: ["Month", "Financial Year", "Factors"],
			url: rc18,
			isPublished: false,
			reportMailDesc: `The report containing month ${textWise} unattributed spend from your ${partner?.name} dashboard is ready to download.`,
		},
		{
			id: 19,
			cat: "Spend Reports",
			name: `Payment Method ${textWise} Monthly Spend`,
			description:
				"This report contains details about the payment method of the Organization  per month along with the amount. You can filter the data based on Month, Financial Year and payment methods",
			filters: ["Payment Method", "Month", "Financial Year"],
			url: rc19,
			isPublished: false,
			reportMailDesc: `The report containing payment method ${textWise} monthly spend from your ${partner?.name} dashboard is ready to download.`,
		},
		{
			id: 20,
			cat: "Spend Reports",
			name: `App ${textWise} Monthly Spend`,
			columns: [],
			description: `This report contains details about the application ${textWise} spending method of the Organization per month. You can filter the data based on Month, Financial Year `,
			filters: ["Month Range"],
			url: rc20,
			isPublished: true,
			reportMailDesc: `The report containing application ${textWise} monthly spend from your ${partner?.name} dashboard is ready to download.`,
			entity: "application_month_spend",
			exportApiEndpoint: exportMonthWiseSpendCSV,
		},
		{
			id: 27,
			cat: "Workable Insights",
			name: "License Optimization Report",
			description:
				"This report helps you optimize your software licenses by providing you details about each license, to whom it is assigned, when he last used it & average usage percentage.",
			columns: [
				"app_name",
				"user_name",
				"user_email",
				"user_status",
				"user_app_status",
				"user_app_last_used",
				"user_app_total_spend",
				"user_app_avg_usage",
				"license_name",
				"license_cost",
				"user_is_external",
				"userStatusSource",
				"userStatusModified",
				"userAppStatusSource",
				"userAppStatusModified",
			],

			filters: ["Single App"],
			url: rc27,
			isPublished: true,
			reportMailDesc:
				"The license optimization report is ready to download.",
			entity: "applications_users",
			allAppsSelectedEntity: "license_optimization",
			scheduleEntity: "license_optimization",
			exportApiEndpoint: exportLicenseOptimizationforAllApps,
			exportAllAppsApiEndpoint: exportLicenseOptimizationforAllApps,
		},
		{
			id: 28,
			cat: "Workable Insights",
			name: "User Activity Report",
			description:
				"This report helps you query the list of users who have not used an application since a particular day.",
			columns: [
				"user_name",
				"user_email",
				"user_status",
				"app_name",
				"user_app_status",
				"user_app_last_used",
				"user_app_avg_usage",
				"licenses.license_name",
			],
			filters: ["Single App", "No of Days"],
			url: rc28,
			isPublished: true,
			reportMailDesc: "The user activity report is ready to be download.",
			entity: "applications_users",
			allAppsSelectedEntity: "users_activity",
			scheduleEntity: "users_activity",
			exportApiEndpoint: exportApplicationUserCSV,
			exportAllAppsApiEndpoint: exportUserActivityforAllApps,
		},
		{
			id: 29,
			cat: "Usage Reports",
			name: "Redundant Apps",
			description:
				"This report gives the list of redundant applications along with number of users using it & total spend.",
			columns: [
				"app_name",
				"app_user_count",
				"app_spend",
				"alternative_app_name",
				"alternative_app_user_count",
				"alternative_app_spend",
				"app_state",
			],
			filters: ["Auth"],
			url: rc29,
			isPublished: true,
			reportMailDesc: `The report containing the redundant apps for your ${partner?.name} dashboard is ready to download.`,
			entity: "redundant_applications",
			exportApiEndpoint: exportAlternateAppsCSV,
		},
		{
			id: 30,
			cat: "Workable Insights",
			name: "Optimization Summary",
			description:
				"This report provides you a summary of your license optimization possibilities of all applications.",
			columns: [
				"app_name",
				"license_name",
				"assigned_count",
				"license_cost",
				"active_users",
				"inactive_users",
				"possible_savings",
				"undeprovisionedUsers",
				"usersInactive1months",
			],
			filters: [
				{
					filter_name: "dropdown",
					field_name: "Consider inactive since",
					options: [
						{ key: "7 Days", value: "usersInactive7days" },
						{ key: "1 Month", value: "usersInactive1months" },
						{ key: "3 Months", value: "usersInactive3months" },
					],
					defaultValue: "usersInactive1months",
				},
			],
			url: rc22,
			isPublished: true,
			reportMailDesc: `The report containing the Optimization Summary for your ${partner?.name} dashboard is ready to download.`,
			entity: "optimization_summary",
			exportApiEndpoint: exportOptimizationSummaryReport,
		},
		{
			id: 31,
			cat: "Workable Insights",
			name: "Security & Compliance",
			description:
				"This report gives you risk score, threat score, security probe score and compliance details of each SaaS application used in your organization.",
			columns: [
				"app_name",
				"app_user_count",
				"active_app_user_count",
				"app_max_risk",
				"app_risk_score",
				"manual_risk_level",
				"app_risk_level",
				"compliance",
			],
			filters: [],
			url: rc30,
			isPublished: true,
			reportMailDesc: `The report containing the Security & compliance report for your ${partner?.name} dashboard is ready to download.`,
			entity: "security_compliance",
			exportApiEndpoint: exportSecurityComplianceReport,
		},
		{
			id: 32,
			cat: "Workable Insights",
			name: "Inactive Owners Report",
			description:
				"This report contains the list of application owners who have left the organization or marked inactive.",
			columns: [
				"app_name",
				"user_name",
				"user_email",
				"user_status",
				"technical_user_name",
				"technical_user_email",
				"technical_user_status",
				"financial_user_name",
				"financial_user_email",
				"financial_user_status",
			],
			filters: [],
			url: rc31,
			isPublished: true,
			reportMailDesc: `The report containing the Inactive App Owner User for your ${partner?.name} dashboard is ready to download.`,
			entity: "inactive_appowner_users",
			exportApiEndpoint: exportInactiveUsersReport,
		},
		{
			id: 33,
			cat: "Workable Insights",
			name: `Department ${textWise} spend`,
			description: `This report provides the month ${textWise} chargeback on application spend for each department.`,
			columns: [],
			filters: ["Month Range"],
			url: rc20,
			isPublished: true,
			reportMailDesc: `The report containing the Department ${textWise} spend for your ${partner?.name} dashboard is ready to download.`,
			entity: "departments_spend",
			exportApiEndpoint: exportDepartmentSpend,
		},
		{
			id: 34,
			cat: "Workable Insights",
			name: `User ${textWise} Cost`,
			description: `This report provides the month ${textWise} cost attributed to each user for all the assigned licenses.`,
			columns: [],
			filters: ["Month Range"],
			url: rc20,
			isPublished: true,
			reportMailDesc: `The report containing the User ${textWise} cost for your ${partner?.name} dashboard is ready to download.`,
			entity: "users_cost",
			exportApiEndpoint: exportUserCost,
		},
		{
			id: 35,
			cat: "Workable Insights",
			name: `Application ${textWise} cost`,
			description: `This report provides month ${textWise} amortized cost for all applications for which contracts are added.`,
			columns: [],
			filters: ["Month Range"],
			url: rc20,
			isPublished: true,
			reportMailDesc: `The report containing the Application ${textWise} cost for your ${partner?.name} dashboard is ready to download.`,
			entity: "application_month_cost",
			exportApiEndpoint: exportAppCost,
		},
		{
			id: 36,
			cat: "Workable Insights",
			name: `Department ${textWise} cost`,
			description: `This report provides month ${textWise} amortized cost for each department based on licenses used by departments.`,
			columns: [],
			filters: ["Month Range"],
			url: rc20,
			isPublished: true,
			reportMailDesc: `The report containing the Dept ${textWise} cost for your ${partner?.name} dashboard is ready to download.`,
			entity: "departments_cost",
			exportApiEndpoint: exportDeptCost,
		},
		{
			id: 37,
			cat: "Workable Insights",
			name: `Upcoming Renewals`,
			description: `This report provides a list of upcoming renewals for the selected duration along with the application name, contract name, renewal type and amount.`,
			columns: [
				"contract_name",
				"application_name",
				"renewal_date",
				"type",
				"cost",
			],
			filters: ["Month Range"],
			url: upcomingRenewals,
			isPublished: true,
			reportMailDesc: `The report containing the list of upcoming renewals for your ${partner?.name} dashboard is ready to download.`,
			entity: "contracts_renewals",
			exportApiEndpoint: exportUpcomingRenewals,
		},
	];

	const [apploading, setAppLoading] = useState(true);
	const [deptloading, setDeptLoading] = useState(true);
	const [paymentloading, setPaymentLoading] = useState(true);
	const [appData, setAppData] = useState([]);
	const [deptData, setDeptData] = useState([]);
	const [payData, setPayData] = useState([]);
	const [paymentMethods, setPaymentMethods] = useState([]);
	const [showScheduleReports, setShowScheduleReports] = useState(false);
	const cancelToken = useRef(false);
	const cancelToken2 = useRef(false);
	const cancelToken3 = useRef(false);

	useEffect(() => {
		if (cancelToken.current) return;
		if (apploading === true) {
			getAllApplicationsV1(0, 10000).then((res) => {
				let tempArray = [];
				res.applications.forEach((el) => {
					tempArray.push({
						value: el.app_name,
						label: el.app_name,
					});
				});
				setAppData(tempArray);

				cancelToken.current = true;
				setAppLoading(false);
			});
		}
	}, [apploading]);
	useEffect(() => {
		if (cancelToken2.current) return;
		if (deptloading === true) {
			getAllDepartments(0, 10000).then((res) => {
				let tempArray = [];
				res.departments.forEach((el) => {
					tempArray.push({
						value: el.department_name_path,
						label: el.department_name_path,
					});
				});
				setDeptData(tempArray);
				cancelToken2.current = true;
				setDeptLoading(false);
			});
		}
	}, [deptloading]);
	useEffect(() => {
		if (cancelToken3.current) return;
		if (paymentloading === true) {
			getPaymentMethods().then((res) => {
				let tempArray2 = [
					...res.data.payment_ccs,
					...res.data.payment_banks,
					...res.data.payment_others,
				];
				let tempArray = [];
				tempArray2.forEach((el) => {
					tempArray.push({
						value:
							el.cc_card_name ||
							el.bank_name ||
							el.payment_method_name,
						label:
							el.cc_card_name ||
							el.bank_name ||
							el.payment_method_name,
						maskedDigits:
							el.bank_masked_account_digits ||
							el.cc_masked_digits,
						id: el.payment_method_id,
						card_type: el.cc_card_type,
						logo: el.payment_logo_url,
						bank_name: el.bank_name,
						cc_card_name: el.cc_card_name,
						payment_method_name: el.payment_method_name,
						bank_masked_account_digits:
							el.bank_masked_account_digits,
						cc_masked_digits: el.cc_masked_digits,
					});
				});
				setPayData(tempArray);
				cancelToken3.current = true;
				setPaymentLoading(false);
			});
		}
	}, [paymentloading]);
	const [categoriesToShow, setCategoriesToShow] = useState([]);
	const [reportsToShow, setReportsToShow] = useState([]);
	const [reportsSearchQuery, setReportsSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState();
	const [selectedCategory, setSelectedCategory] = useState({});
	const [tempReports, setTempReports] = useState();
	useEffect(() => {
		setCategoriesToShow(categories);
		setSelectedCategory(categories[0]);
		setTempReports(reports);
	}, []);

	useEffect(() => {
		setReportsSearchQuery("");
		if (reports?.length) {
			setReportsToShow(reports);
		}
	}, []);

	const reportLists =
		reports && reportsToShow && reportsToShow.length && reports?.length
			? reportsToShow.map((report, index) =>
					report.isPublished ? (
						<ReportCard
							key={index}
							report={report}
							appData={appData}
							deptData={deptData}
							payData={payData}
						/>
					) : null
			  )
			: null;
	const onSearchCategory = (query) => {
		if (query && categories?.length)
			setCategoriesToShow(
				categories.filter((category) =>
					category?.Name?.toLowerCase()?.includes(
						query?.toLowerCase()
					)
				)
			);
		else setCategoriesToShow(categories);
	};
	const onCategoryChange = (category) => {
		setSelectedCategory(category);
		if (category.Name === "All Reports") {
			setReportsToShow(reports);
			setTempReports(reports);
		} else {
			if (selectedCategory) {
				setReportsToShow(
					reports.filter(
						(report) =>
							report.cat.toLowerCase() ===
							category.Name.toLowerCase()
					)
				);
				setTempReports(
					reports.filter(
						(report) =>
							report.cat.toLowerCase() ===
							category.Name.toLowerCase()
					)
				);
			}
		}
	};
	const onSearchReports = (query) => {
		setReportsSearchQuery(query);
		if (selectedCategory.id === 1) {
			if (query && tempReports?.length)
				setReportsToShow(
					tempReports.filter((reports) =>
						reports?.name
							?.toLowerCase()
							?.includes(query?.toLowerCase())
					)
				);
			else setReportsToShow(reports);
		} else {
			if (query && tempReports?.length)
				setReportsToShow(
					tempReports.filter((reports) =>
						reports?.name
							?.toLowerCase()
							?.includes(query?.toLowerCase())
					)
				);
			else setReportsToShow(tempReports);
		}
	};

	const onSortBy = (v) => {
		setSortBy(v);
	};

	return (
		<>
			{userRole === userRoles.FINANCE_ADMIN ||
			userRole === userRoles.PROCUREMENT_ADMIN ||
			userRole === userRoles.INTEGRATION_ADMIN ? (
				<UnauthorizedToView />
			) : (
				<>
					<Helmet>
						<title>{`Reports - ${
							getValueFromLocalStorage("userInfo")?.org_name ||
							"Org"
						} - ${
							getValueFromLocalStorage("partner")?.name
						}`}</title>
					</Helmet>
					<div className="z__page z__integrations">
						<HeaderTitleBC title="Reports" />
						<div className="z_page_container">
							<hr className="m-0" />
							<div className="z_i_body d-flex align-content-stretch align-items-stretch">
								<div className="z_i_sidebar p-3 pl-4 pr-4">
									<div className="z_i_categories">
										<h4 className="font-12 o-7 grey-1 mt-4">
											Categories
										</h4>
										<div className="z_i_searchbar position-relative mb-3">
											<img src={search} />
											<input
												placeholder="Search"
												type="text"
												className="w-100 black-1"
												onChange={(e) => {
													onSearchCategory(
														e.target.value
													);
												}}
											/>
										</div>
										<ul
											style={{
												listStyleType: "none",
												padding: 0,
											}}
										>
											{categories.length > 1 ? (
												categoriesToShow.map(
													(category, index) => (
														<li
															className={`pointer font-14 black-1 mt-1 p-2 pl-3 ${
																category.id ===
																selectedCategory?.id
																	? "active"
																	: ""
															}`}
															key={index}
															onClick={() =>
																onCategoryChange(
																	category
																)
															}
														>
															{category.Name}
														</li>
													)
												)
											) : (
												<CategoryLoader />
											)}
										</ul>
									</div>
								</div>
								<div className="z_i_main  p-3 pl-4">
									<div className="z_i_main_header position-relative">
										<h3 className="font-18 black-1 text-capitalize">
											{" "}
											{selectedCategory.Name}
										</h3>
										<div
											className="d-flex"
											style={{
												position: "absolute",
												right: "10px",
												top: 0,
											}}
										>
											<div>
												<button
													onClick={() =>
														setShowScheduleReports(
															true
														)
													}
													className="scheduled_reports_btn mt-auto mb-auto ml-3"
												>
													<img src={calendarClock} />
													<span>
														Scheduled Reports
													</span>
												</button>
											</div>
											<div className="z_i_searchbar_integrations position-relative mr-3">
												<img src={search} />
												<input
													placeholder="Search"
													value={reportsSearchQuery}
													type="text"
													className="w-100 black-1"
													onChange={(e) => {
														onSearchReports(
															e.target.value
														);
													}}
												/>
											</div>
											{/* <SelectOld className="m-0 mr-2" value={sortBy} placeholder="Sort by" options={convertObjToBindSelect(REPORT_SORT_BY)} onSelect={(v) => { onSortBy(v) }} /> */}
										</div>
									</div>
									{showScheduleReports && (
										<ScheduleReportsTableModal
											onHide={() =>
												setShowScheduleReports(false)
											}
										/>
									)}
									<div className="d-flex mt-5 flex-wrap">
										{reportLists?.length ? (
											reportLists
										) : reports ? (
											reportsSearchQuery ? (
												<div className="mt-6 mx-auto">
													<EmptySearch
														searchQuery={
															reportsSearchQuery
														}
													/>
												</div>
											) : null
										) : (
											<ReportCardLoader />
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</>
	);
}
