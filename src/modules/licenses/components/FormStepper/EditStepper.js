import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Loader } from "../../../../common/Loader/Loader";
import {
	setReqData,
	updateStepperData,
} from "../../../../common/Stepper/redux";
import ReduxStepper from "../../../../common/Stepper/ReduxStepper";
import {
	editContractV2,
	getContractOverviewDetails,
} from "../../../../services/api/licenses";
import { TriggerIssue } from "../../../../utils/sentry";
import { booleanFieldArray } from "../../constants/LicenseConstants";
import { getFormSteps } from "../../utils/LicensesUtils";
import ContractHeader from "../ContractSteps/ContractHeader";

export default function EditStepper({ entity }) {
	const SCREENS = {
		STEPPER: <ReduxStepper steps={getFormSteps(entity, editContractV2)} />,
		OVERVIEW: <div></div>,
	};

	const location = useLocation();
	const dispatch = useDispatch();
	const { data, screen } = useSelector((state) => state.stepper);
	const id = location.pathname.split("/")[3];
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState();
	const [savedName, setSavedName] = useState();

	const updateData = (data) => {
		dispatch(updateStepperData(data));
	};

	useEffect(() => {
		if (Object.keys(data).length < 2 && loading) {
			requestContractData(id);
		} else {
			setLoading(false);
		}
	}, [data]);

	const requestContractData = (contract_id) => {
		setLoading(true);
		try {
			getContractOverviewDetails(contract_id).then((res) => {
				if (res?.error) {
					setError(res);
					setLoading(false);
				} else {
					if (location?.state?.licensesToBeAdded) {
						let tempLicenses = res.results.licenses;
						tempLicenses = [
							...tempLicenses,
							...location.state.licensesToBeAdded,
						];
						res.results.licenses = tempLicenses;
					}
					if (
						!res.results.checklist ||
						!Array.isArray(res.results.checklist) ||
						res.results.checklist.length === 0
					) {
						res.results.checklist = [...booleanFieldArray];
					}
					dispatch(setReqData(res.results));
					setSavedName(res.results.name);
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

	return (
		<div className="createplan__wrapper">
			{loading ? (
				<div className="d-flex align-items-center justify-content-center h-100">
					<Loader width={100} height={100} />
				</div>
			) : (
				<>
					<ContractHeader
						defaultName={data?.name}
						updateData={(value) => updateData({ name: value })}
						entity={entity}
						hashValue={"allContracts"}
						editEntity={true}
						returnEntityId={id}
						savedName={savedName}
					/>
					<div className="screen_wrapper">{SCREENS[screen]}</div>
				</>
			)}
		</div>
	);
}
