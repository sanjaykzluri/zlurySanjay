/* eslint-disable react/jsx-key */
import React, { useEffect, useRef, useState } from "react";
import {
	Modal,
	Button,
	OverlayTrigger,
	Tooltip,
	Spinner,
} from "react-bootstrap";
import close from "../../../assets/close.svg";
import "./Split.css";
import splitsvg1 from "./splitsvg1.svg";
import splitsvg2 from "./splitsvg2.svg";
import splitsvg3 from "./splitsvg3.svg";
import splitsvg4 from "./splitsvg4.svg";
import RangeSlider from "react-bootstrap-range-slider";
import dustbin from "./dustbin.svg";
import { fetchApplicationInfo } from "../../../actions/applications-action";
import { Form, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { SearchSelect } from "../../../common/Select/SearchSelect";
import "../../../common/Select/Select.scss";
import { searchAllDepartments } from "../../../services/api/search";
import {
	setDepartmentSplitManual,
	setDepartmentSplitDefault,
} from "../../../services/api/applications";
import add from "./add.svg";
import { AsyncTypeahead } from "common/Typeahead/AsyncTypeahead";
import { kFormatter } from "constants/currency";
import { TriggerIssue } from "utils/sentry";

export const splitTypes = {
	license: {
		header: "Chargeback based on number of assigned licenses ",
		desc: "The chargeback will be automatically calculated based on the number of assigned licenses. The number of users using the application does not affect chargeback caluclation",
		boxText: "Based on licenses",
		boxSubText: "Split based on number of licenses used by each department",
		buttonText: "Set chargeback based on licenses",
		url: splitsvg2,
	},
	active_users: {
		header: "Chargeback based on number of active users",
		desc: "The chargeback will be automatically calculated based on the number of active users. The number of licenses assigned does not affect chargeback calculation",
		boxText: "Based on active users",
		boxSubText: "Split based on number of active users in each department",
		buttonText: "Set chargeback based on active users",
		url: splitsvg3,
	},
	active_users_last_30_days: {
		header: "Chargeback based on user activity for past 30 days",
		desc: "The chargeback will be automatically calculated based on the user activity for the past 30 days. The number of licenses assigned does not affect chargeback calculation",
		boxText: "Based on active users (last 30 days)",
		boxSubText:
			"Split based on number of users who have used the application in last 30 days",
		buttonText: "Set chargeback based on user activity",
		url: splitsvg4,
	},
	manual: {
		boxText: "Manual",
		boxSubText: "Set the split ratio between departments manually",
	},
	default: {
		header: "Chargeback is automatically calculated based on the usage information we receive from SSO and direct integration .",
		boxText: "Default",
		boxSubText:
			"Split based on users of the departments using this application",
		buttonText: "Set as Default",
		url: splitsvg1,
		outerText: "Based on total users",
	},
};

const constructTree = (department_splits) => {
	const tree = {};

	department_splits.forEach((currentDept) => {
		const keys = currentDept.department_name.split("/");
		let parent = tree;

		keys.forEach((key) => {
			parent[key] = parent[key] || {};
			parent = parent[key];
		});

		parent["department_id"] = currentDept.department_id;
		parent["split_percent"] = currentDept.split_percent || 0;
		parent["department_users"] = currentDept.department_users || 0;
	});
	return tree;
};

const checkSplitPercent = (deptTree) => {
	// let totalSplitPercent = 0;
	// Object.keys(deptTree).forEach((key) => {
	// 	if ("split_percent" in deptTree[key]) {
	// 		totalSplitPercent += deptTree[key]["split_percent"];
	// 	} else {
	// 		totalSplitPercent += checkSplitPercent(deptTree[key]);
	// 	}
	// });
	// return totalSplitPercent;
	let totalSplitPercent = 0;

	for (const node in deptTree) {
		let mainSplitPercent = 0;
		let childSplitPercentSum = 0;

		if (deptTree[node].split_percent !== undefined) {
			mainSplitPercent = deptTree[node].split_percent;
		} else {
			const childObjs = Object.values(deptTree[node]).filter(
				(obj) => typeof obj === "object"
			);
			childSplitPercentSum = childObjs.reduce(
				(acc, curr) => acc + (curr.split_percent || 0),
				0
			);
			mainSplitPercent = childSplitPercentSum;
		}

		const directChildObjs = Object.values(deptTree[node]).filter(
			(obj) =>
				typeof obj === "object" && obj !== null && !Array.isArray(obj)
		);
		const directChildSplitPercentSum = directChildObjs.reduce(
			(acc, curr) => acc + (curr.split_percent || 0),
			0
		);

		if (mainSplitPercent < directChildSplitPercentSum) {
			return false;
		}

		totalSplitPercent += mainSplitPercent;
	}

	return totalSplitPercent === 100;
};

export function Split(props) {
	const errorRef = useRef();
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const [id, setid] = useState("");
	const pathname = window.location.pathname;
	const idapp = pathname.split("/")[2];
	const [valueTA, setvalueTA] = useState([]);
	const [showHide, setshowHide] = useState(false);
	const { info } = props;
	const [data, setData] = useState([]);
	const dispatch = useDispatch();
	const { departments } = useSelector((state) => state.departments);
	const [step0, setstep0] = useState(true);
	const [isError, setIsError] = useState(false);
	const [step1, setstep1] = useState(false);
	const [value, setValue] = useState();
	const [manualSplit, setManualSplit] = useState({
		split_type: "manual",
		splits: [],
	});
	const [rangecount, setrangecount] = useState(data.length);
	const [addactive, setAddActive] = useState(false);
	const [newName, setNewName] = useState("");
	const [type, setType] = useState();
	const [activeType, setActiveType] = useState();
	const [saving, setSaving] = useState(false);
	const handleDelete = (id) => {
		const tempData = [...data];
		let obj = tempData.find((x) => x.department_id === id);
		let index = tempData.indexOf(obj);
		tempData.splice(index, 1);
		setData(tempData);
		const splits = [...manualSplit.splits];
		const tempData2 = {
			split_type: manualSplit.split_type,
			splits,
		};
		let obj2 = tempData2.splits.find((x) => x.department_id === id);
		let index2 = tempData2.splits.indexOf(obj2);
		tempData2.splits.splice(index2, 1);
		setManualSplit(tempData2);
	};
	useEffect(() => {
		setData([]);
		let tempSplit = { ...manualSplit };
		if (info && info.length > 0) {
			info.forEach((el) => {
				tempSplit.splits.push({
					department_id: el.department_id,
					split_percent: el.department_split,
					department_name_path: el.department_name_path || el.department_name,
					department_name: el.department_name_path || el.department_name,
				});
				setData((prev) => [
					...prev,
					{
						split_percent: parseInt(
							isNaN(el.department_split)
								? 0
								: Number(el.department_split)?.toFixed(0)
						),
						...el,
					},
				]);
			});
		}

		setManualSplit(tempSplit);
	}, [info]);

	useEffect(() => {
		window.analytics.page(
			"Applications",
			"Application-Overview; Department-Split",
			{
				orgId: orgId || "",
				orgName: orgName || "",
			}
		);
	}, []);

	useEffect(() => {
		if (props.type) {
			setType(props.type);
			setActiveType(props.type);
			if (props.type === "manual") {
				setstep0(false);
				setstep1(true);
			}
		}
	}, [props.type]);
	const handleEditManual = (key, value) => {
		const tmp = [...data];
		let obj = tmp.find((x) => x.department_id === key);
		let index = tmp.indexOf(obj);
		tmp[index].department_id = key;
		tmp[index].split_percent = value;
		setData(tmp);
		const splits = [];
		tmp.forEach((el) => {
			splits.push({
				department_id: el.department_id,
				split_percent: parseInt(el.split_percent),
				department_name_path: el.department_name_path || el.department_name,
				department_name:  el.department_name_path || el.department_name,
			});
		});
		setManualSplit({
			split_type: "manual",
			splits,
		});
	};

	const toggleAddDepartment = () => {
		setAddActive(!addactive);
	};

	const getSuggestions = (query) => {
		return searchAllDepartments(query).then((resp) => {
			const updatedData = resp.results.filter(
				(item) =>
					!data.find((i) => i.department_id === item.department_id)
			);
			return { results: updatedData };
		});
	};

	let addCardClose = () => setshowHide(false);

	let updateid = (department) => {
		const value = department.department_id;
		const value2 = department.department_name_path || department.department_name;
		const value3 = department.department_users_count;
		setid(value);
		setNewName(value2);
		setAddActive(false);
		let obj = {
			department_id: value,
			department_name_path: value2,
			department_name: value2,
			split_percent: 0,
			department_users: value3,
		};
		const temp = [...data];
		temp.push(obj);
		setData(temp);
		const temp2 = [...manualSplit.splits];
		temp2.push(obj);
		setManualSplit({ split_type: manualSplit.split_type, splits: temp2 });
	};

	let onSave = () => {
		// let temp = null;
		let invalid = false;
		const tree = constructTree(manualSplit.splits);
		const finalSplitPercentage = checkSplitPercent(tree);
		// manualSplit.splits.forEach((el) => {
		// 	temp = temp + el.split_percent;
		// 	if (el.split_percent === 0) {
		// 		invalid = true;
		// 	}
		// });
		if (!finalSplitPercentage) {
			setIsError(true);
		} else {
			setSaving(true);
			setDepartmentSplitManual(idapp, manualSplit).then(() => {
				dispatch(fetchApplicationInfo(idapp)).then(() => {
					setSaving(false);
					props.handleClose();
					props.handleDepartments(data);
				});
			});
		}
	};

	useEffect(() => {
		if (isError) {
			errorRef.current.scrollIntoView();
			setTimeout(() => {
				setIsError(false);
			}, 7500);
		}
	}, [isError]);
	let onCancel = () => {
		setIsError(false);
		setstep0(true);
		setstep1(false);
		props.handleClose();
	};

	const handleReset = () => {
		let tempData = JSON.parse(JSON.stringify(manualSplit.splits));
		tempData = tempData.map((el) => {
			return {
				...el,
				split_percent: 0,
			};
		});
		setManualSplit({
			...manualSplit,
			splits: tempData,
		});
		setData(tempData);
	};
	return (
		<>
			<Modal
				show={props.show}
				onHide={onCancel}
				centered
				dialogClassName="department__split__modal"
			>
				<div className=" d-flex flex-column position-relative w-100 cursor-pointer">
					<img
						alt="Close"
						onClick={onCancel}
						src={close}
						width={10}
						className="position-absolute"
						style={{ top: "10px", right: "10px" }}
					/>

					<div className="d-flex ">
						<div
							className="d-flex flex-column"
							style={{
								width: "299px",
								height: " 622px",
								background: "#EBEBEB",
								padding: "26px 16px",
							}}
						>
							<div className="bold-600 font-18 d-flex mb-5">
								Chargeback for
								<OverlayTrigger
									placement="top"
									overlay={
										<Tooltip>{props.app_name}</Tooltip>
									}
								>
									<div
										className=" ml-1 text-truncate"
										style={{
											maxWidth: "120px",
											width: "120px",
										}}
									>
										{props.app_name}
									</div>
								</OverlayTrigger>
							</div>
							{Object.keys(splitTypes).map((el) => (
								<>
									<div
										onClick={() => {
											setType(el);
											if (el === "manual") {
												setstep1(true);
												setstep0(false);
											} else {
												setstep0(true);
												setstep1(false);
											}
										}}
										className="d-flex flex-column w-100 cursor-pointer"
										style={{
											height: "75px",
											background: "#FFFFFF",
											border:
												type === el
													? "1px solid #2266E2"
													: "1px solid #EBEBEB",
											borderRadius: "6px",
											marginBottom: "7px",
											padding: "10px 12px",
										}}
									>
										<div className="d-flex align-items-center">
											<div
												className={`font-12 bold-600 ${
													type === el
														? "primary-color"
														: "black-1"
												}`}
											>
												{splitTypes[el].boxText}
											</div>
											{activeType === el && (
												<div className="ml-auto font-8 bold-600 green">
													ACTIVE
												</div>
											)}
										</div>
										<div className="font-10 grey-1 o-8">
											{splitTypes[el].boxSubText}
										</div>
									</div>
								</>
							))}
						</div>
						<div
							className="d-flex flex-column"
							style={{ width: "588px" }}
						>
							{step0 ? (
								<>
									<div
										className="split__cont__d2"
										style={{ marginTop: "75px" }}
									>
										<img
											src={splitTypes?.[type]?.url}
										></img>
									</div>
									<div className="split__cont__d3 p-3 text-align-center">
										{splitTypes?.[type]?.header}
									</div>
									<div className="split__cont__d4 text-align-center">
										{splitTypes?.[type]?.desc}
									</div>
									<div className="split__cont__d5 mb-8 mt-auto">
										{type === activeType ? (
											<>
												<div
													className="d-flex align-items-center justify-content-center cursor-pointer p-2 green bold-600 font-13 border-radius-4"
													style={{
														width: "fit-content",
														backgroundColor:
															" rgba(95, 207, 100, 0.2)",
													}}
												>
													Currently Active
												</div>
											</>
										) : (
											<>
												<button
													style={{
														width: "fit-content",
													}}
													onClick={() => {
														setSaving(true);
														setDepartmentSplitDefault(
															idapp,
															{
																split_type:
																	type,
															}
														)
															.then(() => {
																setSaving(
																	false
																);
																props.handleClose();
																props.onAppChange &&
																	props.onAppChange();
															})
															.catch((err) => {
																setSaving(
																	false
																);
																TriggerIssue(
																	"Error while changing department split",
																	err
																);
															});
													}}
												>
													<div className="d-flex align-items-center">
														<div>
															{
																splitTypes?.[
																	type
																]?.buttonText
															}
														</div>
														{saving && (
															<Spinner
																animation="border"
																role="status"
																variant="light"
																size="sm"
																className="ml-2"
																style={{
																	borderWidth: 2,
																}}
															>
																<span className="sr-only">
																	Loading...
																</span>
															</Spinner>
														)}
													</div>
												</button>
											</>
										)}
									</div>
								</>
							) : (
								<>
									<div className="split-data-grid">
										<div
											className="d-flex flex-column justify-content-between "
											style={{ height: "35px" }}
										>
											<div className="grey-1 o-5 font-11">
												{kFormatter(
													props.app
														?.app_previous_year_dept_spend
												)}
											</div>

											<div
												className={`font-10  black-1 
												`}
											>
												YTD spend
											</div>
										</div>
										<div
											className="d-flex flex-column justify-content-between"
											style={{ height: "35px" }}
										>
											<div className="grey-1 o-5 font-11">
												{kFormatter(
													props.app?.app_monthly_spend
														?.monthly_spend
												)}
											</div>

											<div
												className={`font-10  black-1
												`}
											>
												Monthly spend
											</div>
										</div>
										<div
											className="d-flex flex-column justify-content-between "
											style={{ height: "35px" }}
										>
											<div className="grey-1 o-5 font-11">
												{/* {item.text} */}
											</div>

											<div
												className={`font-10  black-1 
												`}
											>
												Charged back to Depts
											</div>
										</div>
									</div>
									<div
										className="d-flex "
										style={{
											width: "448px",
											marginLeft: "61px",
										}}
									>
										<div
											className="ml-auto cursor-pointer font-13 primary-color"
											onClick={() => handleReset()}
										>
											Reset All
										</div>
									</div>
									<div className="split__cont__d2s1 d-block">
										{data.map((el) => (
											<div className="split__cont__d2s1__d1">
												<div className="split__cont__d2s1__d1__d1 pr-2">
													<div
														data-tooltip={
															el.department_name_path
														}
														className="split__cont__d2s1__d1__d1__d1"
													>
														<OverlayTrigger
															placement="top"
															overlay={
																<Tooltip>
																	{
																		el.department_name_path || el.department_name
																	}
																</Tooltip>
															}
														>
															<div className="truncate_10vw">
																{
																	el.department_name_path || el.department_name
																}
															</div>
														</OverlayTrigger>
													</div>
													<div className="split__cont__d2s1__d1__d1__d2 ml-auto">
														<Form>
															<Form.Group
																as={Row}
																style={{
																	margin: "0px ",
																}}
															>
																<Col
																	style={{
																		display:
																			"flex",
																		flexDirection:
																			"row",
																		alignItems:
																			"center",
																		width: "120px !important",
																	}}
																>
																	<RangeSlider
																		value={
																			el.split_percent
																		}
																		onChange={(
																			e
																		) => {
																			handleEditManual(
																				el.department_id,
																				e
																					.target
																					.value
																			);
																		}}
																		style={{
																			width: "120px",
																		}}
																	/>
																</Col>
																<div
																	className="d-flex align-items-cente pr-1"
																	style={{
																		border: "1px solid #ced4da",
																	}}
																>
																	<Form.Control
																		bsPrefix="new__input__split"
																		className="new__input__spilt border-0"
																		value={
																			el.split_percent
																		}
																		onChange={(
																			e
																		) => {
																			handleEditManual(
																				el.department_id,
																				isNaN(
																					e
																						.target
																						.value
																				)
																					? 0
																					: +e
																							.target
																							.value +
																							0
																			);
																		}}
																	/>
																	<div className="border-0 d-flex align-items-center">
																		%
																	</div>
																</div>
															</Form.Group>
														</Form>
													</div>
												</div>
												<img
													src={dustbin}
													style={{
														marginLeft: "4px",
													}}
													role="button"
													onClick={() =>
														handleDelete(
															el.department_id
														)
													}
												></img>
											</div>
										))}
										{isError && (
											<div
												className="invalid-feedback"
												style={{
													display: "block",
													width: "448px",
												}}
												ref={errorRef}
											>
												<p>
													Total split should be equal
													to 100 or one of the
													departments has split
													percentage equal to 0.
													Please enter the valid input
													or remove the department
													which has split percentage
													equal to 0
												</p>
											</div>
										)}
									</div>
									<div
										className="split__cont__d2s1__d1 mt-auto"
										style={{ paddingLeft: "61px" }}
									>
										{addactive ? (
											<div className=" mr-2 position-relative">
												<AsyncTypeahead
													placeholder="Search Department"
													fetchFn={getSuggestions}
													onSelect={(selection) => {
														updateid(selection);
													}}
													keyFields={{
														id: "department_id",
														value: "department_name_path",
													}}
													allowFewSpecialCharacters={
														true
													}
													className="m-0"
													isReport={true}
													style={{ width: 300}}
												/>
											</div>
										) : null}
										<button
											className="split__bottom__button mb-auto mr-auto"
											onClick={() =>
												toggleAddDepartment()
											}
										>
											{!addactive ? (
												<>
													<img
														src={add}
														style={{
															marginRight:
																"12.5px",
														}}
													></img>
													Add Department
												</>
											) : (
												"Hide"
											)}
										</button>
									</div>
									<hr style={{ margin: "0px 10px" }}></hr>
									<div className="split__cont__d2s1__bottom">
										<button
											className="btn btn-link"
											onClick={() => {
												onCancel();
											}}
										>
											Cancel
										</button>
										<Button
											onClick={() => {
												onSave();
											}}
											style={{ marginLeft: "20px" }}
										>
											<div className="d-flex align-items-center">
												<div>Set Manual Chargeback</div>
												{saving && (
													<Spinner
														animation="border"
														role="status"
														variant="light"
														size="sm"
														className="ml-2"
														style={{
															borderWidth: 2,
														}}
													>
														<span className="sr-only">
															Loading...
														</span>
													</Spinner>
												)}
											</div>
										</Button>
									</div>
								</>
							)}
						</div>
					</div>
				</div>
			</Modal>
		</>
	);
}
