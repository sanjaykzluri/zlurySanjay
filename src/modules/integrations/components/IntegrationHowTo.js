import React, { useCallback, useContext, useEffect, useState } from "react";
import ContentLoader from "react-content-loader";
import { useSelector } from "react-redux";
import { getIntegrationsHowTo } from "../service/api";
import "./IntegrationConnectV2/IntegrationConnectV2.css";
import ViewImage from "./ViewImage";
import bluequestion from "assets/icons/question-blue.svg";
import questioncircle from "assets/icons/question-circle.svg";
import RoleContext from "services/roleContext/roleContext";

const IntegrationHowTo = ({ intId, showTitle = true, integration }) => {
	const [integrationHowTo, setIntegrationHowTo] = useState();
	const [isLoading, setIsLoading] = useState(true);
	const integrationId = intId || window.location.pathname.split("/")[4];
	const integrationData = useSelector(
		(state) => state.integrations?.integration
	);
	const { partner } = useContext(RoleContext);

	useEffect(() => {
		async function loadData() {
			let data = await getIntegrationsHowTo(integrationId);
			try {
				data.steps_to_connect?.map((val) => {
					val.description = val.description.replaceAll(
						"Zluri",
						partner?.name
					);
				});
			} catch (err) {
				console.log(err);
			}

			setIntegrationHowTo(data);
			setIsLoading(false);
		}

		if (!integration?.stepsToConnect) {
			loadData();
		} else {
			setIsLoading(false);
		}
	}, []);

	return (
		<div className="py-4">
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
						>
							<rect width="362" height="10" />
						</ContentLoader>
					</div>
				</div>
			) : (
				<>
					{showTitle && (
						<>
							<h4 className="font-16 bold-600">
								Steps to connect
							</h4>
							<hr />
						</>
					)}

					{integration?.stepsToConnect ||
					(
						Array.isArray(integrationHowTo?.steps_to_connect) &&
						integrationHowTo?.steps_to_connect
					).length ? (
						(
							integration?.stepsToConnect ||
							integrationHowTo?.steps_to_connect
						)?.map((step, index) => (
							<div key={index} className="flex py-2">
								{step?.image && (
									<>
										<ViewImage
											width={"200px"}
											height="150px"
											imageSrc={step?.image}
										/>
									</>
								)}
								<div
									style={{ wordBreak: "break-word" }}
									className="p-2"
								>
									<span className=" font-16 bold-600 pr-2">
										{`Step ${step.step}`} :
									</span>
									<span className="font-16">
										{step.title}
									</span>
									<div
										style={{ lineHeight: "24px" }}
										className="font-14 mt-2"
										dangerouslySetInnerHTML={{
											__html: step.description,
										}}
									>
										{/* {step.description} */}
									</div>
								</div>
							</div>
						))
					) : integrationData?.helpText ? (
						<div className="z_i_app_security_note d-flex align-items-start px-2 py-3 m-4">
							<div className="w-100 pl-4 pr-4">
								<div className="d-flex flex-row">
									<img
										className="mr-2 mt-1 mb-1"
										width={15}
										src={bluequestion}
									/>
									<h4 className="font-12 bold-600 mb-auto mt-auto">
										How-to Guide
									</h4>
									{integrationData?.helpURL && (
										<div className="ml-auto">
											<a
												className="font-12 primary-color bold-600"
												href={integrationData?.helpURL}
												target="_blank"
												rel="noreferrer"
											>
												{" "}
												<img
													className="mr-1 mt-0"
													width={10}
													src={questioncircle}
												/>{" "}
												More details
											</a>
										</div>
									)}
								</div>
								<div
									className="font-13 text-break remove_child_margins ml-1"
									dangerouslySetInnerHTML={{
										__html: integrationData?.helpText,
									}}
								></div>
							</div>
						</div>
					) : (
						<div align="center" className="mt-8 font-16">
							No Data Available
						</div>
					)}

					{integrationHowTo?.videos?.length > 0 &&
						integrationHowTo?.videos[0]?.video_url && (
							<>
								<h4 className="font-16 bold-600 my-4">
									Videos
								</h4>
								<hr />
								<div
									className="mb-4"
									style={{ width: "320px", height: "210px" }}
								>
									<iframe
										src="https://zluritraining.trainn.co/share/8NsodtfShGIKFjSZrwXe2g/embed"
										title="Integration help video"
										height="210px"
										allowFullScreen={true}
										width="320px"
									></iframe>
								</div>
							</>
						)}

					{integrationHowTo?.help_articles?.length > 0 && (
						<>
							<div
								className="flex py-4"
								style={{
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<div>
									{" "}
									<h4 className="font-16 bold-600 ">
										Help Articles{" "}
									</h4>
								</div>
							</div>
							<hr />
							{integrationHowTo?.help_articles?.map((article) => (
								<div
									className="p-3"
									style={{
										backgroundColor:
											"rgba(245, 246, 249, 1)",
									}}
								>
									<div className="bold-600 font-14 py-2">
										{article.title}
									</div>
									<div className="font-14 py-2">
										{article.description}
									</div>
								</div>
							))}
						</>
					)}
				</>
			)}
		</div>
	);
};

export default IntegrationHowTo;
