import React, { useEffect, useState } from "react";
import ContentLoader from "react-content-loader";
import heart from "assets/employee/heart.svg";
import emptyAppLauncher from "assets/employee/emptyAppLauncher.png";
import "./overview.css";
import { useHistory } from "react-router-dom";
import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import CustomSlider from "UIComponents/Slider/Slider";
import { Button } from "UIComponents/Button/Button";

export function AppLauncher({ loading, data }) {
	const history = useHistory();

	const appLauncherCard = (el, index) => {
		return (
			<div
				key={index}
				onClick={() =>
					history.push({
						pathname: `/user/applications/${encodeURI(el.app_id)}`,
						state: {
							app: el,
						},
					})
				}
				className="d-flex flex-column align-items-center employee-app-launcher-box border-radius-4 cursor-pointer"
				style={{
					width: "110px",
					padding: "10px",
					minHeight: "120px",
					height: "fit-content",
					marginLeft: index === 0 ? "0px" : "35px",
				}}
			>
				<div
					className="d-flex align-items-center justify-content-center"
					style={{
						marginBottom: "6px",
						height: "60px",
					}}
				>
					<GetImageOrNameBadge
						name={el.app_name}
						url={el.app_logo}
						width={60}
						height={"auto"}
					/>
				</div>
				<div
					className="font-12"
					style={{
						fontWeight: "300",
						textAlign: "center",
					}}
				>
					{el.app_name}
				</div>
			</div>
		);
	};

	return (
		<>
			{loading ? (
				<>
					<div
						className="d-flex flex-column w-100"
						style={{
							padding: "40px 30px 40px 40px",
							background: " #FAFBFC",
							marginBottom: "40px",
						}}
					>
						<div
							className="font-18 bold-600"
							style={{ marginBottom: "30px" }}
						>
							<ContentLoader width={207} height={28}>
								<rect
									width="207"
									height="28"
									rx="2"
									fill="#EBEBEB"
								/>
							</ContentLoader>
						</div>

						<div
							className="d-flex "
							style={{ marginBottom: "30px" }}
						>
							{Array(10)
								.fill({ dummy: "Hello" })
								.map((el, index) => (
									<div
										className="d-flex flex-column align-items-center border-radius-4"
										style={{
											width: "88px",
											paddingTop: "12px",
											paddingBottom: "10px",
											background: "#EBEBEB",
											height: "110px",
											marginLeft:
												index === 0 ? "0px" : "35px",
										}}
									>
										<ContentLoader width={66} height={66}>
											<rect
												width="66"
												height="66"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								))}
						</div>
						<div
							className="d-flex align-items-center"
							style={{ marginBottom: "30px" }}
						>
							{Array(10)
								.fill({ dummy: "Hello" })
								.map((el, index) => (
									<div
										className="d-flex flex-column align-items-center border-radius-4"
										style={{
											width: "88px",
											paddingTop: "12px",
											paddingBottom: "10px",
											background: "#EBEBEB",
											height: "110px",
											marginLeft:
												index === 0 ? "0px" : "35px",
										}}
									>
										<ContentLoader width={66} height={66}>
											<rect
												width="66"
												height="66"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								))}
						</div>
					</div>
				</>
			) : (
				<>
					<div
						className="d-flex flex-column w-100"
						style={{
							height: data?.most_used?.length
								? data?.favourites?.length
									? data?.favourites?.length > 4
										? "440px"
										: data?.most_used?.length > 4
										? "440px"
										: "fit-content"
									: "440px"
								: "fit-content",

							padding: "40px 30px 40px 40px",
							background: " #FEF7F4",
							marginBottom: "40px",
						}}
					>
						<div
							className="font-18 bold-600"
							style={{ marginBottom: "30px" }}
						>
							App Launcher
						</div>

						<div
							className="d-flex"
							style={{
								flexDirection:
									!data?.favourites?.length ||
									data?.favourites?.length > 4 ||
									!data?.most_used?.length ||
									data?.most_used?.length > 4
										? "column"
										: "row",
							}}
						>
							{data?.most_used?.length ||
							data?.favourites?.length ? (
								<>
									{data?.most_used?.length > 0 && (
										<div className="d-flex flex-column">
											<div
												className="font-12 black-1"
												style={{ marginBottom: "8px" }}
											>
												MOST USED
											</div>
											<div
												className="d-flex "
												style={{ marginBottom: "30px" }}
											>
												<CustomSlider
													arrows={true}
													data={data?.most_used}
													showNextButton={
														data?.most_used
															?.length > 10
													}
													showPrevButton={
														data?.most_used
															?.length > 10
													}
													slidesToScroll={2}
													renderComp={(el, index) =>
														appLauncherCard(
															el,
															index
														)
													}
													infinite={
														data?.favourites
															?.length > 10
													}
													maxWidth={
														data?.most_used
															?.length > 4
															? null
															: "450px"
													}
												/>
											</div>
										</div>
									)}
									{data?.favourites?.length > 0 ? (
										<div
											className="d-flex flex-column"
											style={{
												marginLeft:
													!data?.favourites?.length ||
													data?.favourites?.length >
														4 ||
													!data?.most_used?.length ||
													data?.most_used?.length > 4
														? "0"
														: "70px",
											}}
										>
											<div
												className="font-12 black-1"
												style={{ marginBottom: "8px" }}
											>
												FAVOURITES
											</div>
											<div
												className="d-flex "
												style={{ marginBottom: "30px" }}
											>
												<CustomSlider
													arrows={true}
													data={data?.favourites}
													showNextButton={
														data?.favourites
															?.length > 10
													}
													showPrevButton={
														data?.favourites
															?.length > 10
													}
													slidesToScroll={2}
													renderComp={(el, index) =>
														appLauncherCard(
															el,
															index
														)
													}
													infinite={
														data?.favourites
															?.length > 10
													}
													maxWidth={
														data?.favourites
															?.length > 4
															? null
															: "450px"
													}
												/>
											</div>
										</div>
									) : (
										<div className="d-flex flex-column w-100 justify-content-center align-items-center mt-3">
											<div className="font-14 bold-600 mt-2">
												No Favourites Added
											</div>
											<div className="font-10 grey-1 mt-2 mb-3">
												Explore apps in your
												organization and add your
												favourites.
											</div>
											<Button
												onClick={() =>
													history.push(
														"/user/applications"
													)
												}
											>
												Explore Apps
											</Button>
										</div>
									)}
								</>
							) : (
								<>
									<div className="d-flex w-100 flex-column align-items-center justify-content-center">
										<img
											src={emptyAppLauncher}
											height={125}
											width={176}
										/>
										<div className="font-14 bold-500 mt-1">
											We are working on populating this
											data
										</div>
										<div className="font-10 grey-1 mt-1">
											You will be able to see your most
											used and favourites apps here
										</div>
									</div>
								</>
							)}
						</div>
					</div>
				</>
			)}
		</>
	);
}
