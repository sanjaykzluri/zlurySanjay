import React, { useEffect, useState } from "react";
import GetImageOrNameBadge from "../../common/GetImageOrNameBadge";
import { Breadcrumb } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { Navbar } from "react-bootstrap";
import HeaderNavButtons from "./HeaderNavButtons";
import { hideHeaderImgNameBadgeArr } from "./HeaderGlobalSearchConstants";
import { capitalizeFirstLetter } from "utils/common";
import close from "../../assets/close.svg";
import { getNumberOfDaysBtwnTwoDates } from "utils/DateUtility";
import { useSelector } from "react-redux";
import { onBoardingStatuses } from "components/Overview/Overviewins";
import EmployeeView from "modules/employee-dashboard/components/EmployeeView";
import RoleContext from "services/roleContext/roleContext";
import { useContext } from "react";
import BetaTag from "modules/shared/components/BetaTagAndModal/BetaTag";
import { Beta } from "modules/shared/components/BetaTagAndModal/Beta/beta";

export default function HeaderTitleBC({
	title,
	inner_screen = false,
	entity_name,
	entity_logo,
	go_back_url,
	showNavbarButtons = true,
	mainLogo,
	on_breadcrumb_click,
	onMainLogoClick,
	showCloseButton,
	mainUrl,
	isBeta = false,
}) {
	const history = useHistory();
	const userInfo = useSelector((state) => state.userInfo);
	const { org_onboarding_status } = useSelector((state) => state?.overview);
	const [onboardingDateDiff, setOnboardingDateDiff] = useState(null);
	const { partner } = useContext(RoleContext);

	useEffect(() => {
		setOnboardingDateDiff(
			getNumberOfDaysBtwnTwoDates(
				new Date(),
				new Date(userInfo.org_created_at)
			)
		);
	}, [userInfo]);

	const LogoComponent = () => {
		return (
			<div className="flex">
				<img
					onClick={() => {
						onMainLogoClick && onMainLogoClick();
					}}
					className="m-2 cursor-pointer"
					src={mainLogo}
				/>{" "}
				<div
					style={{
						borderLeft: "1px solid #EBEBEB",
						height: "40px",
					}}
					className="mr-2"
				></div>
			</div>
		);
	};

	return (
		<>
			{onboardingDateDiff < 2 &&
				org_onboarding_status.data ===
					onBoardingStatuses.PROCESSING && (
					<div
						className="w-100 font-14 d-flex align-items-center font-white"
						style={{
							paddingLeft: "28px",
							height: "41px",
							background:
								"linear-gradient(215.58deg, #2266E2 -16.01%, #5ABAFF 106.14%)",
						}}
					>
						{partner?.name} might be still processing your data. The
						data you see may not be entirely accurate. Please check
						after a few more hours.
					</div>
				)}
			<div className="NavH border-bottom">
				<div className="ins-1" style={{ maxWidth: "800px" }}>
					{!inner_screen ? (
						<>
							{mainLogo && <LogoComponent />}
							{title}
							{isBeta && <Beta style={{ fontSize: "16px" }} />}
						</>
					) : (
						<Breadcrumb bsPrefix="my-bread">
							{mainLogo && <LogoComponent />}
							<button
								onClick={() => {
									go_back_url && history.push(go_back_url);
									on_breadcrumb_click &&
										on_breadcrumb_click();
								}}
								className="my-bread-item my-bread-itemnew"
							>
								{title}
							</button>
							<Breadcrumb.Item
								active
								bsPrefix="my-bread-item d-flex align-items-center"
							>
								{!hideHeaderImgNameBadgeArr.includes(
									title?.toLowerCase()
								) && (
									<GetImageOrNameBadge
										url={entity_logo}
										name={entity_name}
										height={26}
									/>
								)}
								<div
									style={{
										marginLeft: "5px",
										cursor: "default",
									}}
									title={entity_name}
									className="truncate_breadcrumb_item_name"
								>
									{entity_name}
								</div>
							</Breadcrumb.Item>
						</Breadcrumb>
					)}
				</div>

				{showNavbarButtons && (
					<Navbar bg="white" variant="light" className="Nav ml-auto">
						<HeaderNavButtons />
					</Navbar>
				)}
				{showCloseButton && (
					<div
						onClick={() => mainUrl && history.push(mainUrl)}
						className="Nav ml-auto cursor-pointer"
					>
						<img className="p-4" src={close} />
					</div>
				)}
			</div>
			<EmployeeView>
				<BetaTag
					style={{ margin: "0 40px" }}
					message={`You’re accessing a beta version of this feature, more updates are coming shortly. We welcome feedback and suggestions, if you have any please reach out to us at support@zluri.com.`}
				/>
			</EmployeeView>
		</>
	);
}
