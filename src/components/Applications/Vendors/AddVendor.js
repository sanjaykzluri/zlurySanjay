import React, { useCallback, useEffect, useRef, useState } from "react";
import Tags from "@yaireo/tagify/dist/react.tagify";
import close from "../../../assets/close.svg";
import vendorLogoUpload from "../../../assets/vendorLogoUpload.svg";
import { Form, Button, Spinner, Col, Row } from "react-bootstrap";
import "./Vendors.css";
import { SUPPORTED_IMAGE_FORMATS } from "../../../constants/upload";
import { uploadImage } from "../../../services/upload/upload";
import { TriggerIssue } from "../../../utils/sentry";
import { Loader } from "../../../common/Loader/Loader";
import { addVendor } from "../../../services/api/applications";
import { SuggestionMenu } from "../../../common/SuggestionMenu/SuggestionMenu";
import {
	checkSpecialCharacters,
	searchUsers,
} from "../../../services/api/search";
import { debounce, isEmpty } from "../../../utils/common";
import { useDidUpdateEffect } from "../../../utils/componentUpdateHook";
import { client } from "../../../utils/client";
import deleteIcon from "../../../assets/deleteIcon.svg";
import { CustomFieldSectionInForm } from "../../../modules/shared/components/CustomFieldSectionInForm/CustomFieldSectionInForm";
import { CUSTOM_FIELD_ENTITY } from "../../../modules/custom-fields/constants/constant";

