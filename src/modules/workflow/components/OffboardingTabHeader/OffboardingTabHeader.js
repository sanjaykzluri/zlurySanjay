import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import moment from "moment";
import { Button } from "../../../../UIComponents/Button/Button";
import { SearchInputArea } from "../../../../components/searchInputArea";
import add from "../../../../assets/icons/plus-white.svg";
import search from "../../../../assets/search.svg";
import refresh_icon from "../../../../assets/icons/refresh.svg";
import check from "../../../../assets/icons/check-circle.svg";

const OffboardingTabHeader = (props) => {
	const history = useHistory();

	const { data, setSearchQuery, placeholder, searchQuery, disableButton } =
		props;
	const addNewTemplateButton = (
		<Button
			disabled={disableButton}
			className="ml-3 d-flex"
			onClick={() => {
				if (props.onClickConfirmCompletion) {
					props.onClickConfirmCompletion(true);
				}
			}}
		>
			Confirm Completion
		</Button>
	);
	return (
		<div>
			<div
				className="top__Uploads_no_height justify-content-between"
				// style={{ height: "67px" }}
			>
				<div
					className="d-flex flex-1"
					style={{ flexDirection: "column" }}
				>
					<div
						style={{
							flex: 1,
							display: "flex",
							flexDirection: "row",
							alignItems: "center",
						}}
					>
						<h4>Offboarding Tasks</h4>
						{data &&
							data.actions &&
							data.actions.length > 0 &&
							moment(data.actions[0]?.dueDate).format(
								"DD MMM"
							) !== "Invalid date" && (
								<span
									style={{
										backgroundColor: "#5ABAFF",
										bottom: "2px",
									}}
									className="position-relative font-12 p-1 primary-color-bg white bold-700 m-2 border-radius-2 pl-2 pr-2"
								>
									Due on{" "}
									{moment(data.actions[0]?.dueDate).format(
										"DD MMM"
									) == "Invalid date"
										? "N/A"
										: moment(
												data.actions[0]?.dueDate
										  ).format("DD MMM")}
								</span>
							)}
					</div>
					<p
						style={{ color: "#717171" }}
						className="d-flex flex-1 justify-content-start align-items-center font-12"
					>
						The admin has requested you to complete the following
						tasks:
					</p>
				</div>
				<div
					style={{ display: "flex", flex: 1 }}
					className="wf__offboarding__table"
				>
					<div className="d-flex inputWithIconApps mr-0 mt-auto mb-auto border-light">
						<SearchInputArea
							placeholder={`Search ${placeholder}`}
							setSearchQuery={setSearchQuery}
							searchQuery={searchQuery}
						/>
						<img src={search} aria-hidden="true" />
					</div>
					{addNewTemplateButton}
				</div>
			</div>
			{props?.isTaskCompleted && (
				<div
					className="d-flex flex-1"
					style={{ flexDirection: "column" }}
				>
					<p
						style={{
							color: "#222222",
							backgroundColor: "rgba(95, 207, 100, .1)",
							borderRadius: "4px",
							border: "1px solid #5fcf70",
							fontWeight: "bold",
						}}
						className="d-flex flex-1 justify-content-start align-items-center font-14 p-3"
					>
						<img src={check} aria-hidden="true" className="pr-2" />
						You’ve completed the offboarding tasks assigned to you
					</p>
				</div>
			)}
		</div>
	);
};

export default OffboardingTabHeader;
