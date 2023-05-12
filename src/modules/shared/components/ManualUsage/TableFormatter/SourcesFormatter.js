import React, { useState, useRef, useEffect, useContext } from "react";
import Manual from "../TableComponents/Manual";
import { Sources } from "../../../../../components/Sources";

export const SourceContext = React.createContext();

export function SourcesFormatter(props) {
	const setOpenManualFalse = () => {
		props.setInterColumnsStateObject({
			...props.interColumnsStateObject,
			open_manual: false,
			orgUserAppId: undefined,
			addManualUsage: false,
		});
	};
	const [open_manual, setOpenManual] = useState(false);

	useEffect(() => {
		if (
			props.interColumnsStateObject.open_manual &&
			props.interColumnsStateObject.orgUserAppId === props.user_app_id
		) {
			setOpenManual(true);
		} else {
			setOpenManual(false);
		}
	}, [props.interColumnsStateObject.open_manual]);

	return (
		<div className="row d-flex flex-row grow justify-content-center">
			{(props.is_manual_source_present || open_manual) && (
				<Manual
					manualPopoverClassName="user-app-manual-usage-popover"
					isUser={props.isUser}
					userAppId={props.user_app_id}
					open_manual={open_manual}
					userId={props.user_id}
					setOpenManualFalse={setOpenManualFalse}
					onSave={props.updateManualUsage}
					interColumnsStateObject={props.interColumnsStateObject}
					refresh={props.refresh}
					style={{ left: "-197px", transform: "translateX(0px)" }}
				/>
			)}
			<SourceContext.Provider value={{ ...props, userId: props.user_id }}>
				<Sources
					style={{ left: "-240px", transform: "translateX(0px)" }}
					refresh={props.refresh}
					isUser={props.isUser}
					isUserSource={props.isUserSource}
				/>
			</SourceContext.Provider>
		</div>
	);
}
