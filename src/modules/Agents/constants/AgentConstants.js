export const includeKeysInOverviewResponse = "step_images,download_links";

export const agentTypes = { BROWSER: "browser", DESKTOP: "desktop" };

export const sendAgentPromptOptions = [
	{
		label: "Send Prompt for Browser Agent",
		value: agentTypes.BROWSER,
	},
	{
		label: "Send Prompt for Desktop Agent",
		value: agentTypes.DESKTOP,
	},
];

export const agentsList = [
	{
		global_agent_id: "61010e2d8895d467b85afb63",
		name: "Google Chrome",
		source_name: "Google Chrome",
		keyword: "agent",
		type: "browser",
		logo: "https://zluri-assets-new.s3.us-west-1.amazonaws.com/files/assets/logos/chrome.png",
		users: 2,
		latest_version: 9.9,
		is_published: true,
		total_users: 1117,
		value: 0.17905102954341987,
	},
	{
		global_agent_id: "61010e2d8895d467b85afb64",
		name: "Mozilla Firefox",
		source_name: "Mozilla Firefox",
		keyword: "agent",
		type: "browser",
		logo: "https://zluri-assets-new.s3.us-west-1.amazonaws.com/files/logos/firefox.png",
		users: 0,
		latest_version: 9.9,
		is_published: true,
		total_users: 1117,
		value: 0,
	},
	{
		global_agent_id: "61010e2d8895d467b85afb65",
		name: "Microsoft Edge",
		keyword: "agent",
		source_name: "Microsoft Edge",
		type: "browser",
		logo: "https://zluri-assets-new.s3.us-west-1.amazonaws.com/files/logos/edge.jpeg",
		users: 0,
		latest_version: 9.9,
		is_published: true,
		total_users: 1117,
		value: 0,
	},
	{
		global_agent_id: "61010e2d8895d467b85afb66",
		name: "Windows",
		keyword: "agent",
		source_name: "Windows",
		type: "desktop",
		logo: "https://zluri-assets-new.s3.us-west-1.amazonaws.com/files/assets/logos/windows.png",
		users: 2,
		latest_version: "1.0.5",
		is_published: true,
		total_users: 1117,
		value: 0.17905102954341987,
	},
	{
		global_agent_id: "61010e2d8895d467b85afb67",
		name: "MacOS",
		keyword: "agent",
		source_name: "MacOS",
		type: "desktop",
		logo: "https://zluri-assets-new.s3.us-west-1.amazonaws.com/files/assets/logos/MACOS-LOGO.png",
		users: 2,
		latest_version: "1.0.1",
		is_published: true,
		total_users: 1117,
		value: 0.17905102954341987,
	},
	{
		global_agent_id: "61010e2d8895d467b85afb68",
		name: "Linux",
		source_name: "Linux",
		keyword: "agent",
		type: "desktop",
		logo: "https://zluri-assets-new.s3.us-west-1.amazonaws.com/files/assets/logos/LINUX-LOGO.png",
		users: 0,
		latest_version: 1,
		is_published: true,
		total_users: 1117,
		value: 0,
	},
];