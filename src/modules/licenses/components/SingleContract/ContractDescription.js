import React, { useEffect } from "react";
import "./SingleContract.css";
import ContentLoader from "react-content-loader";
import OverviewField from "../../../../components/Applications/SecurityCompliance/OverviewField";
import AppTableComponent from "../../../../common/AppTableComponent";
import { NameBadge } from "../../../../common/NameBadge";
import { Link, useHistory } from "react-router-dom";
import UserInfoTableComponent from "../../../../common/UserInfoTableComponent";
import {
	contractAgreementTypes,
	screenEntity,
} from "../../constants/LicenseConstants";
import { setReqData } from "../../../../common/Stepper/redux";
import { useDispatch, useSelector } from "react-redux";
import { CUSTOM_FIELD_ENTITY } from "../../../custom-fields/constants/constant";
import { getAllCustomField } from "../../../custom-fields/redux/custom-field";
import {
	bulkUpdatePaymentMethods,
	patchSingleContract,
} from "../../../../services/api/licenses";
import GetImageOrNameBadge from "../../../../common/GetImageOrNameBadge";
import BulkChangePaymentMethod from "../BulkChangePaymentMethod/BulkChangePaymentMethod";
import { userRoles } from "constants/userRole";
import { getContractNextPaymentDate } from "modules/licenses/utils/LicensesUtils";
import StatusPillAndDropdown from "../StatusPillAndDropdown/StatusPillAndDropdown";
import { UTCDateFormatter } from "utils/DateUtility";
import ContractCustomReminders from "./ContractCustomReminders";
import { CustomFieldSectionInOverview } from "modules/shared/containers/CustomFieldSectionInOverview/CustomFieldSectionInOverview";

export const OverviewFieldLoaderCard = () => (
	<div className="eventCard mb-3 ml-3 mr-3">
		<ContentLoader height="105" width="100%">
			<rect width="160" height="10" rx="2" fill="#EBEBEB" y="15" x="20" />
			<rect
				width="50%"
				height="17"
				rx="2"
				x={100}
				fill="#EBEBEB"
				y="35"
			/>
			<rect
				width="80%"
				height="12"
				rx="2"
				x={100}
				fill="#EBEBEB"
				y="63"
			/>
			<rect
				width="40%"
				height="12"
				rx="2"
				x={100}
				fill="#EBEBEB"
				y="85"
			/>
		</ContentLoader>
	</div>
);

