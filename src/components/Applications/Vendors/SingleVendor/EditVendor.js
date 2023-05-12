import React, { useEffect, useState } from "react";
import close from "../../../../assets/close.svg";
import vendorLogoUpload from "../../../../assets/vendorLogoUpload.svg";
import { Form, Button, Spinner, Col, Row } from "react-bootstrap";
import "../Vendors.css";
import { SUPPORTED_IMAGE_FORMATS } from "../../../../constants/upload";
import { uploadImage } from "../../../../services/upload/upload";
import { TriggerIssue } from "../../../../utils/sentry";
import { Loader } from "../../../../common/Loader/Loader";
import { searchUsers } from "../../../../services/api/search";
import { AsyncTypeahead } from "../../../../common/Typeahead/AsyncTypeahead";
import { editVendor } from "../../../../services/api/applications";
import { useDidUpdateEffect } from "../../../../utils/componentUpdateHook";
import Tags from "@yaireo/tagify/dist/react.tagify";
import deleteIcon from "../../../../assets/deleteIcon.svg";
import { isEmpty, unescape } from "../../../../utils/common";
import { CustomFieldSectionInForm } from "../../../../modules/shared/components/CustomFieldSectionInForm/CustomFieldSectionInForm";
import { CUSTOM_FIELD_ENTITY } from "../../../../modules/custom-fields/constants/constant";

