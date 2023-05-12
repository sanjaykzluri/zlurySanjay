import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchApplicationCompliance } from "../../../actions/applications-action";
import tick from "../../../assets/green_tick.svg";
import restricted from "../../../assets/applications/restricted.svg";
import warning from "../../../assets/icons/delete-warning.svg";
import search from "../../../assets/search.svg";
import Add from "../../../assets/add.svg";
import _ from "underscore";
import "./styles.css";
import ComplianceDetailsSection from "./ComplianceDetails";
import { capitalizeFirstLetter } from "../../../utils/common";
import moment from "moment";
import { AddCompliance } from "./AddCompliance";
import ContentLoader from "react-content-loader";
import common_empty from "../../../assets/common/common_empty.png";
import { Button } from "../../../UIComponents/Button/Button";
import needsreview from "../../../assets/applications/needsreview.svg";
import { EmptySearch } from "../../../common/EmptySearch";
import { NameBadge } from "../../../common/NameBadge";
import { UTCDateFormatter } from "utils/DateUtility";

export default function ComplianceTab({ application, dataUnavailable }) {
	const [complianceData, setComplianceData] = useState([]);
	const [error, setError] = useState(false);
	const [showComplianceDetail, setShowComplianceDetail] = useState(false);
	const [showAddCompliance, setShowAddCompliance] = useState(false);
	const [selectedCompliance, setSelectedCompliance] = useState();
	const [editMode, setEditMode] = useState(false);
	const data = useSelector(
		(state) =>
			state.applications?.singleappSecurityCompliance?.[
				application?.app_id
			]?.data
	);
	const loading = useSelector(
		(state) =>
			state.applications?.singleappSecurityCompliance?.[
				application?.app_id
			]?.loading
	);
	const [filteredCompliances, setFilteredCompliances] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [noCompliances, setNoCompliances] = useState(true);
	const dispatch = useDispatch();
	useEffect(() => {
		if (application) {
			dispatch(fetchApplicationCompliance(application.app_id));
		}
	}, [application]);

	const handleComplianceSubmit = () => {
		dispatch(fetchApplicationCompliance(application.app_id));
		setShowAddCompliance(false);
	};
	useEffect(() => {
		if (data?.compliances) {
			setComplianceData(data?.compliances);
			setFilteredCompliances(data?.compliances);
			if (data?.compliances?.length === 0) {
				setNoCompliances(true);
			} else {
				setNoCompliances(false);
			}
		}
	}, [data?.compliances]);

	useEffect(() => {
		if (loading) {
			setFilteredCompliances([]);
		}
	}, [loading]);

	const handleSearchQuery = (event) => {
		const query = event.target.value?.trimStart();
		if (query.length === 0) {
			setFilteredCompliances(complianceData);
		}
		setSearchTerm(query);
		let tempFilteredCompliances = _.filter(complianceData, (compliance) => {
			return compliance.compliance_name
				?.toLocaleLowerCase()
				.includes(query?.toLocaleLowerCase());
		});
		setFilteredCompliances(tempFilteredCompliances);
	};

	const handleComplianceEdit = (compliance) => {
		setShowComplianceDetail(false);
		setEditMode(true);
		setShowAddCompliance(true);
	};

	return (
		<div className="compliance__Section__wrapper d-flex flex-column">
			{loading ? (
				<div className="d-flex flex-wrap">
					{_.times(6, (number) => (
						<>
							<div
								className="complianceCard mb-3 ml-3 mr-3"
								key={number}
							>
								<ContentLoader height="200" width="100%">
									<rect
										width="50"
										height="50"
										rx="25"
										fill="#EBEBEB"
										y="1"
										x="50"
									/>
									<rect
										width="50%"
										height="17"
										rx="2"
										x={200}
										fill="#EBEBEB"
										y="65"
										x="20"
									/>
									<rect
										width="50%"
										height="12"
										rx="2"
										x={250}
										fill="#EBEBEB"
										y="93"
										x="20"
									/>
								</ContentLoader>
							</div>
						</>
					))}
				</div>
			) : (
				<>
					{!noCompliances > 0 && (
						<div className="d-flex justify-content-end mr-2">
							<div className="complianceSearchBox">
								<img
									src={search}
									className="ml-2 mr-2 mt-auto mb-auto"
								/>
								<input
									type="text"
									className="compliance__input border-0 bg-white"
									value={searchTerm}
									placeholder="Search Compliances"
									onChange={(e) => handleSearchQuery(e)}
								/>
							</div>
							<button
								className="compliancead mt-auto mb-auto ml-3"
								onClick={() => {
									setEditMode(false);
									setShowAddCompliance(true);
								}}
							>
								<img src={Add} />
							</button>
							{/* <img src={search} aria-hidden="true" /> */}
						</div>
					)}
					{filteredCompliances &&
					Array.isArray(filteredCompliances) &&
					filteredCompliances.length === 0 ? (
						<>
							{_.isEmpty(searchTerm) ? (
								<div
									className="d-flex flex-column"
									style={{ height: "50vh" }}
								>
									<img
										src={common_empty}
										className="mt-auto ml-auto mr-auto"
									/>
									<div className="ml-auto mb-auto mr-auto mt-2 d-flex flex-column">
										<div className="grey font-16 bold-600 text-center">
											No compliance added
										</div>
										<Button
											onClick={() =>
												setShowAddCompliance(true)
											}
											className="ml-auto mr-auto mt-2"
										>
											Add Compliance
										</Button>
									</div>
								</div>
							) : (
								<EmptySearch
									searchQuery={searchTerm}
									minHeight={"50vh"}
								/>
							)}
						</>
					) : (
						<div className="compilance__item__wrapper justify-content-center">
							{Array.isArray(filteredCompliances) &&
								filteredCompliances.map((compliance) => (
									<div
										className="compilance__item"
										onClick={() => {
											setShowComplianceDetail(false);
											setSelectedCompliance(compliance);
											setShowComplianceDetail(true);
										}}
									>
										<div className="compilance__item-name-wrap mt-auto">
											<div className="compilance_logo">
												{compliance.compliance_image ? (
													<img
														width={60}
														src={
															compliance.compliance_image
														}
														alt={
															compliance.compliance_name
														}
													/>
												) : (
													<NameBadge
														name={
															compliance.compliance_name
														}
														width={60}
														className="rounded-circle"
													/>
												)}
											</div>
											<div className="compliance_name text-center">
												{compliance.compliance_name}
											</div>
											<div className="compilance_status approved text-center">
												<img
													src={
														compliance.compliance_status ===
														"rejected"
															? restricted
															: compliance?.compliance_status ===
																	"available" ||
															  compliance?.compliance_status ===
																	"approved"
															? tick
															: needsreview
													}
													height="12"
													width="12"
													style={{
														marginBottom: "2.2px",
													}}
												/>{" "}
												{capitalizeFirstLetter(
													compliance.compliance_status
														? compliance.compliance_status
														: "Review Now"
												)}
											</div>
										</div>
										<div
											className={`compilance_expiray mt-auto ${
												!compliance.compliance_expires_on
													? "background-color-white"
													: ""
											}`}
										>
											{compliance.compliance_expires_on && (
												<>
													<span className="expiry">
														EXPIRES ON
													</span>
													<span className="expiry_date">
														{dataUnavailable ||
														!compliance.compliance_expires_on ? (
															<div className="grey-1 font-1 value o-5">
																Data Unavailable
															</div>
														) : (
															UTCDateFormatter(
																compliance.compliance_expires_on
															)
														)}
													</span>
												</>
											)}
										</div>
									</div>
								))}
							{Array.isArray(filteredCompliances) &&
								filteredCompliances.length === 0 && (
									<div
										className="d-flex flex-column"
										style={{ height: "50vh" }}
									>
										<img
											src={common_empty}
											className="mt-auto ml-auto mr-auto"
										/>
										<div className="grey font-16 bold-600 text-center ml-auto mb-auto mr-auto mt-2">
											Nothing here
										</div>
									</div>
								)}
						</div>
					)}

					{showComplianceDetail && (
						<ComplianceDetailsSection
							application={application}
							compliance={selectedCompliance}
							onHide={() => setShowComplianceDetail(false)}
							onEdit={handleComplianceEdit}
						/>
					)}
					{showAddCompliance && (
						<AddCompliance
							editMode={editMode}
							application={application}
							compliance={selectedCompliance}
							onSubmit={handleComplianceSubmit}
							onHide={() => setShowAddCompliance(false)}
							complianceIdArray={
								Array.isArray(complianceData)
									? complianceData.map(
											(compliance) =>
												compliance.compliance_id
									  )
									: []
							}
						/>
					)}
				</>
			)}
		</div>
	);
}
