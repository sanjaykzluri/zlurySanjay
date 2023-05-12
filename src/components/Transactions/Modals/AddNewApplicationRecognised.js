import React, { Component, useState, useEffect, useRef } from "react";
import { Modal, Row, Col, Form, Button } from "react-bootstrap";
import CreatableSelect from "react-select/creatable";

import { getSearch } from "../../../services/api/search";
import close from "../../../assets/close.svg";
import adobe from "../../../assets/transactions/adobe.svg";
import uploadimage from "../../Applications/AllApps/uploadimage.svg";
import { Loader } from "../../../common/Loader/Loader";
import "../../Applications/Overview/select-tag.css";
import "../../Applications/Overview/select-filter.css";
import "./AddTransactionModal.scss";
import newbutton from "../../Applications/AllApps/newbutton.svg";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllApplications } from "../../../actions/applications-action";
const components = {
	DropdownIndicator: null,
};

const createOption = (label) => ({
	label,
	value: label,
});
function SuggestionBar(props) {
	return (
		<>
			<div className="SuggestionBardiv__WFM__2">
				{props.loading ? (
					<>
						<div className="option__card__WFM">
							<Loader height={60} width={60}></Loader>
						</div>
					</>
				) : (
					props.options.map((option,index) => (
						<>
							<button
								className="option__card__WFM"
								onClick={() => {
									props.handleSelect(option._id, option.name);
									props.onHide();
								}}
							>
								<img
									src={`https://ui-avatars.com/api/?name=${option.name}`}
									style={{
										height: "24px",
										width: "24px",
										marginRight: "10px",
									}}
								></img>
								{option.name}
							</button>
							{!(index == props.options.length-1) ? <hr style={{margin: "0px 18px"}}></hr> : null }
						</>
					))
				)}
			</div>
		</>
	);
}
export function AddNewApplicationRecognised(props) {
	const [display, setdisplay] = useState(false);
	const [displayoption, setdisplayoption] = useState(false);
	const [idarray, setid] = useState("");
	const [file, setfile] = useState("");
	const [searchres, setsearchres] = useState("");
	const [loading, setloading] = useState(true);
	const [user_id, setuser_id] = useState("");
	const [user_name, setuser_name] = useState("");
	const [userTA, setuserTA] = useState(false);
	const [newappinfo, setnewappinfo] = useState({
		app_small_description: "a",
		app_name: props.name,
		app_owner: "",
		app_web_url: "",
		app_logo_url: file,
		app_tags: [],
	});
	function ValidURL(str) {
		var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
		if (!regex.test(str)) {
			alert("Please enter valid URL.");
			return false;
		} else {
			return true;
		}
	}
	let handleChange = (key, value) => {
		if (key === "app_tags") {
			const app_tags = [];
			app_tags.push(value);
			setnewappinfo({ ...newappinfo, [key]: app_tags });
		} else {
			setnewappinfo({ ...newappinfo, [key]: value });
		}
	};
	const handleFile = (event) => {
		if (event.target.files && event.target.files[0]) {
			let reader = new FileReader();
			reader.onload = (e) => {
				setfile(e.target.result);
				setnewappinfo({ ...newappinfo, app_logo_url: e.target.result });
			};
			reader.readAsDataURL(event.target.files[0]);
		}
	};

	const handleURL = (key, value) => {
		setnewappinfo({ ...newappinfo, [key]: value });
	};
	const handleChange2 = (newValue1, newValue2) => {
		let temp = [];
		if (newValue1 && newValue1.length > 0) {
			newValue1.forEach((el) => {
				temp.push(el.value);
			});
		}
		setnewappinfo({ ...newappinfo, app_tags: temp });
	};
	const updatevaluefrommodal = (user_id, user_name) => {
		setuser_id(user_id);
		setuser_name(user_name);
		const temp = { ...newappinfo };
		temp.app_owner = {
			user_id: user_id,
			user_name: user_name,
		};
		setnewappinfo(temp);
	};
	const handleChangeOwner = (key, value) => {
		if (value.length > 0) {
			setuserTA(true);
		} else {
			setuserTA(false);
		}
		getSearch(value).then((res) => {
			setsearchres(res);
			setloading(false);
		});
		setuser_name(value);
	};
	let addCardClose = () => setuserTA(false);
//	console.log(newappinfo);
	return (
		<>
			<div
				show={props.show}
				onHide={props.onHide}
				className="addContractModal__TOP"
				style={{ height: "100%" }}
			>
				<div
					className="d-flex flex-row  align-items-center"
					style={{ marginTop: "24px" }}
				>
					<div style={{ marginLeft: "180px" }}>
						<span className="contracts__heading">
							Add Application
						</span>
					</div>
					<img
						alt="Close"
						onClick={props.onHide}
						src={close}
						style={{ marginLeft: "150px", cursor: "pointer" }}
					/>
				</div>
				<hr
					style={{
						marginBottom: "0px",
						marginLeft: "6px",
						marginRight: "6px",
					}}
				/>

				<div className="allapps__uppermost">
					<Form style={{ width: "100%" }}>
						<Form.Group
							style={{
								margin: "12px 0px 16px",

								fontSize: "12px",
							}}
						>
							<Form.Label>Select Application</Form.Label>
							<Form.Control
								style={{ width: "100%" }}
								type="text"
								defaultValue={props.name}
								placeholder="Application"
								onChange={(e) =>
									handleChange("app_name", e.target.value)
								}
							/>
						</Form.Group>
					</Form>
				</div>
				<div className="addappsmodal__middle">
					<div className="addappsmodal__newapps__newer">
						<Form>
							<Form.Group
								style={{
									fontSize: "12px",
								}}
							>
								<Form.Label>Website</Form.Label>
								<Form.Control
									style={{ width: "100%" }}
									type="text"
									placeholder="Application"
									onChange={(e) =>
										handleURL("app_web_url", e.target.value)
									}
								/>
							</Form.Group>
						</Form>
						<div className="addappsmodal__newapps__d1">
							App Logo
						</div>
						<div className="addappsmodal__newapps__d2">
							<div className="addappsmodal__newapps__d2__d1">
								<img
									src={file ? file : uploadimage}
									style={{ width: "87px", height: "82px" }}
								></img>
							</div>
							<label className="custom-file-addapps">
								<input
									type="file"
									accept="image/*"
									onChange={(e) => handleFile(e)}
								></input>
								Select File
							</label>
						</div>
						<Form style={{ marginTop: "24px" }}>
							<Form.Group
								controlId="exampleForm.ControlTextarea1"
								style={{
									fontSize: "12px",
								}}
							>
								<Form.Label>Description</Form.Label>
								<Form.Control
									as="textarea"
									rows="4"
									placeholder="Description"
									style={{
										color: "#DDDDDD",
										fontSize: "14px",
									}}
									onChange={(e) =>
										handleChange(
											"app_description",
											e.target.value
										)
									}
								/>
							</Form.Group>
							<Form.Group
								style={{
									fontSize: "12px",
								}}
							>
								<Form.Label>Category</Form.Label>
								<Form.Control
									style={{ width: "100%" }}
									type="text"
									placeholder="Add Category"
									onChange={(e) =>
										handleChange(
											"app_category",
											e.target.value
										)
									}
								/>
							</Form.Group>
							<div style={{ position: "relative" }}>
								<Form.Group
									style={{
										fontSize: "12px",
									}}
								>
									<Form.Label>Owner</Form.Label>
									<Form.Control
										style={{ width: "100%" }}
										type="text"
										value={user_name}
										placeholder="Add Owner"
										onChange={(e) =>
											handleChangeOwner(
												"app_owner",
												e.target.value
											)
										}
									/>
								</Form.Group>
								{userTA ? (
									<SuggestionBar
										options={searchres.results}
										loading={loading}
										onHide={addCardClose}
										handleSelect={updatevaluefrommodal}
									></SuggestionBar>
								) : null}
							</div>
							<Form.Group
								style={{
									fontSize: "12px",
								}}
							>
								<Form.Label>Tags</Form.Label>

								<CreatableSelect
									className="select-filter-container"
									classNamePrefix="select-filter"
									isMulti
									onChange={(event) => handleChange2(event)}
								/>
							</Form.Group>
						</Form>
					</div>
				</div>

				<hr className="addApps__foothr" />
				<div className="addAppsModal__footer">
					<button className="btn btn-link" onClick={props.onHide}>
						Cancel
					</button>
					<Button
						type="button"
						onClick={() => {
							if (ValidURL(newappinfo.app_web_url)) {
								props.handleAdd1(newappinfo);
							}
						}}
						style={{ marginRight: "40px" }}
					>
						Add Application
					</Button>
				</div>
			</div>
		</>
	);
}
