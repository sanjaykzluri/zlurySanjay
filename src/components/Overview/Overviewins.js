import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrgOnboardingStatus } from "../../actions/overview-action";
import { Loader } from "../../common/Loader/Loader";
import { getOrgOnboardingStatus } from "../../services/api/onboarding";
import InitialSetup from "../GettingStarted/InitialSetup";
import _ from "underscore";

import { OverviewinsFilter } from "./OverviewinsFilter";

export const onBoardingStatuses = {
	ACTIVE: "active",
	PROCESSING: "processing",
};
const activeComponentMap = {
	[onBoardingStatuses.ACTIVE]: <OverviewinsFilter />,
	[onBoardingStatuses.PROCESSING]: <InitialSetup />,
};
export function Overviewins() {
	const [onBoardingStatus, setOnBoardingStatus] = useState();
	const orgId = useSelector((state) => state?.userInfo?.org_id);
	const dispatch = useDispatch();
	const { org_onboarding_status } = useSelector((state) => state?.overview);

	useEffect(() => {
		if (
			orgId &&
			!org_onboarding_status.loading &&
			_.isEmpty(org_onboarding_status.data)
		) {
			const callback = () => {
				dispatch(fetchOrgOnboardingStatus(orgId));
				clearInterval(intervalRef);
			};
			const intervalRef = setInterval(callback, 30000);
			callback();
		}
	}, [orgId]);

	useEffect(() => {
		if (org_onboarding_status.data && org_onboarding_status.loaded) {
			setOnBoardingStatus(org_onboarding_status.data);
		}
	}, [org_onboarding_status]);

	return (
		<div className="bg_greyish">
			{activeComponentMap[onBoardingStatus] || (
				<Loader width={100} height={100} />
			)}
		</div>
	);
}
