import React, {
	Component,
	useState,
	useEffect,
	useContext,
	useRef,
} from "react";
import { useLocation, useHistory } from "react-router-dom";
import search from "../../../../../assets/search.svg";
import Add from "../../../../../assets/add.svg";
import { allowScroll, preventScroll } from "../../../../../actions/ui-action";
import refresh_icon from "../../../../../assets/icons/refresh.svg";
import { useDispatch, useSelector } from "react-redux";
import RoleContext from "../../../../../services/roleContext/roleContext";
import CSV from "../../../../../components/Uploads/CSV.svg";
import {
	addLicenseContract,
	getVendorContractsPropertiesList,
} from "../../../../../services/api/applications";
import { applicationConstants } from "../../../../../constants";
import { fetchSingleVendorContractInfo } from "../../../../../actions/applications-action";
import { client } from "../../../../../utils/client";
import FilterIcons from "../../../../../common/filterIcons";
import { FilterRenderingModal } from "../../../../Users/Applications/Modals/FiltersRenderer/FilterRenderingModal";
import { ColumnRenderingModal } from "../../../../Users/Applications/Modals/ColumnRenderingModal";
import { TriggerIssue } from "../../../../../utils/sentry";
import Chips from "../../../../Users/Applications/Modals/FiltersRenderer/Chip";
import { SearchInputArea } from "../../../../searchInputArea";
import BulkChangePaymentMethod from "../../../../../modules/licenses/components/BulkChangePaymentMethod/BulkChangePaymentMethod";
import { bulkUpdatePaymentMethods } from "../../../../../services/api/licenses";
import ContractBulkEdit from "../../../../../modules/licenses/components/ContractBulkEdit/ContractBulkEdit";
import { screenEntity } from "../../../../../modules/licenses/constants/LicenseConstants";
import { getValueFromLocalStorage } from "utils/localStorage";

export function ContractsFilter(props) {
	const {
		checked,
		metaData,
		setChecked,
		searchQuery,
		columnsMapper,
		usedColumns,
		handleRefresh,
		setSearchQuery,
		isLoadingData,
		showAddContract,
		setShowAddContract,
	} = props;

	const dispatch = useDispatch();
	const [showHide, setshowHide] = useState(false);
	const [submitInProgress, setSubmitInProgress] = useState(false);
	const [showColumnsModal, setShowColumnsModal] = useState(false);
	const [showFilterModal, setShowFilterModal] = useState(false);
	const [propertyList, setPropertyList] = useState([]);
	const [listOfColumns, setListOfColumns] = useState([]);
	const [loading, setLoading] = useState(true);
	const [contractSubmitting, setContractSubmitting] = useState(false);
	const [contractFormErrors, setContractFormErrors] = useState([]);
	const { isViewer } = useContext(RoleContext);
	const history = useHistory();
	let addHideAppClose = () => {
		setShowColumnsModal(false);
		setShowFilterModal(false);
		setshowHide(false);
	};

	function handleSubmit(reqObj, isColumnSorting) {
		addHideAppClose();
	}

	const refreshReduxState = () => {
		!isLoadingData && handleRefresh();
	};

	useEffect(() => {
		if (loading) {
			getVendorContractsPropertiesList().then((res) => {
				if (res != null) {
					if (
						res.data != null &&
						res.data.properties != null &&
						Array.isArray(res.data.columns) &&
						Array.isArray(res.data.properties)
					) {
						setPropertyList(res.data.properties);
						setListOfColumns(res.data.columns);
					} else {
						setPropertyList([]);
						setListOfColumns([]);
					}
				} else {
					setPropertyList([]);
					setListOfColumns([]);
				}
				setLoading(false);
			});
		}
	}, []);

	const closeAddContractMenu = () => {
		setShowAddContract(false);
		setContractFormErrors([]);
	};

	const handleContractSave = (contract) => {
		setContractSubmitting(true);
		addLicenseContract(contract)
			.then((res) => {
				if (!res.error) {
					setShowAddContract(false);
					setContractSubmitting(false);
					refreshReduxState();

					//Segment Implementation
					window.analytics.track("Added a new Contract", {
						newContractName: contract.contract_name,
						newContractAppId: contract.contract_app_id,
						newContractAutoRenewal: contract.contract_auto_renewal,
						newContractOwnerId: contract.contract_owner_id,
						newContractValue: contract.contract_value,
						newContractVendor: contract.contract_vendor,
						newContractPaymentInterval:
							contract.payment_repeat_interval,
						currentCategory: "Applications",
						currentPageName: "All-Apps",
						orgId:
							getValueFromLocalStorage("userInfo")?.org_id || "",
						orgName:
							getValueFromLocalStorage("userInfo")?.org_name ||
							"",
					});
				}
			})
			.catch((err) => {
				TriggerIssue("Error creating Contract:", err);
				if (err.response && err.response.data) {
					setContractFormErrors(err.response.data.errors);
				}
				setContractSubmitting(false);
			});
	};

	return (
		<>
			<div className="top__Uploads">
				<div className="Uploads__left">
					<FilterIcons
						preventScroll={preventScroll}
						isLoadingData={isLoadingData}
						setShowFilterModal={setShowFilterModal}
						setShowColumnsModal={setShowColumnsModal}
						metaData={metaData}
					/>
				</div>
				<div className="Uploads__right">
					{checked && checked.length > 0 && (
						<>
							<ContractBulkEdit
								checked={checked}
								handleRefresh={() => {
									handleRefresh();
									setChecked([]);
								}}
								setChecked={setChecked}
								entity={screenEntity.CONTRACT}
							/>
						</>
					)}
					<div className="inputWithIconApps">
						<SearchInputArea
							placeholder="Search Contracts"
							setSearchQuery={props.setSearchQuery}
						/>
						<img src={search} aria-hidden="true" />
					</div>
					<div className="d-flex flex-row">
						{!isViewer && (
							<button
								className="appsad mr-3"
								onClick={() => history.push("/contract/new")}
							>
								<img src={Add} />
								<span id="te">Add</span>
							</button>
						)}
						<button
							className="appsad"
							onClick={() => refreshReduxState()}
							style={{ width: "50px" }}
						>
							<img
								className="w-100 h-100 m-auto"
								src={refresh_icon}
							/>
						</button>
					</div>
				</div>
				{showColumnsModal && (
					<>
						<div className="modal-backdrop show"></div>
						<div className="modal d-block">
							<ColumnRenderingModal
								handleSubmit={handleSubmit}
								show={showHide}
								onHide={addHideAppClose}
								submitting={submitInProgress}
								listOfColumns={listOfColumns}
								setListOfColumns={setListOfColumns}
								columnsMapper={columnsMapper}
								style={{ zIndex: "1" }}
								usedColumns={usedColumns}
								metaData={metaData}
								v2Entity="contracts"
								keyField={"_id"}
							/>
						</div>
					</>
				)}
				{showFilterModal && (
					<>
						<div className="modal-backdrop show"></div>
						<div className="modal d-block">
							<FilterRenderingModal
								handleSubmit={handleSubmit}
								show={showHide}
								onHide={addHideAppClose}
								filterPropertyList={propertyList}
								appliedFilters={metaData?.filter_by}
								metaData={metaData}
								submitting={submitInProgress}
								style={{ zIndex: "1" }}
							/>
						</div>
					</>
				)}
			</div>
			<Chips
				searchQuery={searchQuery}
				text={"Contracts"}
				metaData={metaData}
				isInfiniteTable={true}
			/>
		</>
	);
}