export function AddVendor(props) {
	const defaultVendorState = {
		vendor_name: null,
		vendor_logo: null,
		vendor_type: "direct_seller",
		category: [],
		owner: null,
		website: null,
		status: "active",
		custom_fields: [],
		contacts: [
			{
				name: null,
				designation: null,
				type: "support",
				phone: null,
				email: null,
			},
		],
	};
	const contactObj = {
		name: null,
		designation: null,
		type: "support",
		phone: null,
		email: null,
	};
	const [vendor, setVendor] = useState({ ...defaultVendorState });
	const [submitting, setSubmitting] = useState(false);
	const [vendorLogo, setVendorLogo] = useState(vendorLogoUpload);
	const [showUserSuggestions, setShowUserSuggestions] = useState(false);
	const [logoUploading, setLogoUploading] = useState(false);
	const hiddenFileInputBtn = React.useRef(null);
	const [userSuggestionsLoading, setUserSuggestionsLoading] = useState(true);
	const [userSuggestions, setUserSuggestions] = useState([]);
	const [validation, setValidation] = useState({});
	const [clickedOnSubmit, setClickedOnSubmit] = useState(false);
	const [appOwnerQuery, setAppOwnerQuery] = useState("");
	const [formErrors, setFormErrors] = useState([]);
	const cancelToken = useRef();

	const handleAddLogoClicked = () => {
		hiddenFileInputBtn.current.click();
	};

	const isInvalid = (fieldName) => !!validation[fieldName]?.msg;

	const validateField = (fieldName, value) => {
		if (isEmpty(value)) {
			setValidation({
				...validation,
				...{ [fieldName]: { msg: `Please enter ${fieldName}` } },
			});
		} else if (validation[fieldName]) {
			delete validation[fieldName];
			setValidation({ ...validation });
		}
	};

	const handleVendorLogoChange = (e) => {
		let file = e.target.files[0];
		setLogoUploading(true);
		uploadImage(file)
			.then((res) => {
				setVendorLogo(res.resourceUrl);
				validateField("vendor_logo", res.resourceUrl);

				setLogoUploading(false);
			})
			.catch((error) => {
				validateField("vendor_logo", "");

				TriggerIssue("Error in uploading vendor logo", error);
				setLogoUploading(false);
			});
	};

	const validateVendor = (newvendor) => {
		const requiredFields = ["owner", "vendor_name", "website"];
		const errors = {};
		requiredFields.forEach((fieldName) => {
			if (fieldName === "category") {
				if (!newvendor[fieldName][0]) {
					errors[fieldName] = {
						msg: `Please enter ${fieldName}`,
					};
				}
			} else {
				if (!newvendor[fieldName]) {
					errors[fieldName] = {
						msg: `Please enter ${fieldName}`,
					};
				}
			}
		});
		return errors;
	};

	const handleVendorChange = (key, value) => {
		if (typeof value === "string") {
			value = value?.trimStart();
		}

		validateField(key, value);

		if (key === "category") {
			setVendor((vendor) => ({ ...vendor, category: value }));
		} else {
			setVendor({
				...vendor,
				[key]: value,
			});
		}
	};

	useDidUpdateEffect(() => {
		if (vendorLogo) {
			setVendor({
				...vendor,
				["vendor_logo"]:
					vendorLogo === vendorLogoUpload ? null : vendorLogo,
			});
		}
	}, [vendorLogo]);

	const generateUserSuggestions = useCallback(
		debounce((appOwnerQuery, reqCancelToken) => {
			if (appOwnerQuery && appOwnerQuery.length >= 1) {
				searchUsers(appOwnerQuery, reqCancelToken, true)
					.then((res) => {
						if (res.results) {
							setUserSuggestions(res.results);
						}

						setUserSuggestionsLoading(false);
					})
					.catch((err) =>
						console.error(
							"Error while searching through org users",
							err
						)
					);
			}
		}, 300)
	);

	const handleAppOwnerChange = (query) => {
		query = query?.trimStart();
		setAppOwnerQuery(query);
		validateField("owner", query);

		if (cancelToken.current)
			cancelToken.current.cancel(
				"Operation cancelled in favor of a new request"
			);

		if (query.length == 0) {
			setShowUserSuggestions(false);
			setUserSuggestionsLoading(false);
			return;
		}

		if (checkSpecialCharacters(query, true)) {
			setShowUserSuggestions(true);
			setUserSuggestionsLoading(false);
			return;
		}

		setUserSuggestionsLoading(true);
		setShowUserSuggestions(true);
		cancelToken.current = client.CancelToken.source();
		generateUserSuggestions(query, cancelToken.current);
	};

	const handleContactChange = (key, value, index) => {
		if (typeof value === "string") {
			value = value?.trimStart();
		}
		let tempContacts = [...vendor.contacts];
		let countryCode;
		let phone;
		if (key === "countryCode" || key === "phone") {
			if (typeof tempContacts[index].phone === "string") {
				[countryCode, phone] = tempContacts[index]?.phone.split("-");
			}
			if (key === "countryCode") countryCode = value;
			if (key === "phone") phone = value;
			countryCode = countryCode || "";
			phone = phone || "";
			tempContacts[index].phone = countryCode + "-" + phone;
		} else {
			let tempContactsDetails = { ...tempContacts[index], [key]: value };
			tempContacts[index] = tempContactsDetails;
		}
		setVendor({
			...vendor,
			contacts: tempContacts,
		});
	};

	const deleteContact = (index) => {
		let tempContacts = [...vendor.contacts];
		tempContacts.splice(index, 1);
		setVendor({
			...vendor,
			["contacts"]: tempContacts,
		});
	};

	const contactDetails = vendor.contacts?.map((contact, index) => (
		<div className="vendor_contact_box">
			<div className="vendor_contact_box_inner">
				<Form.Row>
					<Col>
						<Form.Label>Name</Form.Label>
						<Form.Control
							isInvalid={
								clickedOnSubmit &&
								isEmpty(vendor.contacts?.[index].name)
							}
							placeholder="Name"
							className="w-100"
							type="text"
							value={vendor.contacts?.[index].name}
							onChange={(e) =>
								handleContactChange(
									"name",
									e.target.value,
									index
								)
							}
						/>
						<Form.Control.Feedback type="invalid">
							Please enter the vendor contact name.
						</Form.Control.Feedback>
					</Col>
					<Col>
						<Form.Label>Designation</Form.Label>
						<img
							src={deleteIcon}
							className="contact_delete_icon cursor-pointer"
							onClick={() => deleteContact(index)}
						/>
						<Form.Control
							isInvalid={
								clickedOnSubmit &&
								isEmpty(vendor.contacts?.[index].designation)
							}
							placeholder="Designation"
							className="w-100"
							type="text"
							value={vendor.contacts?.[index].designation}
							onChange={(e) =>
								handleContactChange(
									"designation",
									e.target.value,
									index
								)
							}
						/>
						<Form.Control.Feedback type="invalid">
							Please enter the vendor contact designation.
						</Form.Control.Feedback>
					</Col>
				</Form.Row>
				<Form.Label className="mt-3">Type</Form.Label>
				<Row className="ml-1">
					<Form.Check
						inline
						type="radio"
						label="Support"
						name={`contactType_${index}`}
						id="support"
						defaultChecked
						onClick={() =>
							handleContactChange("type", "support", index)
						}
					/>
					<Form.Check
						inline
						type="radio"
						label="Finance"
						name={`contactType_${index}`}
						id="finance"
						onClick={() =>
							handleContactChange("type", "finance", index)
						}
					/>
					<Form.Check
						inline
						type="radio"
						label="Sales"
						name={`contactType_${index}`}
						id="sales"
						onClick={() =>
							handleContactChange("type", "sales", index)
						}
					/>
				</Row>
				<Form.Row className="mt-2">
					<Col>
						<Form.Label>Phone</Form.Label>
						<div className="d-flex">
							<Form.Control
								placeholder="Country code"
								className="flex-1"
								type="number"
								value={
									vendor.contacts?.[index]?.phone?.split(
										"-"
									)[0] || ""
								}
								onChange={(e) =>
									handleContactChange(
										"countryCode",
										e.target.value,
										index
									)
								}
							/>
							<Form.Control
								placeholder="Phone Number"
								className="flex-5"
								type="number"
								value={
									vendor.contacts?.[index]?.phone?.split(
										"-"
									)[1] || ""
								}
								onChange={(e) =>
									handleContactChange(
										"phone",
										e.target.value,
										index
									)
								}
							/>
						</div>
					</Col>
					<Col>
						<Form.Label>Email</Form.Label>
						<Form.Control
							isInvalid={
								clickedOnSubmit &&
								isEmpty(vendor.contacts?.[index].email)
							}
							placeholder="Email"
							className="w-100"
							type="text"
							value={vendor.contacts?.[index].email}
							onChange={(e) =>
								handleContactChange(
									"email",
									e.target.value,
									index
								)
							}
						/>
						<Form.Control.Feedback type="invalid">
							Please enter the vendor contact email.
						</Form.Control.Feedback>
					</Col>
				</Form.Row>
			</div>
			<Row></Row>
		</div>
	));

	const addContactToVendor = () => {
		let tempVendor = { ...vendor };
		tempVendor.contacts.push(contactObj);
		setVendor({ ...tempVendor });
	};

	const allContactFieldsFilled = () => {
		let flag = true;
		vendor.contacts.forEach((contact) => {
			Object.keys(contactObj).some((key) => {
				if (key !== "phone" && isEmpty(contact[key])) {
					flag = false;
				}
			});
		});
		return flag;
	};

	const handleSubmit = (e) => {
		setClickedOnSubmit(true);
		e.preventDefault();
		if (vendor) {
			let errors = validateVendor(vendor);
			if (Object.keys(errors).length > 0) {
				setValidation(errors);
				return;
			} else {
				if (!allContactFieldsFilled()) {
					return;
				}
			}
		}
		setSubmitting(true);

		addVendor(vendor)
			.then((res) => {
				setSubmitting(false);
				props.onSuccess(res._id, res.name, res.logo);
				props.onHide();
				setFormErrors([]);
			})
			.catch((err) => {
				setSubmitting(false);
				if (
					err.response &&
					err.response.data &&
					err.response.data.errors
				) {
					setFormErrors(err.response.data.errors.errors);
				}
				TriggerIssue("Unable to add vendor", err);
			});
	};

	const handleAppOwnerSelect = (user) => {
		const { user_id, user_name } = user;
		setVendor({
			...vendor,
			owner: user_id,
			owner_name: user_name,
		});
		setAppOwnerQuery(user_name);
		setShowUserSuggestions(false);
	};

	const onValueChangeFromCustomFields = (id, val) => {
		if (typeof val === "string") {
			val = val?.trimStart();
		}
		const state = { ...vendor };
		const index = state["custom_fields"].findIndex(
			(cf) => cf.field_id === id
		);
		state["custom_fields"].splice(index, index > -1 ? 1 : 0, {
			field_id: id,
			field_value: val,
		});
		setVendor(state);
	};

	return (
		<>
			<div show={props.show} className="addContractModal__TOP">
				<div className="d-flex flex-row align-items-center py-4">
					<div className="m-auto">
						<span className="contracts__heading">
							Add New Vendor
						</span>
					</div>
					<img
						alt="Close"
						onClick={props.onHide}
						src={close}
						className="cursor-pointer mr-4"
					/>
				</div>
				<Form className="w-100" onSubmit={handleSubmit}>
					<div
						style={{
							height: "calc(100vh - 157px)",
							overflowY: "auto",
						}}
					>
						<div
							className="allapps__uppermost border-top border-bottom"
							style={{ background: "#EBEBEB" }}
						>
							<div className="d-flex flex-row w-100">
								<div className="d-flex flex-column">
									{logoUploading ? (
										<Loader height={61} width={61} />
									) : (
										<img
											src={vendorLogo}
											height={61}
											width={61}
										/>
									)}
									<div
										onClick={handleAddLogoClicked}
										className="add_logo_btn_vendor cursor-pointer"
									>
										Add Logo
									</div>
									<Form.File
										id="vendor_logo"
										accept={SUPPORTED_IMAGE_FORMATS.toString()}
										style={{ display: "none" }}
									>
										<Form.File.Input
											onChange={handleVendorLogoChange}
											ref={hiddenFileInputBtn}
											disabled={logoUploading}
											isInvalid={isInvalid("vendor_logo")}
										/>
										<Form.Control.Feedback type="invalid">
											Please upload vendor logo.
										</Form.Control.Feedback>
									</Form.File>
								</div>
								<div className="w-100 ml-5">
									<Form.Label>Vendor Name</Form.Label>
									<Form.Control
										placeholder="Vendor Name"
										className="w-100"
										type="text"
										isInvalid={isInvalid("vendor_name")}
										value={vendor.vendor_name}
										onChange={(e) =>
											handleVendorChange(
												"vendor_name",
												e.target.value
											)
										}
									/>
									<Form.Control.Feedback type="invalid">
										Please enter the vendor name.
									</Form.Control.Feedback>
									<div
										hidden={
											!(
												isInvalid("vendor_logo") &&
												vendorLogo === vendorLogoUpload
											)
										}
									>
										<Form.Control.Feedback
											className={
												isInvalid("vendor_logo") &&
												vendorLogo === vendorLogoUpload
													? "d-block"
													: null
											}
											type="invalid"
										>
											Please upload vendor logo.
										</Form.Control.Feedback>
									</div>
								</div>
							</div>
						</div>
						<div
							className="addContractModal__body_upper_inner"
							style={{ width: "438px" }}
						>
							<Form.Group className="w-100">
								<Form.Label>Type</Form.Label>
								<Form.Group
									style={{
										fontSize: "12px",
									}}
								>
									<Form.Check
										className="pl-1"
										inline
										type="radio"
										label="Direct Seller"
										name="vendorType"
										id="direct_seller"
										onClick={() =>
											handleVendorChange(
												"vendor_type",
												"direct_seller"
											)
										}
										checked={
											vendor.vendor_type ===
											"direct_seller"
										}
									/>
									<Form.Check
										className="pl-1"
										inline
										type="radio"
										label="Reseller"
										name="vendorType"
										id="reseller"
										onClick={() =>
											handleVendorChange(
												"vendor_type",
												"reseller"
											)
										}
										checked={
											vendor.vendor_type === "reseller"
										}
									/>
								</Form.Group>
							</Form.Group>
							<Form.Group className="w-100">
								<Form.Label>Category</Form.Label>
								<Form.Group
									style={{
										fontSize: "12px",
									}}
								>
									<Tags
										value={vendor.category.join(",")}
										className="form-control"
										placeholder="Add Category"
										settings={{
											originalInputValueFormat: (
												valuesArr
											) =>
												valuesArr.map(
													(item) => item.value
												),
										}}
										onChange={(e) =>
											handleVendorChange(
												"category",
												e.target.value
													? e.target.value.split(",")
													: []
											)
										}
									/>
								</Form.Group>
								<Form.Control.Feedback type="invalid">
									Please enter the vendor cateogry.
								</Form.Control.Feedback>
							</Form.Group>
							<Form.Group className="w-100">
								<Form.Label>Owner</Form.Label>
								<Form.Control
									placeholder="Add Owner"
									className="w-100"
									type="text"
									isInvalid={isInvalid("owner")}
									value={appOwnerQuery}
									onChange={(e) =>
										handleAppOwnerChange(e.target.value)
									}
								/>
								<Form.Control.Feedback type="invalid">
									Please enter the vendor owner.
								</Form.Control.Feedback>
								<div className="position-relative w-100">
									<SuggestionMenu
										show={showUserSuggestions}
										loading={userSuggestionsLoading}
										options={userSuggestions}
										onSelect={handleAppOwnerSelect}
										dataKeys={{
											image: "profile_img",
											text: "user_name",
											email: "user_email",
										}}
									/>
								</div>
							</Form.Group>
							<Form.Group className="w-100">
								<Form.Label>Website</Form.Label>
								<Form.Control
									placeholder="Website"
									className="w-100"
									type="text"
									isInvalid={
										isInvalid("website") ||
										formErrors?.some(
											(err) => err.param === "website"
										)
									}
									value={vendor.website}
									onChange={(e) => {
										setFormErrors([]);
										handleVendorChange(
											"website",
											e.target.value
										);
									}}
								/>
								<Form.Control.Feedback type="invalid">
									Please enter a valid vendor website.
								</Form.Control.Feedback>
							</Form.Group>
							<div className="w-100">
								<CustomFieldSectionInForm
									customFieldData={vendor.custom_fields}
									of={CUSTOM_FIELD_ENTITY.VENDORS}
									onValueChange={(id, val) =>
										onValueChangeFromCustomFields(id, val)
									}
								/>
							</div>
							<div className="w-100">
								CONTACT DETAILS
								<hr
									style={{ width: "100%", marginTop: "0px" }}
								></hr>
							</div>
						</div>
						{contactDetails}
						<div
							className="Vendor__adddoc cursor-pointer"
							onClick={addContactToVendor}
						>
							<div className="Vendor__adddoc__text">
								+ Add Contact
							</div>
						</div>
						<div style={{ paddingBottom: 30 }}></div>
					</div>
					<div
						className="fixed-bottom text-right border-top border-left bg-white py-4"
						style={{
							width: "529px",
							left: "calc(100% - 529px)",
							zIndex: 200,
						}}
					>
						<Button
							variant="link"
							size="sm"
							className="mr-3"
							onClick={props.onHide}
						>
							Cancel
						</Button>
						<Button className="z-btn-primary mr-4" type="submit">
							Add Vendor
							{submitting && (
								<Spinner
									animation="border"
									role="status"
									variant="light"
									size="sm"
									className="ml-2"
									style={{ borderWidth: 2 }}
								>
									<span className="sr-only">Loading...</span>
								</Spinner>
							)}
						</Button>
					</div>
				</Form>
			</div>
		</>
	);
}
