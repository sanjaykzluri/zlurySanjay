import { combineReducers } from "redux";
import { createStore, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import { transactionReducer } from "./transaction.reducer";
import { departmentReducer } from "./department.reducer";
import { uiReducer } from "./ui.reducer";
import {
	applicationActionHistoryReducer,
	applicationReducer,
} from "./application.reducer";
import { settingsReducer } from "./settings.reducer";
import { usersReducer } from "./users.reducer";
import {
	userReducer,
	userActionHistoryReducer,
	userApplicationsActionHistoryReducer,
} from "../components/Users/redux";
import { userDetailsReducer } from "./userDetails.reducer";
import { searchReducer } from "./search.reducer";
import { userInfoReducer } from "./userinfo.reducer";
import { overviewReducer } from "./overview.reducer";
import { restrictionsReducer } from "./restrictions.reducer";
import { renewalReducers } from "../modules/renewals/redux/renewal";
import { customFieldsReducer } from "../modules/custom-fields/redux/custom-field";
import { integrationsReducer } from "../modules/integrations/redux/integrations";
import { noteReminderReducers } from "../modules/notes/redux/reminder";
import {
	gettingStartedReducer,
	toggleGettingStartedModalReducer,
} from "../components/GettingStarted/reducer";
import { notificationReducer } from "../common/Notification/notification-reducer";
import { connectRouter } from "connected-react-router";
import { filtersReducer } from "../components/Users/Applications/Modals/FiltersRenderer/redux";
import { groupsFilterReducer } from "components/Users/Applications/Modals/FiltersRenderer/groupsReducer";
import { viewsReducer } from "./views.reducer";
import { workflowsReducer } from "../modules/workflow/redux/workflow";
import { apiReducer } from "./api.reducer";
import { stepperReducer } from "../common/Stepper/redux";
import { modalReducer } from "./modal.reducer";
import { viewsnewReducer } from "modules/views/redux/viewsnew.reducer";
import {
	appCardsReducer,
	globalCardsReducer,
} from "modules/applications/components/HealthMetrics/redux";
import { featureFlagsReducer } from "./featureFlags.reducer";
import { v2InfiniteReducer } from "modules/v2InfiniteTable/redux/v2infinite.reducer";
import { v2PaginatedReducer } from "modules/v2PaginatedTable/redux/v2paginated.reducer";
import { employeeReducer } from "./employee.reducer";
import { OptimizationReducer } from "modules/Optimization/redux/Optimization.reducer";
import {
	SpendVSCostGraphReducer,
	SpendVSCostReducer,
} from "modules/spendvscost/redux/spendvscost_reducer";
import { appReducer } from "modules/shared/redux/app.redux";
import { LicenseMapperReducer } from "modules/licenses/components/LicenseMapper/LicenseMapper.reducer";
import { appPlaybooksReducer } from "modules/applications/components/automation/redux/appPlaybook";
import { appRuleReducer } from "modules/applications/components/automation/redux/reducer";
import { TaskManagementReducer } from "modules/TaskManagement/redux/TaskManagement.reducer";

export const createRootReducer = (history) =>
	combineReducers({
		router: connectRouter(history),
		transactions: transactionReducer,
		departments: departmentReducer,
		applications: applicationReducer,
		settings: settingsReducer,
		ui: uiReducer,
		user: userReducer,
		userActionHistory: userActionHistoryReducer,
		userApplicationsActionHistory: userApplicationsActionHistoryReducer,
		applicationActionHistory: applicationActionHistoryReducer,
		users: usersReducer,
		search: searchReducer,
		overview: overviewReducer,
		renewal: renewalReducers,
		customFields: customFieldsReducer,
		integrations: integrationsReducer,
		note: noteReminderReducers,
		userDetails: userDetailsReducer,
		restrictions: restrictionsReducer,
		userInfo: userInfoReducer,
		gettingStartedStatuses: gettingStartedReducer,
		notifications: notificationReducer,
		showGettingStartedModal: toggleGettingStartedModalReducer,
		filters: filtersReducer,
		groups_filters: groupsFilterReducer,
		views: viewsReducer,
		workflows: workflowsReducer,
		api: apiReducer,
		stepper: stepperReducer,
		modal: modalReducer,
		v2Data: v2InfiniteReducer,
		v2PaginatedData: v2PaginatedReducer,
		viewsnew: viewsnewReducer,
		globalHealthCards: globalCardsReducer,
		appHealthCards: appCardsReducer,
		featureFlags: featureFlagsReducer,
		employee: employeeReducer,
		optimization: OptimizationReducer,
		spendvscost: SpendVSCostReducer,
		spendvscostgraph: SpendVSCostGraphReducer,
		app: appReducer,
		licenseMapper: LicenseMapperReducer,
		appPlaybooks: appPlaybooksReducer,
		appRule: appRuleReducer,
		tasks: TaskManagementReducer,
	});
