import React, {
	useCallback,
	useEffect,
	useRef,
	useState,
	Fragment,
	useContext,
} from "react";
import add from "../../assets/add.svg";
import search from "../../assets/search.svg";
import arrowdropdown from "../../assets/arrowdropdown.svg";
import { Popover } from "../../UIComponents/Popover/Popover";
import { client } from "../../utils/client";
import { debounce } from "../../utils/common";
import { Loader } from "../../common/Loader/Loader";
import {
	currencyPeriod,
	currencySymbols,
	kFormatter,
} from "../../constants/currency";
import _ from "underscore";
import "./InlineLicenceAssg.css";
import { useOutsideClickListener } from "../../utils/clickListenerHook";
import { useSelector } from "react-redux";
import RoleContext from "../../services/roleContext/roleContext";
import { Button } from "../../UIComponents/Button/Button";
import blueTick from "../../assets/blueTick.svg";
import LicenseCard from "../../modules/licenses/components/NewLicenseCard";
import blueaddbutton from "../../assets/licenses/blueaddbutton.svg";
import {
	fetchInitialLicences,
	mapLicensesRequest,
} from "../../services/api/licenses";
import { TriggerIssue } from "../../utils/sentry";
import licenseFromIntegration from "../../assets/licenses/licenseFromIntegration.svg";
import { getLicenseTermText } from "modules/licenses/utils/LicensesUtils";

