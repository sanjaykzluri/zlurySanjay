import {
	searchAllAppsV2,
	searchAllDepartmentsV2,
	searchAllUsersV2,
} from "../../services/api/search";

export const globalSearchEntityAndAPI = [
	{
		text: "Applications",
		searchAPI: searchAllAppsV2,
	},
	{
		text: "Users",
		searchAPI: searchAllUsersV2,
	},
	{
		text: "Departments",
		searchAPI: searchAllDepartmentsV2,
	},
	{
		text: "Integrations",
		searchAPI: null,
	},
];

export const hideHeaderImgNameBadgeArr = [
	"workflows",
	"uploads",
	"integrations catalog",
];
