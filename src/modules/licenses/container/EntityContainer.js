import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router";
import UnauthorizedToView from "../../../common/restrictions/UnauthorizedToView";
import { userRoles } from "../../../constants/userRole";
import { Breadcrumb } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import RoleContext from "../../../services/roleContext/roleContext";
import {
	getContractOverviewDetails,
	getUnmappedLicenseData,
} from "../../../services/api/licenses";
import { TriggerIssue } from "../../../utils/sentry";
import { ContractTabs } from "../components/ContractTabs";
import { ContractsINS } from "../../../components/Applications/Contracts/ContractsINS";
import { CommonUsersTable } from "../components/CommonUserTable/CommonUsersTable";
import ContractDocumentPage from "../components/SingleContract/ContractDocumentPage";
import {
	booleanFieldArray,
	returnURLsFromBC,
	screenEntity,
} from "../constants/LicenseConstants";
import { capitalizeFirstLetter, sumOfArray } from "../../../utils/common";
import ContentLoader from "react-content-loader";
import HeaderTitleBC from "../../../components/HeaderTitleAndGlobalSearch/HeaderTitleBC";
import { useDispatch, useSelector } from "react-redux";
import { deleteReqData, setReqData } from "common/Stepper/redux";
import OptimizationContainer from "modules/Optimization/OptimizationContainer";
import { generateContractOptimization } from "services/api/optimization";
import { optimizationEntityType } from "modules/Optimization/constants/OptimizationConstants";
import { showContractOptimizationGetStarted } from "modules/Optimization/utils/OptimizationUtils";
import { getTotalLicenseRowData } from "../utils/LicensesUtils";

export default function EntityContainer({ entity }) {
	const location = useLocation();
	const history = useHistory();
	const dispatch = useDispatch();
	const { userRole } = useContext(RoleContext);
	const id = location.pathname.split("/")[3];
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState();
	const [error, setError] = useState();
	const [unmappedLicenseData, setUnmappedLicenseData] = useState([]);
	const [loadingUnmappedLicenseData, setLoadingUnmappedLicenseData] =
		useState(true);
	const { org_beta_features } = useSelector((state) => state.userInfo);

	useEffect(() => {
		requestData(id);
		requestUnmappedLicenseData(id);
		return () => {
			dispatch(deleteReqData());
		};
	}, []);

	useEffect(() => {
		const hash = location.hash.slice(1);
		if (!hash) history.push("#overview");
	}, [location]);

	const requestData = (_id) => {
		setLoading(true);
		try {
			getContractOverviewDetails(_id).then((res) => {
				if (res?.error) {
					setError(res);
					setLoading(false);
				} else {
					if (
						!res.results.checklist ||
						!Array.isArray(res.results.checklist) ||
						res.results.checklist.length === 0
					) {
						res.results.checklist = [...booleanFieldArray];
					}
					dispatch(setReqData(res.results));
					setData(res.results);
					setLoading(false);
				}
			});
		} catch (error) {
			setError(error);
			setLoading(false);
			TriggerIssue(
				"Error when fetching contract overview details",
				error
			);
		}
	};

	const requestUnmappedLicenseData = (contract_id) => {
		setLoadingUnmappedLicenseData(true);
		try {
			getUnmappedLicenseData(contract_id).then((res) => {
				if (res?.error) {
					setError(res);
					setLoadingUnmappedLicenseData(false);
				} else {
					setUnmappedLicenseData(res);
					setLoadingUnmappedLicenseData(false);
				}
			});
		} catch (error) {
			setError(error);
			setLoadingUnmappedLicenseData(false);
			TriggerIssue(
				"Error when fetching Unmapped Licenses of a Contract",
				error
			);
		}
	};

	return (
		<>
			{userRole === userRoles.FINANCE_ADMIN ||
			userRole === userRoles.INTEGRATION_ADMIN ||
			userRole === userRoles.SECURITY_ADMIN ? (
				<UnauthorizedToView />
			) : (
				<>
					<HeaderTitleBC
						title={`${capitalizeFirstLetter(entity)}s`}
						inner_screen={true}
						go_back_url={returnURLsFromBC[entity]}
						entity_name={data?.name}
						entity_logo={data?.app_logo}
					/>
					<div
						style={{
							padding: "0px 40px",
							backgroundColor: "white",
						}}
					>
						<ContractTabs
							entity={entity}
							contract_id={id}
							contract_data={data}
							app_id={data?.app_id}
							org_beta_features={org_beta_features}
						/>
					</div>
					{location.hash === "#overview" ? (
						<ContractsINS
							data={data}
							loading={loading || loadingUnmappedLicenseData}
							entity={entity}
							unmappedLicenseData={unmappedLicenseData}
							requestData={requestData}
						/>
					) : null}
					{location.hash === "#users" && data?.app_id ? (
						<CommonUsersTable
							app_id={data.app_id}
							contract_id={id}
							contract_data={data}
							integration_id={data?.integration_id}
							unmappedLicenseData={unmappedLicenseData}
							loadingUnmappedLicenseData={
								loadingUnmappedLicenseData
							}
							requestUnmappedLicenseData={
								requestUnmappedLicenseData
							}
						/>
					) : null}
					{org_beta_features?.includes("optimization") &&
					location.hash === "#optimization" ? (
						<OptimizationContainer
							app={
								data
									? {
											app_id: data?.app_id,
											app_name: data?.app_name,
											app_logo: data?.app_logo,
									  }
									: null
							}
							entityId={id}
							api={generateContractOptimization}
							entityType={optimizationEntityType.contract}
							showGetStarted={showContractOptimizationGetStarted(
								data
							)}
							contractCount={1}
							licenseCount={
								Array.isArray(unmappedLicenseData)
									? sumOfArray(
											unmappedLicenseData.map(
												(license) =>
													license.total_license_available
											)
									  )
									: 0
							}
							userAppLicenseCount={
								getTotalLicenseRowData(data).in_use
							}
						/>
					) : null}
					{location.hash === "#documents" ? (
						<ContractDocumentPage
							data={data}
							documents={data?.documents}
							loading={loading}
							entity={entity}
							requestData={requestData}
						/>
					) : null}
				</>
			)}
		</>
	);
}
