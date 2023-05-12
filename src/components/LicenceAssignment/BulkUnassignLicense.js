import React, { useEffect, useRef, useState } from "react";
import { Fragment } from "react";
import search from "../../assets/search.svg";
import arrowdropdown from "../../assets/arrowdropdown.svg";
import { Popover } from "../../UIComponents/Popover/Popover";
import { LicenceCard } from "./InlineLicenceAssg";

import { useOutsideClickListener } from "../../utils/clickListenerHook";

import {
	getAllLicensesV2,
	unmapLicensesRequest,
} from "../../services/api/licenses";
import { TriggerIssue } from "../../utils/sentry";

export default function BulkUnassignLicense(props) {
	const { licenses, users, appId, appName, appLogo, refresh } = props;
	const licenseListPopoverRef = useRef();
	const [showLicenseListPopover, setShowLicenseListPopover] = useState(false);
	const [showUnassignLicenseModal, setShowUnassignLicenseModal] =
		useState(false);
	const [licenseToBeUnassigned, setLicenseToBeUnassigned] = useState([]);
	const [
		showRemoveRoleAndRemovedLicenseDate,
		setShowRemoveRoleAndRemovedLicenseDate,
	] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [licenseIdArray, setLicenseIdArray] = useState([]);
	const [licenseDetailsArray, setLicenseDetailsArray] = useState([]);

	useEffect(() => {
		let tempArray = licenses.map((license) => license.license_id);
		tempArray.length &&
			getAllLicensesV2(
				{
					filter_by: [
						{
							field_id: "license_id",
							field_name: "License Id",
							field_values: [...tempArray],
							filter_type: "objectId",
							negative: false,
							is_custom: false,
						},
					],
					sort_by: [],
					columns: [],
				},
				0,
				tempArray.length
			).then((res) => setLicenseDetailsArray(res.data));
	}, [licenses]);

	const handleSearchQuery = (event) => {
		let value = event.target.value?.trimStart();
		setSearchQuery(value);
	};

	const stopBubblingEvent = (e) => {
		e.stopPropagation();
		e.preventDefault();
	};

	useOutsideClickListener(licenseListPopoverRef, () => {
		setShowLicenseListPopover(false);
	});

	const handleBulkUnassignLicense = (e, license) => {
		stopBubblingEvent(e);
		setLicenseToBeUnassigned([license]);
		let tempUserIds = users.map((el) => el.user_id);

		let tempReqBody = {
			userIds: tempUserIds,
			licenseIds: [
				{ license_id: license.license_id, end_date: new Date() },
			],
		};
		try {
			unmapLicensesRequest(appId, tempReqBody).then((res) => {
				if (res.status === "success") {
					refresh();
				}
			});
		} catch (errors) {
			TriggerIssue("Error in unmapping licenses", errors);
		}
	};

	const handleUnassignAllLicenses = (e) => {
		stopBubblingEvent(e);
		let tempUserIds = users.map((el) => el.user_id);
		let tempLicenseIds = licenses.map((el) => {
			return {
				license_id: el.license_id,
				end_date: new Date(),
			};
		});
		let tempReqBody = {
			userIds: tempUserIds,
			licenseIds: tempLicenseIds,
		};
		try {
			unmapLicensesRequest(appId, tempReqBody).then((res) => {
				if (res.status === "success") {
					refresh();
				}
			});
		} catch (errors) {
			TriggerIssue("Error in unmapping licenses", errors);
		}
	};

	const handleAfterLicenseRemoval = () => {
		setShowRemoveRoleAndRemovedLicenseDate(true);
	};

	let licenseList =
		licenseDetailsArray &&
		Array.isArray(licenseDetailsArray) &&
		licenseDetailsArray.map(
			(license, index) =>
				license.license_name.toLowerCase().includes(searchQuery) && (
					<LicenceCard
						key={index}
						licence={license}
						handleCardClick={(e) =>
							handleBulkUnassignLicense(e, license)
						}
						isBulkAssign={true}
					/>
				)
		);

	return (
		<Fragment>
			<div ref={licenseListPopoverRef} className="position-relative">
				<div
					onClick={() =>
						setShowLicenseListPopover(!showLicenseListPopover)
					}
					// className="appsad pt-1 pb-1 pl-2 pr-2 cursor-pointer"
					// style={{
					// 	border: "1px solid #ddddddcc",
					// 	width: "max-content",
					// }}
				>
					Unassign License
					<img src={arrowdropdown} className="ml-2" />
				</div>
				<Popover
					refs={[licenseListPopoverRef]}
					show={showLicenseListPopover}
					align="center"
					className="bulk-unassign-license-popover"
				>
					<div className="d-flex flex-column m-0">
						<div className="border rounded d-flex">
							<img
								src={search}
								aria-hidden="true"
								className="m-2"
							/>
							<input
								type="text"
								value={searchQuery}
								className="w-100 border-0"
								placeholder="Search Licenses"
								onChange={handleSearchQuery}
							/>
						</div>
					</div>
					<div
						className="d-flex flex-column"
						style={{ maxHeight: "250px", overflowY: "auto" }}
						key={searchQuery}
					>
						{licenses &&
						Array.isArray(licenses) &&
						licenses.length > 0 ? (
							new Set(licenseList).size === 1 &&
							!licenseList[0] ? (
								<div className="p-2 mr-auto grey-1 o-6 mt-2 text-left bold-normal">
									No Result
								</div>
							) : (
								licenseList
							)
						) : (
							<div className="p-2 mr-auto grey-1 o-6 mt-2 text-left bold-normal">
								No Assigned Licenses
							</div>
						)}
					</div>
					<div
						hidden={
							!(
								licenses &&
								Array.isArray(licenses) &&
								licenses.length > 0
							)
						}
					>
						<hr className="w-100 mt-0 mr-0 ml-0 mb-1" />
						<div
							className="cursor-pointer ml-2"
							onClick={handleUnassignAllLicenses}
						>
							<span className="font-14">
								Unassign all Licenses
							</span>
						</div>
					</div>
				</Popover>
			</div>
		</Fragment>
	);
}
