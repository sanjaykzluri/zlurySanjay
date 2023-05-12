export const PARTNER = {
	ZLURI: {
		name: "Zluri",
		domains: [],
		getStyle: () => {},
	},
	TANGOE: {
		name: "Tangoe",
		domains: [
			"https://cloud-dev.prod.tangoe.com",
			"https://cloud-qa.prod.tangoe.com",
			"https://cloud-qa.prod.tangoe.com",
			"https://cloud-demo.tangoe.com",
			"http://cloud-dev.prod.tangoe.com",
			"http://develop-local.corp.tangoe.com",
			"https://develop-local.corp.tangoe.com:80",
			"https://cloud.tangoe.com",
			"https://tangoe.nadevsso01.corp.tangoe.com",
		],
		defaultConnection: "",
		getStyle: () => import("../../../tangoe.css"),
	},
};
