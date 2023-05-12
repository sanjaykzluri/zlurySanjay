import { userRoles } from "constants/userRole";
import ContractDetails from "modules/licenses/components/SingleContract/ContractDetails";
import { ContractNotes } from "modules/licenses/components/SingleContract/ContractNotes";
import React, { Component, useState, useEffect, useContext } from "react";
import { useSelector } from "react-redux";
import { ContractDescription } from "../../../modules/licenses/components/SingleContract/ContractDescription";
import ContractLicensesList from "../../../modules/licenses/components/SingleContract/ContractLicensesList";
import ContractTimeline from "../../../modules/licenses/components/SingleContract/ContractTimeline";
import MapLicensesDialogDiv from "../../../modules/licenses/components/SingleContract/MapLicensesDialogDiv";
import { screenEntity } from "../../../modules/licenses/constants/LicenseConstants";
import { Header } from "../SecurityCompliance/Header";

export function ContractsINS(props) {
	const { loading, data, entity, unmappedLicenseData, requestData } = props;
	const contractId = window.location.pathname.split("/")[3];
	const { userInfo } = useSelector((state) => state);

	const showMapLicenseDialog = () => {
		let flag = false;
		if (Array.isArray(unmappedLicenseData)) {
			if (
				unmappedLicenseData.some(
					(license) =>
						!isNaN(license.unmapped_license_count) &&
						license.unmapped_license_count > 0
				)
			) {
				flag = true;
			}
		}
		if (data?.status !== "active") {
			flag = false;
		}
		if (data?.end_date && new Date(data?.end_date) < new Date()) {
			flag = false;
		}
		return flag;
	};

	return (
		<>
			<div className="securityoverview__wrapper">
				<div className="securityoverview__left">
					<ContractDescription
						loading={loading}
						data={data}
						entity={entity}
						requestData={requestData}
					/>
				</div>
				<div
					className="securityoverview__right"
					style={{ height: "auto" }}
				>
					<ContractDetails
						loading={loading}
						data={data}
						entity={entity}
						requestData={requestData}
					/>
					{!(
						userInfo?.user_role === userRoles.VIEWER ||
						userInfo?.user_role === userRoles.EMPLOYEE
					) &&
						!loading &&
						data?.app_id &&
						showMapLicenseDialog() && (
							<MapLicensesDialogDiv
								loading={loading}
								data={data}
								contractId={contractId}
								unmappedLicenseData={unmappedLicenseData}
							/>
						)}
					{!loading && entity === screenEntity.CONTRACT && (
						<ContractTimeline
							loading={loading}
							data={data}
							entity={entity}
						/>
					)}
					<ContractLicensesList
						loading={loading}
						data={data}
						entity={entity}
					/>
					<ContractNotes
						loading={loading}
						data={data}
						contractId={contractId}
					/>
				</div>
			</div>
		</>
	);
}
