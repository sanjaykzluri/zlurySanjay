import React, {
	createRef,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { Popover } from "../../../../../UIComponents/Popover/Popover";
import { useLocation } from "react-router-dom";
import "./SourceIcon";
import DotsImage from "../../../../../assets/icons/horizontal-dots.svg";
import RoleContext from "../../../../../services/roleContext/roleContext";

const Options = (props) => {
	const location = useLocation();
	const optionButtonRef = createRef();
	const [showOptions, setShowOptions] = useState(false);
	const { isViewer } = useContext(RoleContext);

	useEffect(() => {
		if (props.clicked) {
			setShowOptions(true);
		} else {
			setShowOptions(false);
		}
	}, [props.clicked]);

	const onClickMarkAsNotActive = async (e) => {
		let res;
		if (props.isUser) {
			res = await props.onClickMarkAsNotActive(
				props.userId,
				props.orgUserAppId
			);
		} else {
			const userId = location.pathname.split("/")[2];
			res = await props.onClickMarkAsNotActive(
				userId,
				props.orgUserAppId
			);
		}

		setShowOptions(false);
		if (res?.status === "success") {
			props.interColumnsStateObject.setRefreshTableDueToUsage(true);
			props.refresh();
		}
	};
	const onClickMarkAsActive = async (e) => {
		let res;
		if (props.isUser) {
			res = await props.onClickMarkAsActive(
				props.userId,
				props.orgUserAppId
			);
		} else {
			const userId = location.pathname.split("/")[2];
			res = await props.onClickMarkAsActive(userId, props.orgUserAppId);
		}

		setShowOptions(false);
		if (res?.status === "success") {
			props.interColumnsStateObject.setRefreshTableDueToUsage(true);
			props.refresh();
		}
	};

	return (
		<div
			onClick={(e) => e.stopPropagation()}
			style={{ position: "relative" }}
		>
			<div
				className="cursor-pointer d-flex"
				ref={optionButtonRef}
				onClick={(e) => {
					e.stopPropagation();
					setShowOptions((val) => !val);
				}}
			>
				<img
					src={props.icon || DotsImage}
					width={props.icon ? 12 : 15}
					className={props.isActive ? "m-auto" : "o-6 m-auto"}
				/>
			</div>
			{showOptions && (
				<Popover
					className={props.popOverClassName}
					align="center"
					show={showOptions}
					refs={[optionButtonRef]}
					onClose={() => {
						setShowOptions(false);
						props.close && props.close();
					}}
					style={props.style}
				>
					{!isViewer &&
						(props.isOrgUserAppActive ? (
							<div>
								{!props.hideActionHistory && (
									<div
										className="z__options"
										onClick={() => {
											setShowOptions(false);
											props.onClickAddManualUsage();
										}}
									>
										Add Manual Usage
									</div>
								)}
								<div
									className="z__options"
									onClick={onClickMarkAsNotActive}
								>
									Mark app as 'Not in use'
								</div>
							</div>
						) : (
							<div
								className="z__options"
								onClick={onClickMarkAsActive}
							>
								Mark app as 'In use'
							</div>
						))}
					{!props.hideActionHistory && (
						<div
							className="z__options"
							onClick={() =>
								props.interColumnsStateObject.getActionHistory(
									props.appId,
									props.userId
								)
							}
						>
							View Action history
						</div>
					)}
				</Popover>
			)}
		</div>
	);
};

export default Options;
