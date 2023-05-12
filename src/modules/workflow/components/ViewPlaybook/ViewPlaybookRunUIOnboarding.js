import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import dayjs from "dayjs";
import React, { useEffect } from "react";
import ContentLoader from "react-content-loader";
import { Button, BUTTON_TYPE } from "UIComponents/Button/Button";
import calendar from "../../../../assets/workflow/calendar.svg";

const ViewPlaybookRunUIOnboarding = ({
	onboardingUsers,
	onboardingUsersLoading,
	loading,
	playbookData,
	selectedUsers,
	setSelectedUsers,
}) => {
	const onboardingUsersLoader = (
		<>
			{onboardingUsersLoading && (
				<div
					className={`search-iteam d-flex mt-2 px-2`}
					style={{
						height: "52px",
						width: "100%",
					}}
				>
					<div
						style={{ justifyContent: "space-between" }}
						className="d-flex align-items-center flex-1"
					>
						<ContentLoader width={115} height={52}>
							<rect
								width="115"
								height="52"
								rx="2"
								fill="#EBEBEB"
							/>
						</ContentLoader>
						<ContentLoader width={115} height={52}>
							<rect
								width="115"
								height="52"
								rx="2"
								fill="#EBEBEB"
							/>
						</ContentLoader>
						<ContentLoader width={115} height={52}>
							<rect
								width="115"
								height="52"
								rx="2"
								fill="#EBEBEB"
							/>
						</ContentLoader>
					</div>
				</div>
			)}
		</>
	);

	const onboardingUsersCard = (
		<>
			{!onboardingUsersLoading &&
				onboardingUsers &&
				onboardingUsers?.length > 0 && (
					<div
						className={`search-iteam d-flex mt-2 align-items-center`}
						style={{
							height: "52px",
							width: "100%",
							justifyContent: "space-between",
						}}
					>
						{onboardingUsers
							?.filter((item) => {
								return !selectedUsers.find((element) => {
									return (
										element.org_user_id ===
											item.org_user_id ||
										element.user_id === item.org_user_id
									);
								});
							})
							.slice(0, 3)
							.map((user, index) => (
								<div
									className={`d-flex flex-1 mr-2`}
									key={index}
									style={{
										width: "33%",
										backgroundColor: "#fff",
										borderRadius: "4px",
									}}
								>
									<div className="flex-1">
										<div className="d-flex flex-row align-items-center justify-content-center mt-2">
											<GetImageOrNameBadge
												key={index}
												name={user.name}
												url={user.profile_img}
												width={25}
												height={25}
												imageClassName={
													index === 0
														? " mr-1 z-index-1  img-circle white-bg"
														: null +
														  "img-circle avatar  mr-1 z-index-1"
												}
												nameClassName={
													index === 0
														? " mr-1 z-index-1  img-circle white-bg"
														: null +
														  "img-circle avatar  mr-1 z-index-1"
												}
											/>
											<span
												style={{
													display: "block",
													fontSize: "10px",
													fontWeight: "500",
												}}
												className="text-truncate-small"
											>
												{user?.name}
											</span>
										</div>
										<div
											style={{
												borderTop:
													"1px solid rgb(113 113 113 / 9%)",
												marginTop: "5px",
												marginBottom: "5px",
											}}
										/>
										<div className="d-flex flex-row align-items-center justify-content-center mb-1">
											<img
												alt=""
												src={calendar}
												height={10}
												width={10}
											/>
											<span
												style={{
													display: "block",
													fontSize: "8px",
													fontWeight: "400",
												}}
												className="text-truncate-small"
											>
												{dayjs(user?.date).format(
													"D MMM 'YY"
												)}
											</span>
										</div>
									</div>
									<div className="d-flex">
										<div
											style={{
												borderLeft:
													"1px solid rgb(113 113 113 / 9%)",
												marginRight: "5px",
											}}
										/>
										<Button
											style={{
												fontSize: "10px",
												fontWeight: "400",
												alignItems: "center",
											}}
											className="p-0 d-flex flex-1 title-text justify-content-end mr-2"
											type={BUTTON_TYPE.LINK}
											onClick={() => {
												setSelectedUsers(user);
											}}
										>
											+
										</Button>
									</div>
								</div>
							))}
					</div>
				)}
		</>
	);

	return (
		<div className="flex-column justify-content-start">
			<div className="pt-3 d-flex">
				<span
					className="title-text grey-1"
					style={{
						fontSize: "10px",
						fontWeight: "400",
						textTransform: "uppercase",
					}}
				>
					MARKED FOR {playbookData?.type || "ONBOARDING"}
				</span>
				{/* <Button
					style={{
						fontSize: "10px",
						fontWeight: "400",
					}}
					className="p-0 d-flex flex-1 title-text justify-content-end"
					type={BUTTON_TYPE.LINK}
					onClick={() => {}}
				>
					Show more
				</Button> */}
			</div>
			{onboardingUsersLoader}
			{onboardingUsersCard}
		</div>
	);
};

export default ViewPlaybookRunUIOnboarding;
