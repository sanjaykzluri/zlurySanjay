import React, { useState, useEffect } from "react";
import "./General.css";
import { Form, Row, Col, Spinner, Button } from "react-bootstrap";
import {
	fetchPrimarySources,
	fetchTrustedDomains,
	getGeneralOrgSettings,
	updateOrgDetails,
	updateOrgOwners,
} from "../../../services/api/settings";
import { AsyncTypeahead } from "../../../common/Typeahead/AsyncTypeahead";
import { searchUsers } from "../../../services/api/search";
import { Loader } from "../../../common/Loader/Loader";
import { ImmutableSet } from "../../../utils/common";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet";
import { FULL_MONTH } from "../../../utils/DateUtility";
import { displaySources } from "../../Applications/ApplicationUtil";
import PrimarySources from "./PrimarySources";
import RoleContext from "services/roleContext/roleContext";
import { useContext } from "react";
import { getValueFromLocalStorage } from "utils/localStorage";
import { PARTNER } from "modules/shared/constants/app.constants";

export function General() {
	const OWNER_TYPES = {
		IT: "it",
		PAYMENT: "payment",
	};
	const calendarMonths = FULL_MONTH;
	const [orgDetails, setOrgDetails] = useState({
		name: "",
		fy_start: undefined,
		fy_end: undefined,
		currency: "",
		payment_owner: "",
		payment_owner_id: "",
		it_owner: "",
		it_owner_id: "",
	});
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [previousOrgDetails, setPreviousOrgDetails] = useState();
	const [updatedFieldNames, setUpdatedFieldNames] = useState(
		new ImmutableSet()
	);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const { partner } = useContext(RoleContext);
	useEffect(() => {
		//Segment Implementation
		window.analytics.page("Settings", "General", {
			orgId: orgId || "",
			orgName: orgName || "",
		});

		getGeneralOrgSettings().then((res) => {
			let { name, fy_start, fy_end, currency, payment_owner, it_owner } =
				res.settings;

			const orgDetails = {
				name,
				fy_start,
				fy_end,
				currency,
				payment_owner: payment_owner?.name,
				payment_owner_id: payment_owner?._id,
				it_owner: it_owner?.name,
				it_owner_id: it_owner?._id,
			};
			setOrgDetails(orgDetails);

			setPreviousOrgDetails(orgDetails);
			setLoading(false);
		});
	}, []);

	const handleOrgDetailsChange = (key, value) => {
		if (previousOrgDetails[key] !== value) {
			setUpdatedFieldNames(updatedFieldNames.add(`org-${key}`));
		} else {
			setUpdatedFieldNames(updatedFieldNames.delete(`org-${key}`));
		}
		setOrgDetails({
			...orgDetails,
			[key]: value,
		});
	};

	const handlePaymentOwnerChange = (owner) => {
		if (previousOrgDetails?.payment_owner_id !== owner.user_id) {
			setUpdatedFieldNames(updatedFieldNames.add("payment_owner"));
		} else {
			updatedFieldNames.delete("payment_owner");
			setUpdatedFieldNames(updatedFieldNames.delete("payment_owner"));
		}
		setOrgDetails({
			...orgDetails,
			payment_owner: owner.user_name,
			payment_owner_id: owner.user_id,
		});

		updateOrgOwners({ type: OWNER_TYPES.PAYMENT, owner_id: owner.user_id })
			.then((res) => {
				// Do nothing
			})
			.catch((err) => {
				console.error("Error while updating Payment owner:", err);
			});
	};

	const handleITOwnerChange = (owner) => {
		if (!owner) return;
		if (previousOrgDetails?.it_owner_id !== owner?.user_id) {
			setUpdatedFieldNames(updatedFieldNames.add("it_owner"));
		} else {
			updatedFieldNames.delete("it_owner");
			setUpdatedFieldNames(updatedFieldNames.delete("it_owner"));
		}
		setOrgDetails({
			...orgDetails,
			it_owner: owner?.user_name,
			it_owner_id: owner?.user_id,
		});

		updateOrgOwners({ type: OWNER_TYPES.IT, owner_id: owner.user_id })
			.then((res) => {
				// Do nothing
			})
			.catch((err) => {
				console.error("Error while updating IT owner:", err);
			});
	};

	const handleSaveClick = () => {
		//Segment Implementation
		window.analytics.track("Clicked on Save General Settings", {
			currentCategory: "Settings",
			currentPageName: "General",
			orgId: orgId || "",
			orgName: orgName || "",
		});
		setSaving(true);
		updateOrgDetails(orgDetails)
			.then((res) => {
				setSaving(false);
				if (res.error) {
					console.error("Error while updating org details");
				}
			})
			.catch((err) => {
				setSaving(false);
				console.error("Error while updating org details", err);
			});
	};

	let [trustedDomains, setTrustedDomains] = useState();
	let [primarySources, setPrimarySources] = useState();

	async function getTrustedDomains() {
		let data = await fetchTrustedDomains();
		setTrustedDomains(data.data.domains);
	}

	async function getPrimarySources() {
		let data = await fetchPrimarySources();
		setPrimarySources(data.data);
	}

	useEffect(() => {
		getTrustedDomains();
		getPrimarySources();
	}, []);

	return (
		<>
			<Helmet>
				<title>
					{"General Settings - " +
						getValueFromLocalStorage("userInfo")?.org_name +
						" - " +
						getValueFromLocalStorage("partner")?.name}
				</title>
			</Helmet>
			<div className="acc__cont">
				<div className="acc__cont__d1">Your Organization</div>
				{!loading ? (
					<>
						<div className="acc__cont__d2 justify-content-between">
							<div>Organization Details</div>
							<Button
								className="z-btn-primary"
								disabled={
									!orgDetails.name ||
									saving ||
									updatedFieldNames.set.size === 0
								}
								onClick={handleSaveClick}
							>
								Save
								{saving && (
									<Spinner
										animation="border"
										role="status"
										variant="light"
										size="sm"
										className="ml-2"
										style={{ borderWidth: 2 }}
									>
										<span className="sr-only">
											Loading...
										</span>
									</Spinner>
								)}
							</Button>
						</div>
						<Form style={{ marginTop: "24px" }}>
							<Row>
								<Col sm="6">
									<Form.Group>
										<Form.Label bsPrefix="acc__label">
											Company Name
										</Form.Label>
										<Form.Control
											bsCustomPrefix="acc__control"
											type="text"
											placeholder="Enter Name"
											value={orgDetails.name}
											isInvalid={!orgDetails.name}
											onChange={(e) =>
												handleOrgDetailsChange(
													"name",
													e.target.value
												)
											}
										/>
										<Form.Control.Feedback type="invalid">
											Please enter valid name
										</Form.Control.Feedback>
									</Form.Group>
								</Col>
								<Col sm="6">
									<Form.Group controlId="formCurency">
										<Form.Label bsPrefix="acc__label">
											Default Currency
										</Form.Label>
										<Form.Control
											bsCustomPrefix="acc__control"
											value={orgDetails.currency}
											disabled={true}
										></Form.Control>
									</Form.Group>
								</Col>
								<Col sm="6">
									<Form.Group controlId="formFinancialYearStart">
										<Form.Label bsPrefix="acc__label">
											Financial year begins from
										</Form.Label>
										<Form.Control
											bsCustomPrefix="acc__control"
											as="select"
											disabled={true}
										>
											{calendarMonths.map(
												(month, index) => {
													return (
														<option
															value={index + 1}
															selected={
																orgDetails.fy_start ==
																index + 1
															}
														>
															{month}
														</option>
													);
												}
											)}
										</Form.Control>
									</Form.Group>
								</Col>
							</Row>
						</Form>
						<hr style={{ margin: "32px 0px 0px" }}></hr>
						<div className="acc__cont__d2">Organization Owners</div>
						<Form style={{ marginTop: "24px" }}>
							<Row>
								<Col>
									<AsyncTypeahead
										label="Payment Owner"
										placeholder="Enter Name"
										defaultValue={orgDetails.payment_owner}
										fetchFn={searchUsers}
										onSelect={handlePaymentOwnerChange}
										keyFields={{
											id: "user_id",
											image: "profile_img",
											value: "user_name",
											email: "user_email",
										}}
										allowFewSpecialCharacters={true}
									/>
								</Col>
								<Col>
									<AsyncTypeahead
										label="IT Owner"
										placeholder="Enter Name"
										defaultValue={orgDetails.it_owner}
										fetchFn={searchUsers}
										onSelect={handleITOwnerChange}
										keyFields={{
											id: "user_id",
											image: "profile_img",
											value: "user_name",
											email: "user_email",
										}}
										allowFewSpecialCharacters={true}
									/>
								</Col>
							</Row>
						</Form>
						<hr style={{ margin: "32px 0px 0px" }}></hr>
						<div className="acc__cont__d2 mb-2">
							Trusted Domains
						</div>
						<div style={{ fontSize: "12px" }}>
							The list of domains identified from various sources
						</div>
						<div className="mt-4">
							<table
								style={{
									backgroundColor: "#F5F6F9",
									border: "1px solid #DDDDDD",
									width: "55%",
								}}
								className="table table-hover mb-0"
							>
								<thead className="">
									<tr className="table__header">
										<th
											className="selection-cell-header"
											data-row-selection="true"
										>
											<div className="flex">Domain</div>
										</th>
										<th
											className="selection-cell-header"
											data-row-selection="true"
										>
											<div className="flex">Source</div>
										</th>
									</tr>
								</thead>
								<tbody
									style={{ width: "100%" }}
									id="scrollRoot"
								>
									{trustedDomains &&
										trustedDomains.map((domain, key) => (
											<tr className={`table__row `}>
												<td>
													<span
														style={{
															marginLeft: "5px",
														}}
													>
														{domain.domain_name}
													</span>
													{domain.is_verified && (
														<span
															style={{
																color: "#5FCF64",
																fontSize:
																	"10px",
																marginLeft:
																	"5px",
																padding: "2px",
															}}
														>
															Verified
														</span>
													)}
												</td>
												<td>
													<div className="flex">
														{domain?.integration_ids &&
															displaySources(
																domain?.integration_ids
															)}
													</div>
												</td>
											</tr>
										))}
								</tbody>
							</table>
						</div>

						<hr style={{ margin: "32px 0px 0px" }}></hr>
						<PrimarySources primarySources={primarySources} />
					</>
				) : (
					<div className="d-flex align-items-center h-100">
						<Loader width={60} height={60} />
					</div>
				)}
			</div>
		</>
	);
}
