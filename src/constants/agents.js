import chrome from "assets/agents/chrome.svg";
import firefox from "assets/agents/firefox.svg";
import edge from "assets/agents/edge.svg";
import windows from "assets/agents/windows.svg";
import macos from "assets/agents/macos.svg";
import linux from "assets/agents/linux.svg";

const agentLogoMap = {
	 "Google Chrome":
		 chrome,
	 "Mozilla Firefox":
		 firefox,
	 "Microsoft Edge":
		 edge,
	 "Windows":
		 windows,
	 "MacOS":
		 macos
}

export const agentImg = (name) => {
	return agentLogoMap[name] || linux;
};
export const agentConstants = {
	NO_AGENTS: "no-agents",
	NO_BROWSER_AGENTS: "no-browser-agents",
	NO_DESKTOP_AGENTS: "no-desktop-agents",
	ATLEAST_ONE_AGENT: "atleast-one-agent",
	ATLEAST_ONE_BROWSER_AGENT: "atleast-one-browser-agent",
	ATLEAST_ONE_DESKTOP_AGENT: "atleast-one-desktop-agent",
};

export const agentFilterConstants = {
	"no-agents": "No Agents Installed",
	"no-browser-agents": "No browser agent installed",
	"no-desktop-agents": "No desktop agent installed",
	"atleast-one-agent": "At least one agent installed",
	"atleast-one-browser-agent": "At least one browser agent installed",
	"atleast-one-desktop-agent": "At least one desktop agent installed",
};

export const agentConstantsFilters = {
	NO_AGENTS: "Users with no agent installed",
	NO_BROWSER_AGENTS: "Users with no browser agent installed",
	NO_DESKTOP_AGENTS: "Users with no desktop agent installed",
	ATLEAST_ONE_AGENT: "Users with at least one agent installed",
	ATLEAST_ONE_BROWSER_AGENT:
		"Users with at least one browser agent installed",
	ATLEAST_ONE_DESKTOP_AGENT:
		"Users with at least one desktop agent installed",
};