export function EditVendor(props) {
	const invalidValues = ["", null, undefined, []];
	const defaultVendorState = {
		vendor_name: null,
		vendor_logo: null,
		vendor_type: "direct_seller",
		category: [],
		owner: null,
		website: null,
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
		status: "active",
	};
	const contactObj = {
		name: null,
		designation: null,
		type: "support",
		phone: null,
		email: null,
	};
	const [vendor, setVendor] = useState({ ...defaultVendorState });
	const [vendorLogo, setVendorLogo] = useState(vendorLogoUpload);
	const [submitting, setSubmitting] = useState(false);
	const [validated, setValidated] = useState(false);
	const [logoUploading, setLogoUploading] = useState(false);
	const [validation, setValidation] = useState({});
	const hiddenFileInputBtn = React.useRef(null);
	const [clickedOnSubmit, setClickedOnSubmit] = useState(false);
	const [formErrors, setFormErrors] = useState([]);
	useEffect(() => {
		if (props.vendor) {
			const { vendor } = props;
			let temp = {
				...defaultVendorState,
				vendor_name: vendor?.name,
				vendor_logo: vendor?.logo,
				vendor_type: vendor?.type,
				category: vendor?.category,
				owner: vendor?.owner?.owner_id,
				website: unescape(vendor?.website),
				contacts: vendor?.contact_details || [],
				custom_fields: vendor?.vendor_field_data || [],
			};
			setVendor(temp);
			if (vendor?.logo) {
				setVendorLogo(vendor?.logo);
			}
		}
		validateVendor(vendor);
	}, [props.vendor]);

	const handleAddLogoClicked = () => {
		hiddenFileInputBtn.current.click();
	};

	const handleVendorLogoChange = (e) => {
		let file = e.target.files[0];
		setLogoUploading(true);
		uploadImage(file)
			.then((res) => {
				setVendorLogo(res.resourceUrl);
				setLogoUploading(false);
			})
			.catch((error) => {
				TriggerIssue("Error in uploading vendor logo", error);
				setLogoUploading(false);
			});
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
			tempContacts[index][key] = value;
		}

		setVendor({
			...vendor,
			contacts: tempContacts,
		});
	};

	const isInvalid = (fieldName) => !!validation[fieldName]?.msg;

	const validateField = (fieldName, value) => {
		if (!value) {
			setValidation({
				...validation,
				...{ [fieldName]: { msg: `Please enter ${fieldName}` } },
			});
		} else if (validation[fieldName]) {
			delete validation[fieldName];
			setValidation({ ...validation });
		}
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
							Please enter the contact name.
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
						checked={vendor.contacts?.[index].type === "support"}
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
						checked={vendor.contacts?.[index].type === "finance"}
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
						checked={vendor.contacts?.[index].type === "sales"}
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

	useDidUpdateEffect(() => {
		if (vendorLogo) {
			setVendor({
				...vendor,
				["vendor_logo"]:
					vendorLogo === vendorLogoUpload ? null : vendorLogo,
			});
		}
	}, [vendorLogo]);

	const handleSubmit = (e) => {
		let escapedAppLogo = vendor.vendor_logo;
		let unescapedAppLogo = escapedAppLogo ? unescape(escapedAppLogo) : null;
		let finalVendorObj = { ...vendor, ["vendor_logo"]: unescapedAppLogo };
		setVendor(finalVendorObj);
		setClickedOnSubmit(true);
		e.preventDefault();
		if (finalVendorObj) {
			let errors = validateVendor(finalVendorObj);
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

		editVendor(finalVendorObj, props.vendor._id)
			.then((res) => {
				setSubmitting(false);
				if (res.status === "success") {
					props.fetchVendorOverview();
					props.onHide();
				}
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
				TriggerIssue("Unable to edit vendor", err);
			});
	};

	const onValueChangeFromCustomFields = (id, val) => {
		if (typeof val === "string") {
			val = val?.trimStart();
		}
		const customFields = [...vendor.custom_fields];
		const index = customFields.findIndex((cf) => cf.field_id === id);
		customFields.splice(index, index > -1 ? 1 : 0, {
			...customFields[index],
			field_id: id,
			field_value: val,
		});
		setVendor({ ...vendor, ...{ custom_fields: customFields } });
	};

	return (
		<>
			<div show={props.show} className="addContractModal__TOP">
				<div className="d-flex flex-row align-items-center py-4">
					<div className="m-auto">
						<span className="contracts__heading">Edit Vendor</span>
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
											src={unescape(vendorLogo)}
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
										required
										id="vendor_logo"
										accept={SUPPORTED_IMAGE_FORMATS.toString()}
										style={{ display: "none" }}
									>
										<Form.File.Input
											onChange={handleVendorLogoChange}
											ref={hiddenFileInputBtn}
											disabled={logoUploading}
										/>
									</Form.File>
								</div>
								<div className="w-100 ml-5">
									<Form.Label>Vendor Name</Form.Label>
									<Form.Control
										isInvalid={isInvalid("vendor_name")}
										placeholder="Vendor Name"
										className="w-100"
										type="text"
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
							<div className="w-100">
								<Form.Group>
									<Form.Label>Category</Form.Label>
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
												vendor.vendor_type ===
												"reseller"
											}
										/>
									</Form.Group>
								</Form.Group>
								<Form.Group>
									<Form.Label>Category</Form.Label>
									<Form.Group
										style={{
											fontSize: "12px",
										}}
									>
										<Tags
											value={vendor.category?.join(",")}
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
														? e.target.value.split(
																","
														  )
														: []
												)
											}
										/>
									</Form.Group>
									<Form.Control.Feedback type="invalid">
										Please enter the vendor cateogry.
									</Form.Control.Feedback>
								</Form.Group>
								<Form.Group>
									<AsyncTypeahead
										label="Owner"
										placeholder="Owner"
										fetchFn={searchUsers}
										invalidMessage="Please select the owner."
										defaultValue={
											props.vendor?.owner?.owner_name
										}
										onSelect={(selection) =>
											handleVendorChange(
												"owner",
												selection.user_id
											)
										}
										keyFields={{
											id: "user_id",
											image: "profile_img",
											value: "user_name",
											email: "user_email",
										}}
										isInvalid={isInvalid("owner")}
										invalidMsgClassName={
											isInvalid("owner")
												? "d-block"
												: null
										}
										allowFewSpecialCharacters={true}
									/>
									<Form.Control.Feedback type="invalid">
										Please enter the vendor cateogry.
									</Form.Control.Feedback>
								</Form.Group>
								<Form.Group>
									<Form.Label>Website</Form.Label>
									<Form.Control
										required
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
										onChange={(e) =>
											handleVendorChange(
												"website",
												e.target.value
											)
										}
									/>
									<Form.Control.Feedback type="invalid">
										Please enter a valid vendor website.
									</Form.Control.Feedback>
								</Form.Group>
								<CustomFieldSectionInForm
									customFieldData={vendor.custom_fields}
									of={CUSTOM_FIELD_ENTITY.VENDORS}
									onValueChange={(id, val) =>
										onValueChangeFromCustomFields(id, val)
									}
								/>
								<div className="w-100">
									CONTACT DETAILS
									<hr
										style={{
											width: "100%",
											marginTop: "0px",
										}}
									></hr>
								</div>
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
							Save
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
