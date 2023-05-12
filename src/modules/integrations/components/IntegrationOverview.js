import React, { useContext, useEffect, useState } from "react";
import tickmark from "../../../assets/tick-mark.svg";
import screenshot from "../../../assets/screenshot.png";
import right from "../../../assets/icons/circle-arrow-right.svg";
import { IntegrationCard } from "./IntegrationCard/IntegrationCard";
import { Button } from "UIComponents/Button/Button";
import { clientV2 } from "utils/client";
import dayjs from "dayjs";
import { changePageTitleIfTabChanged } from "modules/workflow/components/TabBar/Tabbar";
import ContentLoader from "react-content-loader";
import { Integration } from "../model/model";
import { useHistory } from "react-router-dom";
import browseIcon from "assets/browse-icon.svg";
import CustomSlider from "UIComponents/Slider/Slider";
import { getIntegrationsv2 } from "../service/api";
import { IntegrationErrorInfo } from "modules/integrations/components/IntegrationErrorInfo";
import RoleContext from "services/roleContext/roleContext";

const IntegrationOverview = ({ integration, ...props }) => {
	const [nav, setNav] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [errorTitle, setErrorTitle] = useState("");
	const [errorDescription, setErrorDescription] = useState("");
	const [errorCount, setErrorCount] = useState();
	const [integrationOverview, setIntegrationOverview] = useState();
	const integrationId = window.location.pathname.split("/")[4];
	const history = useHistory();
	const { partner } = useContext(RoleContext);

	useEffect(() => {
		async function loadData() {
			let data = await getIntegrationsv2(integrationId);
			try {
				data.description = data.description?.replaceAll(
					"Zluri",
					partner?.name
				);
				data.primary_integration_description =
					data.primary_integration_description?.replaceAll(
						"Zluri",
						partner?.name
					);
			} catch (err) {
				console.log(err);
			}

			setIntegrationOverview(data);
			let title, description, text;
			if (data.primary_source_error) {
				title = data.primary_integration_title;
				description = data.primary_integration_description;
			} else if (!data.primary_source_error) {
				setErrorCount(data.instances_error_count);
				text =
					data.instances_error_count === 1
						? "instance has error. Reconnect it immediately."
						: "instances have errors.  Reconnect them immediately.";
				title = `${data.instances_error_count} ${text} `;
				description = `Data sync with ${partner?.name} has been affected. The data you see on ${partner?.name} could be outdated due to this.`;
			}
			setErrorTitle(title);
			setErrorDescription(description);
			setIsLoading(false);
		}
		loadData();
	}, []);

	return (
		<div className="py-4 mb-8">
			{isLoading ? (
				<div className="pl-4 flex-fill" style={{ width: "65%" }}>
					<div className="p-4 border-1 border-radius-4 mb-3">
						<ContentLoader
							speed={2}
							width={497}
							height={10}
							viewBox="0 0 497 10"
							backgroundColor="#f3f3f3"
							foregroundColor="#ecebeb"
							{...props}
						>
							<rect width="497" height="10" />
						</ContentLoader>
						<ContentLoader
							speed={2}
							width={362}
							height={10}
							viewBox="0 0 362 10"
							backgroundColor="#f3f3f3"
							foregroundColor="#ecebeb"
							{...props}
						>
							<rect width="362" height="10" />
						</ContentLoader>
						<ContentLoader
							speed={2}
							width={497}
							height={10}
							viewBox="0 0 497 10"
							backgroundColor="#f3f3f3"
							foregroundColor="#ecebeb"
							{...props}
						>
							<rect width="497" height="10" />
						</ContentLoader>
						<ContentLoader
							speed={2}
							width={362}
							height={10}
							viewBox="0 0 362 10"
							backgroundColor="#f3f3f3"
							foregroundColor="#ecebeb"
							{...props}
						>
							<rect width="362" height="10" />
						</ContentLoader>
						<ContentLoader
							speed={2}
							width={497}
							height={10}
							viewBox="0 0 497 10"
							backgroundColor="#f3f3f3"
							foregroundColor="#ecebeb"
							{...props}
						>
							<rect width="497" height="10" />
						</ContentLoader>
						<ContentLoader
							speed={2}
							width={362}
							height={10}
							viewBox="0 0 362 10"
							backgroundColor="#f3f3f3"
							foregroundColor="#ecebeb"
							{...props}
						>
							<rect width="362" height="10" />
						</ContentLoader>
					</div>
					<div className="p-4 border-1 border-radius-4">
						<ContentLoader
							speed={2}
							width={497}
							height={10}
							viewBox="0 0 497 10"
							backgroundColor="#f3f3f3"
							foregroundColor="#ecebeb"
							{...props}
						>
							<rect width="497" height="10" />
						</ContentLoader>
						<ContentLoader
							speed={2}
							width={362}
							height={10}
							viewBox="0 0 362 10"
							backgroundColor="#f3f3f3"
							foregroundColor="#ecebeb"
							{...props}
						>
							<rect width="362" height="10" />
						</ContentLoader>
						<ContentLoader
							speed={2}
							width={497}
							height={10}
							viewBox="0 0 497 10"
							backgroundColor="#f3f3f3"
							foregroundColor="#ecebeb"
							{...props}
						>
							<rect width="497" height="10" />
						</ContentLoader>
						<ContentLoader
							speed={2}
							width={362}
							height={10}
							viewBox="0 0 362 10"
							backgroundColor="#f3f3f3"
							foregroundColor="#ecebeb"
							{...props}
						>
							<rect width="362" height="10" />
						</ContentLoader>
						<ContentLoader
							speed={2}
							width={497}
							height={10}
							viewBox="0 0 497 10"
							backgroundColor="#f3f3f3"
							foregroundColor="#ecebeb"
							{...props}
						>
							<rect width="497" height="10" />
						</ContentLoader>
						<ContentLoader
							speed={2}
							width={362}
							height={10}
							viewBox="0 0 362 10"
							backgroundColor="#f3f3f3"
							foregroundColor="#ecebeb"
							{...props}
						>
							<rect width="362" height="10" />
						</ContentLoader>
					</div>
				</div>
			) : (
				<>
					{integrationOverview.primary_source_error ||
					integrationOverview.instances_error_count ? (
						<IntegrationErrorInfo
							isSourceError={
								integrationOverview.primary_source_error
							}
							title={errorTitle}
							description={errorDescription}
							errorMessage={
								integrationOverview?.primary_integration_error
							}
							instance={integrationOverview.instance}
							type="detail"
							classProp="mx-auto"
							intId={integrationId}
							integrationData={integration}
							errorCount={errorCount}
						/>
					) : integration?.accounts?.length > 0 &&
					  !integrationOverview.primary_source_error &&
					  !integrationOverview.instances_disconnected_count ? (
						<div
							style={{
								backgroundColor: "rgba(90, 186, 255, 0.1)",
							}}
							className="flex justify-content-between p-2 px-4"
						>
							<div>
								<span className="mr-1 font-14 bold-500">
									{integration?.accounts?.length} instances
									for{" "}
									<img
										className="mx-2"
										width="18px"
										src={integration.logo}
									/>{" "}
									{integrationOverview?.name}
								</span>
							</div>
							<div>
								<Button
									type="link"
									className="btn btn-link btn-sm text-decoration-none"
									onClick={() => {
										history.push(
											`/integrations/${integration.id}/instance#instances`
										);
									}}
								>
									View instances
									<img
										width={"15px"}
										className="ml-2"
										src={browseIcon}
									/>
								</Button>
							</div>
						</div>
					) : null}
					<div
						style={{ lineHeight: "24px" }}
						className="font-14 my-2"
					>
						{integrationOverview?.description}
					</div>
					{integrationOverview?.integration_description && (
						<>
							<div className="font-16 bold-600 mt-4 mb-4">
								{partner?.name} + {integrationOverview?.name}
							</div>
							<div
								dangerouslySetInnerHTML={{
									__html: integrationOverview?.integration_description,
								}}
								className="font-14 integration-description"
								style={{
									fontFamily: "Sora, sans-serif",
									paddingRight: "15px",
								}}
							></div>
						</>
					)}

					{Array.isArray(integrationOverview?.supported_plans) &&
						integrationOverview?.supported_plans.length > 0 && (
							<>
								<h4 className="font-16 bold-600 mt-5 mb-2">
									Supported Plans
								</h4>
								<hr />
								<div
									style={{
										flexWrap: "wrap",
										fontSize: "14px",
									}}
									className="flex"
								>
									{Array.isArray(
										integrationOverview?.supported_plans
									) &&
									integrationOverview?.supported_plans
										.length > 0
										? integrationOverview?.supported_plans.map(
												(plan, index) => (
													<div
														className="py-1"
														style={{ width: "25%" }}
													>
														<img
															width={"10px"}
															className="mx-2"
															src={tickmark}
														/>
														{plan.plan_name}
													</div>
												)
										  )
										: "Not available"}
								</div>
							</>
						)}

					{Array.isArray(integrationOverview?.screenshots) &&
						integrationOverview?.screenshots.length > 0 &&
						integrationOverview?.screenshots[0].screenshot_url !=
							"" && (
							<>
								<h4 className="font-16 bold-600 mt-4 mb-2">
									Screenshots
								</h4>
								<hr />
								<div
									style={{
										justifyContent: "flex-start",
										overflowX: "scroll",
									}}
									className="flex"
								>
									{Array.isArray(
										integrationOverview?.screenshots
									) &&
									integrationOverview?.screenshots.length > 0
										? integrationOverview?.screenshots.map(
												(screen, index) => (
													<div className="px-1">
														<img
															width={"300px"}
															src={
																screen.screenshot_url
															}
															alt={
																screen.screenshot_description
															}
														/>
													</div>
												)
										  )
										: "Not available"}
								</div>
							</>
						)}

					{integrationOverview?.changelog.length > 0 &&
						integrationOverview?.changelog[0]
							.changelog_description != "" && (
							<>
								<div
									className="flex"
									style={{
										justifyContent: "space-between",
										alignItems: "center",
									}}
								>
									<div>
										{" "}
										<h4 className="font-16 bold-600 my-4">
											Changelog
										</h4>
									</div>
									<div
										className="font-12"
										style={{
											color: "rgba(34, 102, 226, 1)",
										}}
									>
										{integrationOverview?.changelog.date &&
											dayjs(
												integrationOverview?.changelog
													.date
											).format("DD MMM YYYY")}
									</div>
								</div>
								<vr />

								<hr />
								<div>
									{integrationOverview?.changelog.description}
								</div>
							</>
						)}

					{integrationOverview?.similar_integrations?.length > 0 && (
						<>
							<h4 className="font-16 bold-600 my-4 mt-5">
								Similar Integrations
							</h4>
							<hr />
							{integrationOverview?.similar_integrations?.length >
							0 ? (
								<div className="mt-5 mb-3">
									<div className="mt-4 position-relative">
										<CustomSlider
											className="z_i_similar_apps_slider"
											arrows={
												integrationOverview
													?.similar_integrations
													.length > 4
													? true
													: false
											}
											asNavFor={nav}
											data={
												integrationOverview?.similar_integrations
											}
											slidesToScroll={
												integrationOverview
													?.similar_integrations
													.length > 3
													? 1
													: integrationOverview
															?.similar_integrations
															.length
											}
											renderComp={(el, index) => (
												<IntegrationCard
													inSlider={true}
													isSimilarIntegration={true}
													key={index}
													integration={
														new Integration(el)
													}
												/>
											)}
											showNextButton={true}
											infinite={
												integrationOverview
													?.similar_integrations
													.length > 4
													? true
													: false
											}
										></CustomSlider>
									</div>
								</div>
							) : (
								"Not available"
							)}
						</>
					)}
				</>
			)}
		</div>
	);
};

export default IntegrationOverview;