export function LicenceCard(props) {
	const userInfo = useSelector((state) => state.userInfo);
	const defaultMetricCurrency = userInfo?.org_currency;
	return (
		<div
			className={`d-flex flex-column p-2 licenceCardDropdownItem mt-1 rounded bold-normal cursor-pointer`}
			onClick={props.handleCardClick}
			style={
				props.isAlreadyAssigned
					? {
							background: "rgba(90, 186, 255, 0.1)",
					  }
					: {}
			}
		>
			<div className="d-flex flex-row justify-content-between">
				<div
					className={`d-flex font-14 ${
						props.isBulkAssign &&
						!props.isUsageOverview &&
						"justify-content-between w-100"
					} `}
				>
					<div className="d-flex align-items-center mr-2">
						<div>
							{props.licence.name || props.licence.license_name}
						</div>
						{props.licence.integration_id && (
							<img
								src={licenseFromIntegration}
								width={12}
								height={12}
								className="ml-1"
							/>
						)}
					</div>
					<div className="d-flex">
						<div className="bold-600">
							{kFormatter(
								props.licence.cost_per_item
									?.amount_org_currency ||
									props.licence.cost_per_license
										?.amount_org_currency ||
									0
							)}{" "}
							{`${getLicenseTermText(
								props.licence,
								props.licence.cost_per_license ||
									props.licence.cost_per_item,
								false,
								true,
								true
							)}`}
						</div>
					</div>
				</div>
				{props.isAlreadyAssigned && <img src={blueTick} />}
			</div>
			<div className="d-flex flex-row mt-1 w-100 justify-content-between">
				<div className="font-10 d-flex">
					<div className="grey-1">Licenses Used</div>
					<div className="licenceItemValue d-flex ml-1">
						<div className="bold-600">
							{props.licence?.license_used ||
								props.licence?.assigned_count ||
								props.licence?.assigned_licenses ||
								0}
						</div>
						/{props.licence?.quantity}
					</div>
				</div>
				<div className="dot mt-auto mb-auto ml-2 mr-2"></div>
				<div className="font-10 d-flex">
					<div className="grey-1">Auto Increment</div>
					<div className="licenceItemValue d-flex ml-1">
						{props.licence.auto_increment ? (
							<div className="autoIncrementStatus">ON</div>
						) : (
							<div className="red">OFF</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function InlineLicenceAssg({ addLicenses = true, ...props }) {
	const [isEditing, setIsEditing] = useState(false);
	const [licenceDetails, setLicenceDetails] = useState([]);
	const [licenseIdArray, setLicenseIdArray] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const showAddButtonRef = useRef();
	const cancelToken = useRef();
	const [searchLicences, setSearchLicences] = useState([]);
	const [initialLicences, setInitialLicences] = useState([]);
	const [loading, setLoading] = useState(true);
	const { isViewer } = useContext(RoleContext);

	useOutsideClickListener(showAddButtonRef, () => {
		setIsEditing(false);
		setSearchTerm("");
	});

	useEffect(() => {
		if (props.licences && Array.isArray(props.licences)) {
			var firstThreeLicenseDetails = _.first(
				props.licences,
				props.licences.length > 2 ? 2 : props.licences.length
			);
			var tempLicenseDetails = firstThreeLicenseDetails.map(
				(license) => ({
					licenceName: license.license_name || license.name,
					licenceId: license.license_id || license._id,
				})
			);
			var tempLicenseIdArray = props.licences.map(
				(license) => license.license_id || license._id
			);
			setLicenseIdArray(tempLicenseIdArray);
			setLicenceDetails(tempLicenseDetails);
		}
	}, [props.licences]);

	const stopBubblingEvent = (e) => {
		e.stopPropagation();
		e.preventDefault();
	};

	const handleAddEditLicence = (e) => {
		stopBubblingEvent(e);
		if (!isViewer) {
			setIsEditing(!isEditing);
		}
	};

	const handleSearchQuery = (event) => {
		setSearchTerm(event.target.value || "");
		setLoading(true);
		handleSearchRequests(event.target.value.trim());
	};

	function handleFetchInitialLicences() {
		try {
			setLoading(true);
			fetchInitialLicences(props.appId).then((res) => {
				setInitialLicences(res.results || []);
				setLoading(false);
			});
		} catch (error) {
			setLoading(false);
		}
	}

	useEffect(() => {
		if (isEditing) {
			handleFetchInitialLicences();
		} else {
			setSearchLicences([]);
			setInitialLicences([]);
			setLoading(true);
		}
	}, [isEditing]);

	const handleSearchRequests = useCallback(
		debounce((searchQuery) => {
			if (cancelToken.current) {
				cancelToken.current.cancel(
					"Operation cancelled in favor of a new request"
				);
			}
			cancelToken.current = client.CancelToken.source();
			if (searchQuery.length > 0) {
				try {
					fetchInitialLicences(
						props.appId,
						searchQuery,
						cancelToken.current
					).then((res) => {
						setSearchLicences(res.results || []);
						setLoading(false);
					});
				} catch (error) {
					setSearchLicences([]);
					setLoading(false);
				}
			} else {
				handleFetchInitialLicences();
			}
		}, 300),
		[]
	);

	const getUpdatedLicensesForAUser = (existingLicenses, license) => {
		let tempLicenseArray = [...existingLicenses];
		let indexOfLicense = tempLicenseArray.findIndex(
			(el) => el.license_id === license._id
		);
		if (props.isBulkAssign && !props.isUsageOverview) {
			if (indexOfLicense > -1) {
				tempLicenseArray.splice([indexOfLicense], 1);
			}
			tempLicenseArray.push(license);
		} else if (indexOfLicense > -1) {
			tempLicenseArray.splice([indexOfLicense], 1);
		} else {
			tempLicenseArray.push(license);
		}
		let finalLicenseArray = tempLicenseArray.map((row, index) => {
			return {
				role: row.role || null,
				license_id: row.license_id,
				start_date: row.license_assigned_on || new Date(),
			};
		});

		return finalLicenseArray;
	};

	const handleLicenceCardClick = (e, license) => {
		stopBubblingEvent(e);
		setLoading(true);
		let reqBody = {};

		reqBody = {
			contract_id: license.contract_id,
			user_mapping_array: props.users.map((user) => ({
				role: null,
				license_ids: getUpdatedLicensesForAUser(
					user.user_licenses,
					license
				),
				user_id: user.user_id,
				start_date: new Date(),
			})),
			type: "manual",
		};
		try {
			mapLicensesRequest(props.appId, reqBody).then((res) => {
				if (res.status === "success") {
					props.refresh();
					setLoading(false);
				}
			});
		} catch (errors) {
			setLoading(false);
			TriggerIssue("Error in mapping licenses", errors);
		}
	};

	const defaultPopoverPosition = {
		width: "270px",
		left: "134px",
		top: "25px",
		padding: "8px",
		maxHeight: "315px",
	};

	return (
		<div
			onClick={(e) => stopBubblingEvent(e)}
			ref={showAddButtonRef}
			className={`position-relative`}
			style={
				props.isTableCell
					? {
							height: "100%",
							minWidth: "180px",
							maxWidth: "380px",
							width: "fit-content",
					  }
					: {}
			}
		>
			{props.isBulkAssign ? (
				<>
					{props.isUsageOverview ? (
						<Button
							type="link"
							onClick={(e) => handleAddEditLicence(e)}
						>
							+ Assign License
						</Button>
					) : (
						<div onClick={(e) => handleAddEditLicence(e)}>
							Assign License
							<img src={arrowdropdown} className="ml-2" />
						</div>
					)}
				</>
			) : Array.isArray(props.licences) && props.licences.length > 0 ? (
				<div className="license__assignment__all__licenses__cont">
					{props.licences.map((licenceDetails) => (
						<LicenseCard
							license={licenceDetails}
							refresh={props.refresh}
							appId={props.appId}
							userId={props.userId || props.users?.[0].user_id}
							setIsEditing={setIsEditing}
							showDateInfo={props.showDateInfo}
						/>
					))}
					{addLicenses && (
						<img
							className="cursor-pointer"
							src={blueaddbutton}
							onClick={(e) => {
								stopBubblingEvent(e);
								setIsEditing((val) => !val);
							}}
						></img>
					)}
				</div>
			) : props.showSwitchButtonToEdit ? (
				<div
					className="addLicenceForSidePanel rounded cursor-pointer"
					onClick={(e) => {
						stopBubblingEvent(e);
						handleAddEditLicence(e);
					}}
				>
					<div
						className={`ml-1 font-12 bold-normal ${
							isViewer ? "grey-1 text-capitalize" : ""
						}`}
					>
						{isViewer ? "No data available" : "+ Add license"}
					</div>
				</div>
			) : addLicenses ? (
				<div
					className={`d-flex flex-row ${
						props.isNotActive ? "o-6" : ""
					}`}
					onClick={(e) => handleAddEditLicence(e)}
				>
					{!isViewer && (
						<div
							className="rounded-circle d-flex mr-1 p-1"
							style={{
								border: "0.7px dashed #717171",
								height: "21px",
								width: "21px",
							}}
						>
							<img src={add} width={11} className="m-auto" />
						</div>
					)}
					<div
						className={` ${
							isViewer
								? "grey-1 font-10 text-capitalize"
								: "font-13 cursor-pointer text-nowrap"
						}`}
					>
						{isViewer ? "No data available" : "Add License"}
					</div>
				</div>
			) : (
				""
			)}
			<Popover
				align="center"
				show={isEditing}
				refs={[showAddButtonRef]}
				style={props.popoverPositionStyle || defaultPopoverPosition}
			>
				<div className="d-flex flex-column">
					<div className="border rounded d-flex">
						<img src={search} aria-hidden="true" className="m-2" />
						<input
							type="text"
							value={searchTerm}
							className="w-100 border-0"
							placeholder="Search Licenses"
							onChange={handleSearchQuery}
						/>
					</div>
				</div>
				{!loading ? (
					<div
						className="d-flex flex-column"
						style={{ maxHeight: "250px", overflowY: "scroll" }}
						key={searchTerm}
					>
						{Array.isArray(
							searchTerm.length > 0
								? searchLicences
								: initialLicences
						) &&
						(searchTerm.length > 0
							? searchLicences
							: initialLicences
						).length > 0 ? (
							(searchTerm.length > 0
								? searchLicences
								: initialLicences
							)?.map((licence, index) => (
								<LicenceCard
									key={index}
									licence={licence}
									application={{
										applicationName: props.appName,
										applicationLogo: props.appLogo,
										applicationId: props.appId,
									}}
									handleCardClick={(e) =>
										handleLicenceCardClick(e, licence)
									}
									isAlreadyAssigned={
										(!props.isBulkAssign ||
											props.isUsageOverview) &&
										licenseIdArray.includes(licence._id)
									}
									isBulkAssign={props.isBulkAssign}
									isUsageOverview={props.isUsageOverview}
								/>
							))
						) : (
							<div className="p-2 mr-auto grey-1 o-6 mt-2 text-left bold-normal">
								0 licenses available
							</div>
						)}
					</div>
				) : (
					<Loader height={50} width={50} />
				)}
			</Popover>
		</div>
	);
}

export default InlineLicenceAssg;
