import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import LicenseMapperHeader from "./LicenseMapperHeader";
import "./LicenseMapper.css";
import {
	getContractOverviewDetails,
	getUnmappedLicenseData,
} from "../../../../services/api/licenses";
import ContentLoader from "react-content-loader";
import {
	fetchIntegrationDetails,
	removeIntegrationDetails,
} from "../../../integrations/redux/integrations";
import { Loader } from "../../../../common/Loader/Loader";
import { Button } from "../../../../UIComponents/Button/Button";
import { booleanFieldArray } from "../../constants/LicenseConstants";
import LicenseMapperTable from "./LicenseMapperTable";
import LicenseMapperTableHelper from "./LicenseMapperTableHelper";

export default function LicenseMapping(props) {
	const location = useLocation();
	const dispatch = useDispatch();
	const [firstStep, setFirstStep] = useState(true);
	const [loadingLicenses, setLoadingLicenses] = useState(true);
	const [licenses, setLicenses] = useState([]);
	const [totalLicensesCount, setTotalLicenseCount] = useState();
	const [unmappedLicenseCount, setUnmappedLicenseCount] = useState();
	const [contractInfo, setContractInfo] = useState();
	const integration = useSelector((state) => state.integrations.integration);
	const id = window.location.pathname.split("/")[3];
	const [loadingAll, setLoadingAll] = useState({
		licenses: true,
		integration: true,
		contract: true,
	});
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		if (location?.state?.data) {
			setContractInfo(location?.state?.data);
			setLoadingAll((x) => ({ ...x, contract: false }));
		} else {
			getContractOverviewDetails(id).then((res) => {
				if (
					!res.results.checklist ||
					!Array.isArray(res.results.checklist) ||
					res.results.checklist.length === 0
				) {
					res.results.checklist = [...booleanFieldArray];
				}
				setContractInfo(res.results);
				setLoadingAll((x) => ({ ...x, contract: false }));
			});
		}
	}, []);

	useEffect(() => {
		if (location?.state?.unmappedLicenseData) {
			setLicenses(location?.state?.unmappedLicenseData);
			setLoadingLicenses(false);
			setLoadingAll((x) => ({ ...x, licenses: false }));
		} else {
			fetchUnmappedLicensesData();
		}
	}, []);

	useEffect(() => {
		if (contractInfo?.integration_id) {
			dispatch(fetchIntegrationDetails(contractInfo?.integration_id));
		}
		return () => {
			dispatch(removeIntegrationDetails());
		};
	}, [contractInfo]);

	useEffect(() => {
		if (Object.keys(contractInfo || {}).length) {
			if (contractInfo?.integration_id) {
				if (integration) {
					setLoadingAll((x) => ({ ...x, integration: false }));
				}
			} else {
				setLoadingAll((x) => ({ ...x, integration: false }));
			}
		}
	}, [integration, contractInfo]);

	useEffect(() => {
		if (licenses) {
			let totalCount = 0;
			let unmappedTotalCount = 0;
			licenses.forEach((el) => {
				totalCount += el.total_license_available;
				if (el.difference) {
					unmappedTotalCount +=
						el.unmapped_license_count + el.difference;
				} else {
					unmappedTotalCount += el.unmapped_license_count;
				}
			});
			setTotalLicenseCount(totalCount);
			setUnmappedLicenseCount(unmappedTotalCount);
		}
	}, [licenses]);

	useEffect(() => {
		if (contractInfo && Object.keys(loadingAll).length > 0) {
			let tempIndex;
			tempIndex = Object.keys(loadingAll).findIndex(
				(el) => loadingAll[el] === true
			);
			if (!contractInfo?.integration_id) {
				if (tempIndex > -1) {
					setLoaded(false);
				} else {
					setFirstStep(false);
				}
			} else {
				if (tempIndex > -1) {
					setLoaded(false);
				} else {
					setLoaded(true);
				}
			}
		}
	}, [loadingAll]);

	const fetchUnmappedLicensesData = () => {
		setLoadingLicenses(true);
		setLoadingAll((x) => ({ ...x, licenses: true }));
		getUnmappedLicenseData(id).then((res) => {
			setLicenses(res);
			setLoadingLicenses(false);
			setLoadingAll((x) => ({ ...x, licenses: false }));
		});
	};

	return (
		<>
			<div className="createplan__wrapper">
				<LicenseMapperHeader
					contractInfo={contractInfo}
					firstStep={firstStep}
					setFirstStep={setFirstStep}
					hasIntegration={contractInfo?.integration_id ? true : false}
					contractId={location?.state?.id || id}
					fetchUnmappedLicensesData={fetchUnmappedLicensesData}
				/>
				<div className="screen_wrapper d-flex">
					{firstStep ? (
						loaded ? (
							<div
								className="d-flex flex-row  justify-content-center "
								style={{
									paddingTop: "151px",
									width: "calc(100% - 293px)",
								}}
							>
								{/* {integration && (
									<div className="map_licenses_integration_box mr-2">
										<div
											className="o-4"
											style={{
												height: "80px",
												width: "80px",
												borderRadius: "50%",
												background: "#C4C4C4",
											}}
										></div>
										<div
											className="font-18 bold-600 mb-2"
											style={{ marginTop: "10px" }}
										>
											Automatic mapping via Integration
										</div>
										<div
											className="font-14 grey"
											style={{ padding: "0px 10px" }}
										>
											Connect integration to automatically
											map users to licenses and get usage
											insights
										</div>
										<IntegrationStatus
											integration={integration}
										/>
										<div className="font-10 grey-1 mt-2">
											Takes 5 mins
										</div>
									</div>
								)} */}
								<div className="map_licenses_integration_box ml-2">
									<div
										className="o-4"
										style={{
											height: "80px",
											width: "80px",
											borderRadius: "50%",
											background: "#C4C4C4",
										}}
									></div>
									<div
										className="font-18 bold-600 mb-2"
										style={{ marginTop: "10px" }}
									>
										Manual mapping
									</div>
									<div
										className="font-14 grey"
										style={{ padding: "0px 10px" }}
									>
										Map users to licenses manually.
									</div>
									<Button
										style={{ height: "38px" }}
										type="link"
										className="map_licenses_link_button"
										onClick={() => {
											setFirstStep(false);
										}}
										disabled={
											loadingLicenses ||
											!contractInfo?.name
										}
									>
										Map Manually
									</Button>
									<div className="font-10 grey-1 mt-2">
										Takes as low as 5-10 mins
									</div>
								</div>
							</div>
						) : (
							<Loader height={100} width={100}></Loader>
						)
					) : (
						<>
							<div
								style={{
									paddingTop: "20px",
									width: "calc(100% - 293px)",
								}}
							>
								<LicenseMapperTable
									appId={contractInfo?.app_id}
									contractId={location?.state?.id || id}
									licenses={licenses}
								/>
							</div>
						</>
					)}

					<div className="map_licenses_unmapped_licenses_box">
						{loadingLicenses ? (
							<>
								{[0, 1].map(() => (
									<div
										className="license_mapper_single_license_box mb-2 d-flex flex-column"
										style={{
											marginLeft: "14px",
											marginTop: "8px",
										}}
									>
										<div>
											<ContentLoader
												width={140}
												height={40}
											>
												<rect
													width="140"
													height="15"
													rx="2"
													fill="#EBEBEB"
												/>
												<rect
													width="140"
													height="10"
													rx="2"
													fill="#EBEBEB"
													y="21"
												/>
											</ContentLoader>
										</div>
									</div>
								))}
							</>
						) : (
							<LicenseMapperTableHelper
								licenses={licenses}
								firstStep={firstStep}
								appId={contractInfo?.app_id}
								contractId={location?.state?.id || id}
							/>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
