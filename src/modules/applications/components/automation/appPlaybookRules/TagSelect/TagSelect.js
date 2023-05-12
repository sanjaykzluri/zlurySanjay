import Chips from "components/Users/Applications/Modals/FiltersRenderer/Chip";
import React, { useEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";
import { checkSpecialCharacters } from "services/api/search";
import cross from "assets/reports/whitecross.svg";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const STATUS = {
	DEFAULT: "DEFAULT",
	LOADING: "LOADING",
	UPDATED: "UPDATED",
};
export default function Tags({ tags, setTags }) {
	const ref = useRef();
	const [inputVal, setInputVal] = useState("");

	const handleChipInputChange = (e, onBlur) => {
		const val = e.target.value;
		if (
			val?.charAt(val.length - 1) !== "," &&
			checkSpecialCharacters(val, false)
		) {
			return;
		}
		setInputVal(val);
		if (val?.charAt(val.length - 1) === "," || onBlur) {
			if (!val) {
				return;
			}
			const updatedValues = val.split(",").filter((i) => !!i);
			if (tags?.indexOf(updatedValues[0]) > -1) return;
			const previousValues = tags || [];
			setTags([...previousValues, ...updatedValues]);
			setInputVal("");
		}
	};

	const renderTagsWithRemoveButton = (el, index, className) => {
		return (
			<OverlayTrigger placement="top" overlay={<Tooltip>{el}</Tooltip>}>
				<div
					className={`${
						className ? className : "custom_app_tags_value"
					} mr-1`}
					style={{
						marginBottom: "10px",
						color: "black",
						background: "lightgrey",
					}}
				>
					<div
						style={{
							height: "7px",
							width: "7px",
							borderRadius: "50%",
							background: "#FFFFFF",
						}}
						className="mr-1"
					></div>
					<span
						className="text-truncate mr-1"
						style={{
							maxWidth: "60px",
							width: "fit-content",
						}}
					>
						{el}
					</span>
					<img
						src={cross}
						className="ml-auto cursor-pointer"
						onClick={() => {
							let tempArray = [...tags];
							tempArray.splice(index, 1);
							setTags(tempArray);
						}}
					></img>
				</div>
			</OverlayTrigger>
		);
	};

	return (
		<>
			<div className="w-100 d-flex flex-column border-radius-4" ref={ref}>
				<div className="d-flex align-items-center flex-wrap">
					{Array.isArray(tags) &&
						tags
							.slice(0, 2)
							.map((el, index) =>
								renderTagsWithRemoveButton(el, index)
							)}
					{Array.isArray(tags) && tags.length > 2 && (
						<>
							<div style={{ position: "relative" }}>
								<div
									className={`d-flex flex-center cursor-pointer `}
									style={{
										width: "25px",
										borderRadius: " 4px",
										height: "100%",
										marginBottom: "10px",
									}}
									onClick={(e) => {
										e.stopPropagation();
										e.preventDefault();
									}}
								>
									<>
										<OverlayTrigger
											placement="top"
											overlay={
												<Tooltip>
													{tags.slice(2).join(",")}
												</Tooltip>
											}
										>
											<div
												className={`d-flex flex-center cursor-pointer `}
												style={{
													width: "25px",
													background:
														"rgba(235, 235, 235, 0.6)",
													borderRadius: " 4px",
													height: "100%",
												}}
											>
												<span
													style={{
														fontSize: 8,
														color: "#717171",
													}}
												>
													+ {tags.length - 2}
												</span>
											</div>
										</OverlayTrigger>
									</>
								</div>
							</div>
						</>
					)}
				</div>
				<div className="d-flex align-items-center">
					<Chips
						inputArea={
							<OverlayTrigger
								placement="bottom"
								overlay={
									<Tooltip>
										<span className="text-capitalize">
											Press comma(,) to add tag
										</span>
									</Tooltip>
								}
							>
								<div className="custom_app_tags_wrapper">
									<Form.Control
										type="text"
										placeholder={`Add Tags`}
										value={inputVal}
										onChange={handleChipInputChange}
									/>
								</div>
							</OverlayTrigger>
						}
						onClose={() => {
							setInputVal("");
						}}
						showResetAll={false}
					/>
				</div>
			</div>
		</>
	);
}
