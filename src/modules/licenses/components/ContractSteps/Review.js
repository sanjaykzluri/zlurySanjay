import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import ReviewContractMiscDetails from "./ContractStepsComponents/ReviewContractMiscDetails";
import ReviewLicenseDetails from "./ContractStepsComponents/ReviewLicenseDetails";
import ReviewSetupDiscountTotal from "./ContractStepsComponents/ReviewSetupDiscountTotal";
import { Button } from "../../../../UIComponents/Button/Button";
import { Spinner } from "react-bootstrap";
import { screenEntity } from "modules/licenses/constants/LicenseConstants";
import { setInititalStepperState } from "common/Stepper/redux";
import { clearAllV2DataCache } from "modules/v2InfiniteTable/redux/v2infinite-action";
import { capitalizeFirstLetter } from "utils/common";
import { toast } from "react-toastify";
import DefaultNotificationCard from "common/Notification/PusherNotificationCards/DefaultNotificationCard";
import {
	getAddContractReqBody,
	getEditContractReqBody,
} from "modules/licenses/utils/LicensesUtils";
import { clearSpendCostGraphData } from "modules/spendvscost/redux/spendvscost_action";
import { ApiResponseNotification } from "modules/shared/components/ApiResponseNotification/ApiResponseNotification";
import { apiResponseTypes } from "modules/shared/components/ApiResponseNotification/ApiResponseNotificationConstants";

export default function Review({ entity, saveData }) {
	let history = useHistory();
	const dispatch = useDispatch();
	const [submitting, setSubmitting] = useState(false);
	const [submitFailed, setSubmitFailed] = useState(false);
	const { data } = useSelector((state) => state.stepper);
	const contractId = window.location.pathname.split("/")[3];

	const saveDataCall = () => {
		setSubmitting(true);
		saveData &&
			saveData(
				window.location.pathname.includes("edit")
					? getEditContractReqBody(data, entity)
					: getAddContractReqBody(data, entity),
				contractId
			)
				.then((res) => {
					if (res.status === "success" && res.id) {
						dispatch(setInititalStepperState());
						dispatch(clearAllV2DataCache("licenses"));
						dispatch(clearAllV2DataCache(`${entity}s`));
						dispatch(clearSpendCostGraphData());
						toast(
							<DefaultNotificationCard
								notification={{
									title: ` ${capitalizeFirstLetter(
										entity
									)} has been successfully ${
										window.location.pathname.includes(
											"edit"
										)
											? "edited"
											: "added"
									}`,
									description: `${data.name}`,
								}}
							/>
						);
						history.push(
							`/licenses/${
								entity !== screenEntity.PERPETUAL
									? entity
									: "perpetual"
							}s/${res.id}#overview`
						);
						setSubmitting(false);
					} else {
						ApiResponseNotification({
							responseType: apiResponseTypes.ERROR,
							errorObj: res,
							title: `Error in ${
								window.location.pathname.includes("edit")
									? "editing"
									: "adding"
							} ${entity} api`,
							retry: saveDataCall,
						});
						setSubmitFailed(true);
						setSubmitting(false);
					}
				})
				.catch((error) => {
					ApiResponseNotification({
						responseType: apiResponseTypes.ERROR,
						errorObj: error,
						title: `Error in ${
							window.location.pathname.includes("edit")
								? "editing"
								: "adding"
						} ${entity} api`,
						retry: saveDataCall,
					});
					setSubmitFailed(true);
					setSubmitting(false);
				});
	};

	return (
		<>
			<ReviewContractMiscDetails data={data} entity={entity} />
			<ReviewLicenseDetails data={data} entity={entity} />
			<ReviewSetupDiscountTotal data={data} entity={entity} />
			<hr style={{ margin: "17px 0px" }} />
			<Button
				onClick={saveDataCall}
				style={{ width: "100%", height: "38px" }}
				className="text-capitalize d-flex align-items-center justify-content-center"
				disabled={submitting}
			>
				{submitting ? (
					<Spinner animation="border" />
				) : (
					<>
						{`${
							window.location.pathname.includes("edit")
								? "Save Changes"
								: `Add ${
										entity === screenEntity.PERPETUAL
											? "Perpetual Contract"
											: entity
								  }`
						}`}
					</>
				)}
			</Button>
		</>
	);
}