export function ContractDescription(props) {
	const history = useHistory();
	const dispatch = useDispatch();
	const contractId = window.location.pathname.split("/")[3];
	const { loading, data, entity, requestData } = props;
	const { customFields } = useSelector((state) => state);
	const entityCustomFields = customFields[CUSTOM_FIELD_ENTITY.CONTRACTS];
	const { userInfo } = useSelector((state) => state);

	useEffect(() => {
		if (!Object.keys(customFields).length) dispatch(getAllCustomField());
	}, [customFields]);

	const contractBooleanFieldsFormatter = (value) => {
		return (
			<>
				{value ? (
					<div className="glow_blue">YES</div>
				) : (
					<div className="grey-1">NO</div>
				)}
			</>
		);
	};

	return (
		<div className="d-flex flex-column">
			<div className="d-flex align-items-center justify-content-between">
				<div className="d-flex align-items-center">
					<GetImageOrNameBadge
						url={data?.app_logo}
						name={
							data?.contract_name ||
							data?.subscription_name ||
							data?.perpetual_name ||
							data?.name
						}
						height={40}
						width={40}
						borderRadius="50%"
					/>
					{loading ? (
						<ContentLoader width={150} height={15}>
							<rect width={150} height={15} fill="#EBEBEB" />
						</ContentLoader>
					) : (
						<div className="bold-600 font-18 ml-1">
							{data?.contract_name ||
								data?.subscription_name ||
								data?.perpetual_name ||
								data?.name}
						</div>
					)}
				</div>
				{!(
					userInfo?.user_role === userRoles.VIEWER ||
					userInfo?.user_role === userRoles.EMPLOYEE
				) &&
					!loading && (
						<div
							onClick={() => {
								dispatch(setReqData(data));
								history.push(`/${entity}/edit/${contractId}`);
							}}
							className="font-12 glow_blue cursor-pointer"
						>
							Edit
						</div>
					)}
			</div>
			{loading ? (
				<div className="mt-2">
					<ContentLoader width={150} height={10}>
						<rect width={150} height={15} fill="#EBEBEB" />
					</ContentLoader>
				</div>
			) : (
				<div className="font-12 o-8 mt-2">{data?.description}</div>
			)}
			<hr className="mx-0 my-3 w-100" />
			{loading ? (
				<OverviewFieldLoaderCard />
			) : (
				<div className="d-flex flex-column">
					<OverviewField
						label="STATUS"
						value={
							<StatusPillAndDropdown
								status={
									data?.type === "contract" &&
									new Date(data?.end_date) < new Date()
										? "expired"
										: data?.contract_status ||
										  data?.subscription_status ||
										  data?.perpetual_status ||
										  data?.status
								}
							/>
						}
						dataUnavailable={
							!(
								data?.contract_status ||
								data?.subscription_status ||
								data?.perpetual_status ||
								data?.status
							)
						}
						className="d-flex justify-content-between align-items-center mb-3"
					/>
					<OverviewField
						label="APP"
						value={
							<AppTableComponent
								app_id={data?.app_id}
								app_name={data?.app_name}
								app_logo={data?.app_logo}
								app_auth_status={data?.app_authorization_status}
							/>
						}
						dataUnavailable={!data?.app_id}
						className="d-flex justify-content-between align-items-center mb-3"
					/>
					<OverviewField
						label="AGREEMENT TYPE"
						value={
							contractAgreementTypes?.[data?.agreement_type]
								?.label
						}
						dataUnavailable={!data?.agreement_type}
						className="d-flex justify-content-between align-items-center mb-3"
						hidden={
							entity !== screenEntity.CONTRACT ||
							!data?.agreement_type
						}
					/>
					<OverviewField
						label="VENDOR"
						value={
							<div className="d-flex align-items-center">
								{data?.vendor_logo ? (
									<img
										src={data?.vendor_logo}
										height={28}
										width={28}
										className="mr-1"
									/>
								) : (
									<NameBadge
										height={28}
										width={28}
										name={data?.vendor_name}
										className="mr-1"
									/>
								)}
								<Link
									to={`/licenses/vendors/${data?.vendor_id}#overview`}
									className="custom__app__name__css text-decoration-none"
								>
									{data?.vendor_name}
								</Link>
							</div>
						}
						dataUnavailable={!data?.vendor_id}
						className="d-flex justify-content-between align-items-center mb-3"
					/>
					<OverviewField
						label="OWNER"
						value={
							<UserInfoTableComponent
								user_id={data?.primary_owner_id}
								user_name={data?.primary_owner_name}
								user_profile={data?.primary_owner_profile}
								user_account_type={
									data?.primary_owner_account_type
								}
							/>
						}
						dataUnavailable={!data?.primary_owner_id}
						className="d-flex justify-content-between align-items-center mb-3"
					/>
					<OverviewField
						label="PAYMENT METHOD"
						value={
							<BulkChangePaymentMethod
								entity_ids={[contractId]}
								api_call={bulkUpdatePaymentMethods}
								refresh={() => requestData(contractId)}
								is_success={(res) =>
									res.result &&
									res.result.status === "success"
								}
								is_table_cell={true}
								popover_class="table-cell-change-payment-method"
								payment_method={{
									payment_method_id: data?.payment_method_id,
									payment_method_name:
										data?.payment_method_name,
									payment_method_type:
										data?.payment_method_type,
									payment_method_details_type:
										data?.payment_method_details?.type,
									payment_method_logo_url:
										data?.payment_method_logo_url,
								}}
							/>
						}
						className="d-flex justify-content-between align-items-center mb-3"
					/>
				</div>
			)}
			<hr className="mx-0 my-3 w-100" />
			{loading ? (
				<OverviewFieldLoaderCard />
			) : (
				<div className="d-flex flex-column">
					<OverviewField
						label="START DATE"
						value={UTCDateFormatter(data?.start_date)}
						dataUnavailable={!data?.start_date}
						className="d-flex justify-content-between align-items-center mb-3"
					/>
					<OverviewField
						label="END DATE"
						value={
							<ContractCustomReminders
								contractId={contractId}
								reminders={data?.custom_reminders}
								type="end_date"
								displayDate={data?.end_date}
								refresh={requestData}
							/>
						}
						dataUnavailable={!data?.end_date}
						className="d-flex justify-content-between align-items-center mb-3"
						hidden={entity !== screenEntity.CONTRACT}
						keyClassName="h-100"
					/>
					<OverviewField
						label="RENEW/CANCEL BY"
						value={
							<ContractCustomReminders
								contractId={contractId}
								reminders={data?.custom_reminders}
								type="cancel_by"
								displayDate={data?.cancel_by}
								refresh={requestData}
								typeDisplayText={"cancel date"}
							/>
						}
						dataUnavailable={!data?.cancel_by}
						className="d-flex justify-content-between align-items-center mb-3"
						hidden={entity !== screenEntity.CONTRACT}
						keyClassName="h-100"
					/>
					<OverviewField
						label="PAYMENT TERM"
						value={
							data?.payment_term === "recurring"
								? `Every ${data?.payment_repeat_frequency} ${data?.payment_repeat_interval}`
								: "One Time"
						}
						dataUnavailable={
							!data?.payment_term ||
							(data?.payment_term === "recurring" &&
								!(
									data?.payment_repeat_frequency &&
									data?.payment_repeat_interval
								))
						}
						className="d-flex justify-content-between align-items-center mb-3"
						hidden={entity !== screenEntity.CONTRACT}
					/>
					{getContractNextPaymentDate(data) <
						new Date(data?.end_date) && (
						<OverviewField
							label="NEXT PAYMENT"
							value={
								<ContractCustomReminders
									contractId={contractId}
									reminders={data?.custom_reminders}
									type="upcoming_payment"
									displayDate={getContractNextPaymentDate(
										data
									)}
									refresh={requestData}
									typeDisplayText={"next payment"}
								/>
							}
							dataUnavailable={!data?.payment_repeat_on}
							className="d-flex justify-content-between align-items-center mb-3"
							hidden={
								entity !== screenEntity.CONTRACT ||
								data?.payment_term === "one_time"
							}
							keyClassName="h-100"
						/>
					)}
					<OverviewField
						label="RENEWAL TERM"
						value={`Every ${data?.renewal_repeat_frequency} ${data?.renewal_repeat_interval}`}
						dataUnavailable={
							!(
								data?.renewal_repeat_frequency &&
								data?.renewal_repeat_interval
							)
						}
						className="d-flex justify-content-between align-items-center mb-3"
						hidden={entity !== screenEntity.SUBSCRIPTION}
					/>
					<OverviewField
						label="FIRST RENEWAL"
						value={UTCDateFormatter(data?.next_renewal_date)}
						dataUnavailable={!data?.next_renewal_date}
						className="d-flex justify-content-between align-items-center mb-3"
						hidden={entity !== screenEntity.SUBSCRIPTION}
					/>
					<OverviewField
						label="PAYMENT TERM"
						value={"One Time"}
						className="d-flex justify-content-between align-items-center mb-3"
						hidden={entity !== screenEntity.PERPETUAL}
					/>
					<OverviewField
						label="PAYMENT DATE"
						value={UTCDateFormatter(data?.payment_date)}
						dataUnavailable={!data?.payment_date}
						className="d-flex justify-content-between align-items-center mb-3"
						hidden={
							entity === screenEntity.SUBSCRIPTION ||
							data?.payment_term === "recurring"
						}
					/>
				</div>
			)}
			{entity !== screenEntity.SUBSCRIPTION && (
				<>
					<hr className="mx-0 my-3 w-100" />
					{loading ? (
						<OverviewFieldLoaderCard />
					) : (
						<div className="d-flex flex-column">
							{data?.checklist &&
								Array.isArray(data?.checklist) &&
								data?.checklist.map((field) => (
									<OverviewField
										label={field.key
											.replaceAll("_", " ")
											.toUpperCase()}
										value={contractBooleanFieldsFormatter(
											field.value
										)}
										className="d-flex justify-content-between align-items-center mb-3"
										keyClassName="contract-overview-boolean-keys"
										valueClassName="contract-overview-boolean-values"
									/>
								))}
						</div>
					)}
				</>
			)}
			<hr className="mx-0 my-3 w-100" />
			{loading ? (
				<OverviewFieldLoaderCard />
			) : (
				<>
					<CustomFieldSectionInOverview
						customFieldData={data?.custom_fields || []}
						entityId={contractId}
						cfEntitiy={CUSTOM_FIELD_ENTITY.CONTRACTS}
						patchAPI={patchSingleContract}
						refresh={() => requestData(contractId)}
					/>
				</>
			)}
		</div>
	);
}
