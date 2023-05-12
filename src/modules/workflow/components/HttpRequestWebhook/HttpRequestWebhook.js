import React, { useEffect, useState } from "react";
import { Button } from "../../../../UIComponents/Button/Button";
import plus from "../../../../assets/icons/plus-blue-bold.svg";
import deleteIcon from "../../../../assets/icons/delete.svg";
import ToggleSwitch from "react-switch";
import { setEditActionWorkflow } from "../../redux/workflow";
import { useDispatch, useSelector } from "react-redux";
import { Spinner } from "react-bootstrap";
import "../ManualTask/ManualTask.css";
import { METHODS } from "../../constants/constant";
import { Select } from "../../../../UIComponents/Select/Select";

const HttpRequestWebhook = (props) => {
	const workflow = useSelector((state) => state.workflows.workflow);

	const dispatch = useDispatch();

	const InitialState = {
		method: {
			value:
				props.action?.data?.length && props.action?.data[0].v?.method
					? props.action?.data[0].v?.method
					: METHODS[0].value,
			required: true,
			error_message: "Please select a method",
			error: false,
		},
		url: {
			value:
				props.action?.data?.length && props.action?.data[0].v?.url
					? props.action?.data[0].v?.url
					: null,
			required: true,
			error_message: "Please enter url",
			error: false,
		},
		ignoreSSL: {
			value:
				props.action?.data?.length && props.action?.data[0].v?.ignoreSSL
					? props.action?.data[0].v?.ignoreSSL
					: true,
			required: false,
			error_message: "Please select a option",
			error: false,
		},
		responseTimeout: {
			value:
				props.action?.data?.length &&
				props.action?.data[0].v?.responseTimeout
					? props.action?.data[0].v?.responseTimeout
					: "10",
			required: false,
			error_message: "Please enter a response timeout",
			error: false,
		},
		headers: {
			value:
				props.action?.data?.length &&
				props.action?.data[0].v?.headers &&
				props.action?.data[0].v?.headers.length > 0
					? props.action?.data[0].v?.headers
					: [{ name: "", value: "" }],
			required: false,
			error_message: "Please enter headers",
			error: false,
		},
		params: {
			value:
				props.action?.data?.length &&
				props.action?.data[0].v?.params &&
				props.action?.data[0].v?.params.length > 0
					? props.action?.data[0].v?.params
					: [{ name: "", value: "" }],
			required: false,
			error_message: "Please enter params",
			error: false,
		},
	};

	const [formData, setFormData] = useState(InitialState);
	const [addingTaskLoader, setAddingTaskLoader] = useState(false);

	const add = (key) => {
		const data = [...formData[key].value];
		data.push({ name: "", value: "" });
		setFormData({
			...formData,
			[key]: {
				...formData[key],
				value: data,
			},
		});
	};

	const del = (index, key) => {
		let data = [...formData[key].value];
		if (data.length === 1) {
			data = [{ name: "", value: "" }];
		} else {
			data.splice(index, 1);
		}
		setFormData({
			...formData,
			[key]: {
				...formData[key],
				value: data,
			},
		});
	};

	const handleChange = (value, index, type, key) => {
		if (type === "name" || type === "value") {
			const arr = [...formData[key].value];
			arr[index][type] = value;
			setFormData({
				...formData,
				[key]: {
					...formData[key],
					value: arr,
					error: false,
				},
			});
		} else {
			setFormData({
				...formData,
				[key]: {
					...formData[key],
					value: value,
					error: false,
				},
			});
		}
	};

	const validation = () => {
		const obj = Object.assign({}, formData);
		let isError = false;
		for (let key in obj) {
			if (!obj[key].value && obj[key].required) {
				Object.assign(obj, {
					[key]: {
						...obj[key],
						error: true,
					},
				});
				isError = true;
			} else {
				Object.assign(obj, {
					[key]: {
						...obj[key],
						error: false,
					},
				});
			}
		}
		setFormData(obj);
		return !isError;
	};

	const submitTask = () => {
		if (validation()) {
			setAddingTaskLoader(true);
			let data = [];
			if (props.isTemplate) {
				data = [
					{
						k: null,
						v: {},
					},
				];
			} else {
				data = workflow.users.map((user) => {
					return {
						k: user.user_id,
						v: {},
					};
				});
			}
			Object.keys(formData).forEach((item) => {
				data.forEach((obj) => {
					if (item === "headers" || item === "params") {
						obj.v[item] = formData[item].value
							.map((item) => {
								if (item.name && item.value) {
									return {
										name: item.name,
										value: item.value,
									};
								}
							})
							.filter((item) => item);
					} else {
						obj.v[item] = formData[item]["value"];
					}
				});
			});

			const task = Object.assign({}, props.action, {
				data: data,
				type: "static",
				isValidated: true,
			});
			props.submitTask(task);
		}
	};

	return (
		<>
			<div className="z-w-manual-task">
				<header className="flex-1 d-flex justify-content-between mb-2">
					<div className="flex-1 d-flex flex-column justify-content-start">
						<div className="flex-1 d-flex flex-row justify-content-start">
							<h3 className="bold-600 font-16 mb-2 grey">
								Set up Action
							</h3>
						</div>
					</div>
				</header>
				<section>
					<div className="mb-4">
						<div className="flex-1 d-flex flex-row justify-content-between">
							<div className="flex-1 d-flex flex-column align-items-start pr-3">
								<label className="font-12 grey">Method</label>
								<Select
									value={formData.method || METHODS[0]}
									isOptionsLoading={false}
									options={METHODS}
									fieldNames={{
										label: "value",
									}}
									placeholder="Select"
									onChange={(action) => {
										handleChange(
											action.value,
											null,
											null,
											"method"
										);
									}}
								/>
								{formData.method.error && (
									<p className="font-12 mt-1 red">
										{formData.method.error_message}
									</p>
								)}
							</div>
							<div className="flex-3 d-flex flex-column align-items-start">
								<label className="font-12 grey">URL</label>
								<input
									className="p-2"
									placeholder="Enter URL"
									name="title"
									type="text"
									value={formData.url.value || ""}
									onChange={(e) => {
										handleChange(
											e.target.value,
											null,
											null,
											"url"
										);
									}}
								/>
								{formData.url.error && (
									<p className="font-12 mt-1 red">
										{formData.url.error_message}
									</p>
								)}
							</div>
						</div>
					</div>
					<div className="mb-4">
						<div className="flex-1 d-flex flex-row justify-content-between align-items-center">
							<div className="d-flex flex-column align-items-start pr-3">
								<h4 className="grey-1 font-12 m-0">
									<span
										className="mr-2 position-relative"
										style={{ bottom: "5px" }}
									>
										Ignore SSL issues{" "}
									</span>
									<ToggleSwitch
										height={18}
										width={31}
										checked={formData.ignoreSSL.value}
										onChange={(v) => {
											handleChange(
												v,
												null,
												null,
												"ignoreSSL"
											);
										}}
										checkedIcon={false}
										uncheckedIcon={false}
										onColor={"#2266E2"}
										offColor={"#EBEBEB"}
									/>
								</h4>
							</div>
							<div className="flex-1 d-flex align-items-center justify-content-start">
								<div className="d-flex flex-1 flex-row align-items-center">
									<h4 className="d-flex grey-1 font-12 m-0">
										<span className="ml-2 mr-2 position-relative">
											Response timeout (sec){" "}
										</span>
									</h4>
									<input
										style={{
											minHeight: "20px",
											minWidth: "60px",
										}}
										className="p-2 w-auto"
										placeholder="Timeout"
										name="title"
										type="text"
										value={
											formData.responseTimeout.value || ""
										}
										onChange={(e) => {
											handleChange(
												e.target.value,
												null,
												null,
												"responseTimeout"
											);
										}}
									/>
								</div>
							</div>
						</div>
					</div>
					<div className="flex-1 d-flex flex-row justify-content-between">
						<div className="flex-1 d-flex flex-column align-items-start justify-content-center pr-3 pb-2">
							<span className="mr-2 position-relative grey-1 font-12">
								HEADER
							</span>
						</div>
						<div className="flex-1 d-flex flex-column align-items-end justify-content-center pb-2">
							<Button
								className="text-captalize font-12 p-0 m-0"
								type="link"
								onClick={() => {
									add("headers");
								}}
							>
								+ Add Header
							</Button>
						</div>
					</div>
					<div
						className="mb-3"
						style={{ borderTop: "1px solid #EBEBEB" }}
					/>
					<div className="mb-4">
						{formData.headers.value.map((header, index) => (
							<div
								key={index}
								className="flex-1 d-flex flex-row justify-content-between mb-2"
							>
								<div className="flex-1 d-flex flex-column align-items-start pr-3">
									<label className="font-12 grey">Name</label>
									<input
										className="p-2"
										placeholder="Enter Name"
										name="title"
										type="text"
										value={header.name || ""}
										onChange={(e) => {
											handleChange(
												e.target.value,
												index,
												"name",
												"headers"
											);
										}}
									/>
								</div>
								<div className="flex-1 d-flex flex-column align-items-start">
									<label className="font-12 grey">
										Value
									</label>
									<input
										className="p-2"
										placeholder="Enter Value"
										name="title"
										type="text"
										value={header.value || ""}
										onChange={(e) => {
											handleChange(
												e.target.value,
												index,
												"value",
												"headers"
											);
										}}
									/>
								</div>
								<div
									style={{ marginBottom: "5px" }}
									className="d-flex flex-column align-items-end justify-content-end pb-2 pl-3"
								>
									<img
										className="pointer"
										onClick={() => del(index, "headers")}
										src={deleteIcon}
										width={14}
										height={14}
									/>
								</div>
							</div>
						))}
					</div>
					<div className="flex-1 d-flex flex-row justify-content-between">
						<div className="flex-1 d-flex flex-column align-items-start justify-content-center pr-3 pb-2">
							<span className="mr-2 position-relative grey-1 font-12">
								PARAMETERS
							</span>
						</div>
						<div className="flex-1 d-flex flex-column align-items-end justify-content-center pb-2">
							<Button
								className="text-captalize font-12 p-0 m-0"
								type="link"
								onClick={() => {
									add("params");
								}}
							>
								+ Add Parameter
							</Button>
						</div>
					</div>
					<div
						className="mb-3"
						style={{ borderTop: "1px solid #EBEBEB" }}
					/>
					<div className="mb-4">
						{formData.params.value.map((param, index) => (
							<div
								key={index}
								className="flex-1 d-flex flex-row justify-content-between mb-2"
							>
								<div className="flex-1 d-flex flex-column align-items-start pr-3">
									<label className="font-12 grey">Name</label>
									<input
										className="p-2"
										placeholder="Enter Name"
										name="title"
										type="text"
										value={param.name || ""}
										onChange={(e) => {
											handleChange(
												e.target.value,
												index,
												"name",
												"params"
											);
										}}
									/>
								</div>
								<div className="flex-1 d-flex flex-column align-items-start">
									<label className="font-12 grey">
										Value
									</label>
									<input
										className="p-2"
										placeholder="Enter Value"
										name="title"
										type="text"
										value={param.value || ""}
										onChange={(e) => {
											handleChange(
												e.target.value,
												index,
												"value",
												"params"
											);
										}}
									/>
								</div>
								<div
									style={{ marginBottom: "5px" }}
									className="d-flex flex-column align-items-end justify-content-end pb-2 pl-3"
								>
									<img
										className="pointer"
										onClick={() => del(index, "params")}
										src={deleteIcon}
										width={14}
										height={14}
									/>
								</div>
							</div>
						))}
					</div>
					<>
						<div className="d-flex">
							<Button
								disabled={addingTaskLoader}
								className="mt-2 flex-fill  mr-3  bold-600"
								onClick={() => {
									submitTask();
								}}
							>
								{"Add Task"}
								{addingTaskLoader && (
									<Spinner
										className=" ml-2 mr-2 blue-spinner action-edit-spinner"
										animation="border"
										style={{ top: "1px" }}
									/>
								)}
							</Button>
							<Button
								className="mt-2 pr-4 pl-4"
								type="reverse"
								onClick={() => {
									dispatch(setEditActionWorkflow(null));
								}}
							>
								Cancel
							</Button>
						</div>
					</>
				</section>
			</div>
		</>
	);
};

export default HttpRequestWebhook;
