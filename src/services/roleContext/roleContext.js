import React from "react";
import { getValueFromLocalStorage } from "utils/localStorage";

const RoleContext = React.createContext({
	userRole: getValueFromLocalStorage("userInfo")?.user_role || "",
	isViewer: getValueFromLocalStorage("userInfo")?.isViewer || "",
	partner: getValueFromLocalStorage("partner") || {},
});

export const RoleProvider = RoleContext.Provider;
export const RoleConsumer = RoleContext.Consumer;

export default RoleContext;
