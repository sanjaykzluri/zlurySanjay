import Chips from "components/Users/Applications/Modals/FiltersRenderer/Chip";
import React, { useEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";
import { checkSpecialCharacters } from "services/api/search";
import cross from "assets/reports/whitecross.svg";
import completed from "assets/icons/completeicon.svg";
import acceptbutton from "assets/icons/acceptbutton.svg";
import cancel from "assets/icons/cancel.svg";
import { Button } from "UIComponents/Button/Button";
import { Spinner } from "react-bootstrap";
import edit from "components/Users/Overview/edit.svg";
import { useOutsideClickListener } from "utils/clickListenerHook";
import { patchApplication, setAppsBulkTags } from "services/api/applications";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import useOutsideClick from "common/OutsideClick/OutsideClick";
import { useDispatch } from "react-redux";
import { clearAllV2DataCache } from "modules/v2InfiniteTable/redux/v2infinite-action";
import { clearAllV2DataCache as clearPaginatedTableData } from "modules/v2PaginatedTable/redux/v2paginated-action";
import { TriggerIssue } from "utils/sentry";

const STATUS = {
	DEFAULT: "DEFAULT",
	LOADING: "LOADING",
	UPDATED: "UPDATED",
};
export default function AppTagsComponent({
	app = {},
	onAppChange,
	isBulkEdit = false,
	metaData = {},
	checkAll = false,
	ids = [],
	isTable = false,
}) {
	const dispatch = useDispatch();
	const ref = useRef();
	const dropdownref = useRef();
	const [values, setValues] = useState([]);
	const [inputVal, setInputVal] = useState("");
	const [status, setStatus] = useState(STATUS.DEFAULT);
	const [showTags, setShowTags] = useState(false);
	const [additionalTagsOpen, setAdditionalTagsOpen] = useState(false);

	useEffect(() => {
		if (showTags) {
			setValues(app?.app_tags || []);
		}
	}, [showTags]);

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
			if (values?.indexOf(updatedValues[0]) > -1) return;
			const previousValues = values || [];
			setValues([...previousValues, ...updatedValues]);
			setInputVal("");
		}
	};

	const handleSubmit = () => {
		setStatus(STATUS.LOADING);
		let app_ids = [];
		let patchObj = {};
		if (isBulkEdit) {
			app_ids = [...ids];
		} else {
			app_ids = [app.app_id || app._id];
			patchObj = {
				patches: [
					{
						op: "replace",
						field: "tags",
						value: inputVal ? [...values, inputVal] : values,
					},
				],
			};
		}

		if (isBulkEdit) {
			setAppsBulkTags(
				inputVal ? [...values, inputVal] : values,
				app_ids,
				metaData?.filter_by || [],
				checkAll
			)
				.then((res) => {
					if (res.status === "success") {
						onAppChange && onAppChange();
						if (!isTable && !isBulkEdit) {
							handleRefresh();
						}

						setStatus(STATUS.UPDATED);
						setValues([]);
						setInputVal("");
					}
				})
				.catch((err) => {
					TriggerIssue(
						"Error while bulk adding tags to application",
						err
					);
				});
		} else {
			patchApplication(app.app_id || app._id, patchObj)
				.then((res) => {
					onAppChange && onAppChange();
					if (!isTable && !isBulkEdit) {
						handleRefresh();
					}
					setStatus(STATUS.UPDATED);
					setValues([]);
					setInputVal("");
				})
				.catch((err) => {
					TriggerIssue(
						"Error while patching tags to application",
						err
					);
				});
		}
	};
	async function handleRefresh() {
		const clearData = await dispatch(clearAllV2DataCache("applications"));
		const clearPaginatedData = dispatch(
			clearPaginatedTableData("applications")
		);
	}

	const renderTagsWithRemoveButton = (el, index, className) => {
		return (
			<OverlayTrigger placement="top" overlay={<Tooltip>{el}</Tooltip>}>
				<div
					className={`${
						className ? className : "custom_app_tags_value"
					} mr-1`}
					style={{ marginBottom: "10px" }}
				>
					<div
						style={{
							backgroundColor: " #FFFFFF",
							height: "7px",
							width: "7px",
							borderRadius: "50%",
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
							let tempArray = [...values];
							tempArray.splice(index, 1);
							setValues(tempArray);
						}}
					></img>
				</div>
			</OverlayTrigger>
		);
	};
	useOutsideClickListener(ref, () => {
		if (!isTable) {
			setShowTags(false);
			setValues([]);
			setInputVal("");
		}
	});

	useOutsideClick(dropdownref, () => {
		if (additionalTagsOpen) setAdditionalTagsOpen(false);
	});

	return (
		<>
			<div
				className="overview__middle__topcont"
				style={{
					marginRight: isBulkEdit || isTable ? "0px" : "20px",
				}}
			>
				{!isBulkEdit && !isTable && (
					<div className="d-flex  justify-content-between mb-2">
						<div className="securityoverview__item-name">TAGS</div>
						<div
							style={{
								marginLeft: "45px",
							}}
							className="overview__middle__topconttext2 d-flex flex-column align-items-start"
						>
							<div
								className="font-12 primary-color cursor-pointer"
								onClick={() => {
									setShowTags(!showTags);
								}}
							>
								<img src={edit}></img>
							</div>
						</div>
					</div>
				)}

				<div
					className="d-flex align-items-center flex-wrap"
					style={{ minWidth: "120px", maxWidth: "200px" }}
				>
					{!showTags &&
						!isBulkEdit &&
						app?.app_tags &&
						Array.isArray(app.app_tags) &&
						app.app_tags.slice(0, 2).map((el, id) => (
							<OverlayTrigger
								placement="top"
								overlay={<Tooltip>{el}</Tooltip>}
							>
								<div
									className="custom_app_tags_value mr-1 custom_app_tags_overview"
									style={{ marginBottom: "10px" }}
								>
									<div
										style={{
											backgroundColor: " #FFFFFF",
											height: "7px",
											width: "7px",
											borderRadius: "50%",
										}}
										className="mr-1"
									></div>
									<span
										className="text-truncate"
										style={{
											maxWidth: "60px",
											width: "fit-content",
										}}
									>
										{el}
									</span>
								</div>
							</OverlayTrigger>
						))}
					{!showTags &&
						!isBulkEdit &&
						Array.isArray(app.app_tags) &&
						app.app_tags.length > 2 && (
							<>
								<OverlayTrigger
									placement="top"
									overlay={
										<Tooltip>
											{app.app_tags.slice(2).join(",")}
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
											marginBottom: "10px",
										}}
									>
										<span
											style={{
												fontSize: 8,
												color: "#717171",
											}}
										>
											+ {app.app_tags.length - 2}
										</span>
									</div>
								</OverlayTrigger>
							</>
						)}
				</div>
				{isTable && !showTags && (
					<div className="overview__middle__topconttext2 d-flex flex-column align-items-start">
						<div
							className="font-12 primary-color cursor-pointer"
							onClick={() => {
								setShowTags(!showTags);
							}}
						>
							<img src={edit}></img>
						</div>
					</div>
				)}
				{(showTags || isBulkEdit) && (
					<div
						className="w-100 d-flex flex-column border-radius-4"
						style={{
							background: "#2266E2",
							padding: "15px",
							maxWidth: "308px",
						}}
						ref={ref}
					>
						<div className="d-flex align-items-center flex-wrap">
							{Array.isArray(values) &&
								values
									.slice(0, 2)
									.map((el, index) =>
										renderTagsWithRemoveButton(el, index)
									)}
							{Array.isArray(values) && values.length > 2 && (
								<>
									<div style={{ position: "relative" }}>
										<div
											className={`d-flex flex-center cursor-pointer `}
											style={{
												width: "25px",
												background:
													"rgba(235, 235, 235, 0.6)",
												borderRadius: " 4px",
												height: "100%",
												marginBottom: "10px",
											}}
											onClick={(e) => {
												e.stopPropagation();
												e.preventDefault();
												setAdditionalTagsOpen(true);
											}}
										>
											<span
												style={{
													fontSize: 8,
													color: "#717171",
												}}
											>
												+ {values.length - 2}
											</span>
										</div>
										{additionalTagsOpen && (
											<>
												<div
													className="additionaltags__dropdowncont"
													ref={(el) => {
														if (el) {
															dropdownref.current =
																el;
														}
													}}
													style={
														values.length > 2
															? {
																	paddingBottom:
																		"7px",
															  }
															: {
																	cursor: "default",
															  }
													}
												>
													<div
														className="d-flex flex-column mr-1"
														style={{
															marginTop: "9px",
															maxHeight: "210px",
															width: "100%",
															overflowY: "auto",
															overflowX: "none",
														}}
													>
														{values.map(
															(el, index) => {
																if (index > 1) {
																	return renderTagsWithRemoveButton(
																		el,
																		index,
																		"custom_app_tags_popup_box"
																	);
																}
															}
														)}
													</div>
												</div>
											</>
										)}
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
												className="chip__input custom_bg_tags"
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
							<div
								className={`z__if__edit_actions  d-flex ml-2`}
								style={{
									top:
										status === STATUS.LOADING
											? "-1px"
											: "0",
								}}
							>
								{status === STATUS.DEFAULT && (
									<>
										{!isBulkEdit && (
											<Button
												className="p-0 pl-1 pr-1"
												onClick={() => {
													setAdditionalTagsOpen(
														false
													);
													setShowTags(false);
												}}
											>
												<img width={8} src={cancel} />
											</Button>
										)}

										<Button
											className="p-0 pl-1 pr-1"
											onClick={() => {
												handleSubmit();
											}}
										>
											<img
												width={14}
												src={acceptbutton}
											/>
										</Button>
									</>
								)}
								{status === STATUS.LOADING && (
									<Spinner
										animation="border"
										variant="light"
										bsPrefix="my-custom-spinner"
										className="my-custom-spinner mr-2"
									/>
								)}
								{status === STATUS.UPDATED && (
									<img
										src={completed}
										className="mt-1 mr-2"
										width="16"
									/>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
