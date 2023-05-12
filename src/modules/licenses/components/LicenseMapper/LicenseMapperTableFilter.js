import React, { useState } from "react";
import search from "assets/search.svg";
import refresh_icon from "assets/icons/refresh.svg";
import arrowdropdown from "assets/arrowdropdown.svg";
import rightarrow from "components/Transactions/Recognised/rightarrow.svg";
import leftarrow from "components/Transactions/Recognised/leftarrow.svg";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import { DropdownLicenseCard } from "./UserLicensesCell";
import { useDispatch, useSelector } from "react-redux";
import { updateFewLicenseMapperUsers } from "./LicenseMapper-action";
import AddAppUsersViaCSV from "./AddAppUsersViaCSV/AddAppUsersViaCSV";

export default function LicenseMapperTableFilter({
	setSearchQuery,
	page,
	setPage,
	totalPages,
	handleRefresh,
	licenseList = [],
	checked = [],
	setChecked,
	appId,
}) {
	const dispatch = useDispatch();
	const { data } = useSelector((state) => state.licenseMapper);

	const [searchTerm, setSearchTerm] = useState("");
	const handleLeftClick = () => {
		setChecked([]);
		setPage(page - 1);
	};
	const handleRightClick = () => {
		setChecked([]);
		setPage(page + 1);
	};
	const handleSearchQuery = (event) => {
		setPage(0);
		setSearchTerm(event.target.value?.trimStart());
		setSearchQuery && setSearchQuery(event.target.value?.trimStart());
	};

	const assignUserLicense = (license) => {
		let users = data.filter((user) => checked.includes(user._id));
		for (let user of users) {
			let index = Array.isArray(user.contracts)
				? user.contracts.findIndex(
						(contract) => contract.license_id === license.license_id
				  )
				: -1;
			if (index === -1) {
				let tempUserLicenses = [
					...user.contracts,
					{
						license_id: license.license_id,
						license_name: license.license_name,
						license_assigned_on: `${
							new Date().toISOString().split("T")[0]
						}T00:00:00.000Z`,
						license_auto_increment: license.auto_increment,
						integration_id: license.integration_id,
						integration_name: license.integration_name,
						integration_logo: license.integration_logo,
						org_integration_id: license.org_integration_id,
						org_integration_name: license.org_integration_name,
						cost_per_item: license.cost_per_item,
						role: null,
					},
				];
				user.contracts = tempUserLicenses;
			}
			let tempUserRemovedLicenses = Array.isArray(user.removed_contracts)
				? [...user.removed_contracts].filter(
						(lic) => lic.license_id !== license.license_id
				  )
				: [];
			user.removed_contracts = tempUserRemovedLicenses;
		}
		dispatch(updateFewLicenseMapperUsers({ data: [...users] }));
	};

	const unassignUserLicense = (license) => {
		let users = data.filter((user) => checked.includes(user._id));
		for (let user of users) {
			let index = Array.isArray(user.removed_contracts)
				? user.removed_contracts.findIndex(
						(contract) => contract.license_id === license.license_id
				  )
				: -1;
			if (index === -1) {
				let tempUserRemovedLicenses = [
					...user.contracts,
					{
						license_id: license.license_id,
						license_name: license.license_name,
						license_unassigned_on: `${
							new Date().toISOString().split("T")[0]
						}T00:00:00.000Z`,
						license_auto_increment: license.auto_increment,
						integration_id: license.integration_id,
						integration_name: license.integration_name,
						integration_logo: license.integration_logo,
						org_integration_id: license.org_integration_id,
						org_integration_name: license.org_integration_name,
						cost_per_item: license.cost_per_item,
						role: null,
					},
				];
				user.removed_contracts = tempUserRemovedLicenses;
			}
			let tempUserLicenses = Array.isArray(user.contracts)
				? [...user.contracts].filter(
						(lic) => lic.license_id !== license.license_id
				  )
				: [];
			user.contracts = tempUserLicenses;
		}
		dispatch(updateFewLicenseMapperUsers({ data: [...users] }));
	};

	return (
		<>
			<div className="top__Uploads">
				<div className="Uploads__left" style={{ paddingLeft: "20px" }}>
					{checked.length > 0 && (
						<Dropdown
							toggler={
								<div
									className="d-flex align-items-center border-1 border-radius-4 bg-white"
									style={{
										height: "34px",
										padding: "0 8px",
										borderColor: "#dddddd !important",
									}}
								>
									<div className="font-13 ml-1">
										Assign License
									</div>
									<img
										src={arrowdropdown}
										style={{ marginLeft: "8px" }}
									/>
								</div>
							}
							options={licenseList}
							optionFormatter={(license) => (
								<DropdownLicenseCard license={license} />
							)}
							onOptionSelect={(license) =>
								assignUserLicense(license)
							}
							menuStyle={{ padding: "0px", zIndex: "500" }}
							optionStyle={{ padding: "0px" }}
						/>
					)}
					{checked.length > 0 && (
						<Dropdown
							toggler={
								<div
									className="d-flex align-items-center border-1 border-radius-4 bg-white ml-3"
									style={{
										height: "34px",
										padding: "0 8px",
										borderColor: "#dddddd !important",
									}}
								>
									<div className="font-13 ml-1">
										Unassign License
									</div>
									<img
										src={arrowdropdown}
										style={{ marginLeft: "8px" }}
									/>
								</div>
							}
							options={licenseList}
							optionFormatter={(license) => (
								<DropdownLicenseCard license={license} />
							)}
							onOptionSelect={(license) =>
								unassignUserLicense(license)
							}
							menuStyle={{
								padding: "0px",
								zIndex: "500",
								marginLeft: "1rem",
							}}
							optionStyle={{ padding: "0px" }}
						/>
					)}
				</div>
				<div
					className="Uploads__right"
					style={{ paddingRight: "20px" }}
				>
					<AddAppUsersViaCSV
						appId={appId}
						onSuccess={handleRefresh}
					/>
					<div className="inputWithIconApps">
						<input
							type="text"
							placeholder="Search"
							value={searchTerm}
							onChange={handleSearchQuery}
						/>
						<img src={search} aria-hidden="true" />
					</div>
					<button
						className="appsad"
						onClick={handleRefresh}
						style={{ width: "50px" }}
					>
						<img
							className="w-100 h-100 m-auto"
							src={refresh_icon}
						/>
					</button>
				</div>
			</div>
			<div className="d-flex align-items-center">
				<div
					className="transaction__table__selectors ml-auto"
					style={{ marginRight: "20px" }}
				>
					<div className="transaction__table__page__selector">
						<div
							hidden={page === 0}
							onClick={handleLeftClick}
							className="table__info__text__right2 cursor-pointer"
						>
							<img src={leftarrow} />
						</div>
						<div className="table__info__text__right2">
							Page {page + 1 || 0} of{" "}
							{totalPages > 0 ? totalPages : 1}
						</div>
						<div
							hidden={page === totalPages - 1}
							onClick={handleRightClick}
							className="table__info__text__right2 cursor-pointer"
						>
							<img src={rightarrow} />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
