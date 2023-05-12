import { getOrgCurrency } from "constants/currency";
import { trackPageSegment } from "modules/shared/utils/segment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	setReqData,
	updateStepperData,
} from "../../../../common/Stepper/redux";
import ReduxStepper from "../../../../common/Stepper/ReduxStepper";
import { addContractV2 } from "../../../../services/api/licenses";
import { entityReqBodyObj } from "../../constants/LicenseConstants";
import { getFormSteps } from "../../utils/LicensesUtils";
import ContractHeader from "../ContractSteps/ContractHeader";

export default function CreateStepper({ entity }) {
	const SCREENS = {
		STEPPER: <ReduxStepper steps={getFormSteps(entity, addContractV2)} />,
		OVERVIEW: <div></div>,
	};

	const dispatch = useDispatch();
	const { data, screen } = useSelector((state) => state.stepper);
	const [loading, setLoading] = useState(true);

	const updateData = (data) => {
		dispatch(updateStepperData(data));
	};

	useEffect(() => {
		if (loading && !data?.name) {
			const reqData = entityReqBodyObj[entity];
			reqData.base_currency = getOrgCurrency();
			dispatch(setReqData(reqData));
			setLoading(false);
		}
	}, [loading]);

	return (
		<div className="createplan__wrapper">
			<ContractHeader
				defaultName={data?.name}
				updateData={(value) => updateData({ name: value })}
				entity={entity}
				hashValue={"allContracts"}
			/>
			<div className="screen_wrapper" style={{ width: "100%" }}>
				{SCREENS[screen]}
			</div>
		</div>
	);
}
