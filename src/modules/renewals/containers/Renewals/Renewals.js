import React, { useContext, useEffect, useState } from "react";
import { Button } from "../../../../UIComponents/Button/Button";
import { viewStyle } from "../../constants/constant";
import list from "../../../../assets/icons/list.svg";
import grid from "../../../../assets/icons/grid.svg";
import "./Renewals.css";
import { useDispatch, useSelector } from "react-redux";
import { getRenewals } from "../../redux/renewal";
import { RenewalsListView } from "../../components/RenewalsListView/RenewalsListView";
import { RenewalsGridView } from "../../components/RenewalsGridView/RenewalsGridView";
import { RenewalLoader } from "../../components/RenewalLoader/RenewalLoader";
import { NoRenewalData } from "../../components/NoRenewalData/NoRenewalData";
import RestrictedContent from "../../../../common/restrictions/RestrictedContent";
import { ENTITIES } from "../../../../constants";
import HeaderTitleBC from "../../../../components/HeaderTitleAndGlobalSearch/HeaderTitleBC";
import UnauthorizedToView from "common/restrictions/UnauthorizedToView";
import { userRoles } from "constants/userRole";
import RoleContext from "services/roleContext/roleContext";

export function Renewals(props) {

	const { userRole } = useContext(RoleContext);
	const [activeView, setActiveView] = useState(viewStyle.GRID);
	const { renewalsList } = useSelector((state) => state.renewal);
	const [isLoading, setIsLoading] = useState(true);
	const dispatch = useDispatch();
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	useEffect(() => {
		//Segment Implementation
		if (activeView === viewStyle.LIST) {
			window.analytics.page("Applications", "All-Renewals; List View", {
				orgId: orgId || "",
				orgName: orgName || "",
			});
		} else {
			window.analytics.page("Applications", "All-Renewals; Grid View", {
				orgId: orgId || "",
				orgName: orgName || "",
			});
		}
	}, [activeView]);

	useEffect(() => {
		if (!renewalsList) {
			dispatch(getRenewals(viewStyle.LIST));
		} else {
			setIsLoading(false);
		}
	}, [renewalsList]);
	const commonSegmentTrack = (message) => {
		//Segment Implementation
		window.analytics.track(message, {
			currentCategory: "Applications",
			currentPageName: "Renewals",
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};
	const listButtonClicked = () => {
		setActiveView(viewStyle.LIST);
		commonSegmentTrack("List Button Clicked");
	};
	const gridButtonClicked = () => {
		setActiveView(viewStyle.GRID);
		commonSegmentTrack("Grid Button Clicked");
	};

	const noRenewals = () => {
		let flag = false;
		if (!Array.isArray(renewalsList)) {
			flag = true;
		} else {
			if (renewalsList.length === 0) {
				flag = true;
			} else {
				if (
					renewalsList.some(
						(monthlyRenewal) =>
							monthlyRenewal?.applications.length > 0
					)
				) {
					flag = false;
				}
			}
		}
		return flag;
	};

	return (
		<>
			{userRole === userRoles.INTEGRATION_ADMIN ||
				userRole === userRoles.SECURITY_ADMIN ? (
				<UnauthorizedToView />
			) : (
				<>
					<RestrictedContent entity={ENTITIES.RENEWALS}>
						<HeaderTitleBC title="Renewals" />
						<div className="renewals__header pl-5 pr-5 pt-2 mt-3 mb-4">
							<div className="view-swicth d-inline-flex">
								<Button
									className={
										activeView === viewStyle.LIST
											? "is-active"
											: ""
									}
									onClick={listButtonClicked}
									type="normal"
								>
									<img src={list} width={20} height={20} />
								</Button>
								<Button
									className={
										activeView === viewStyle.GRID
											? "is-active"
											: ""
									}
									onClick={gridButtonClicked}
									type="normal"
								>
									<img src={grid} width={20} height={20} />
								</Button>
							</div>
						</div>
						<div className="renewals__body pl-5 pr-5 pt-3">
							{isLoading ? (
								<RenewalLoader />
							) : !noRenewals() ? (
								activeView === viewStyle.LIST ? (
									<RenewalsListView list={renewalsList} />
								) : (
									<RenewalsGridView list={renewalsList} />
								)
							) : (
								<NoRenewalData />
							)}
						</div>
					</RestrictedContent>
				</>
			)}
		</>
	);
}
