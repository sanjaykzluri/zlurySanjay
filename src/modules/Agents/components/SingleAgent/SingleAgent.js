import React, { useEffect, useState, useRef, useContext } from "react";
import "./SingleAgent.css";
import { useLocation } from "react-router-dom";
import { PromptModal } from "../../components/Modals/PromptModal";
import { getSingleAgentOverview } from "../../../../services/api/agents";
import RoleContext from "../../../../services/roleContext/roleContext";
import UnauthorizedToView from "../../../../common/restrictions/UnauthorizedToView";
import { userRoles } from "../../../../constants/userRole";
import HowItWorks from "./HowItWorks";
import DataWeCollect from "./DataWeCollect";
import HowToInstall from "./HowToInstall";
import AgentNameAndLogo from "./AgentNameAndLogo";
import AgentVersionInfo from "./AgentVersionInfo";
import AgentUsageInfo from "./AgentUsageInfo";
import AgentDownloadButtons from "./AgentDownloadButtons";
import HeaderTitleBC from "../../../../components/HeaderTitleAndGlobalSearch/HeaderTitleBC";
import { agentImg } from "constants/agents";
import { trackPageSegment } from "modules/shared/utils/segment";
import { PARTNER } from "modules/shared/constants/app.constants";

export function SingleAgent(props) {
	const { partner, userRole } = useContext(RoleContext);
	const ref = useRef();
	const location = useLocation();
	const [showPromptModal, setShowPromptModal] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState();
	const [agent, setAgent] = useState([]);

	useEffect(() => {
		trackPageSegment("Agent", "Single Agent Info");
		try {
			const id = location.pathname.split("/")[2];
			getSingleAgentOverview(id).then((res) => {
				if (res?.error) {
					setError(res?.error);
				} else {
					setAgent(res?.data);
					setLoading(false);
				}
			});
		} catch (error) {
			setLoading(false);
			setError(error);
		}
	}, []);

	return (
		<>
			{userRole === userRoles.FINANCE_ADMIN ||
			userRole === userRoles.PROCUREMENT_ADMIN ||
			userRole === userRoles.INTEGRATION_ADMIN ||
			userRole === userRoles.SECURITY_ADMIN ? (
				<UnauthorizedToView />
			) : (
				<>
					<HeaderTitleBC
						title="Agents"
						inner_screen={true}
						entity_name={agent?.name}
						entity_logo={agentImg(agent?.name)}
						go_back_url="/agents#overview"
					/>
					<hr style={{ margin: "0px 40px" }}></hr>
					<div className="singleAgent__cont">
						<div className="singleAgent__cont__left">
							<div className="singleagent__cont">
								<AgentNameAndLogo
									loading={loading}
									agent={agent}
								/>
								{!loading && (
									<AgentDownloadButtons
										download_links={agent?.download_links}
										learn_more={agent?.learn_more}
									/>
								)}
								<hr
									style={{
										margin: "20px 0px 20px 0px",
									}}
								/>
								<AgentVersionInfo
									loading={loading}
									agent={agent}
								/>
								<hr
									style={{
										margin: "0px 0px 20px 0px",
									}}
								/>
								<AgentUsageInfo
									loading={loading}
									agent={agent}
									setShowPromptModal={setShowPromptModal}
								/>
							</div>
						</div>
						<div className="singleAgent__cont__right">
							<HowItWorks agent={agent} loading={loading} />
							<DataWeCollect agent={agent} loading={loading} />
							{partner?.name === PARTNER.ZLURI.name && (
								<HowToInstall
									loading={loading}
									step_images={agent?.step_images}
								/>
							)}
						</div>
						{showPromptModal && (
							<PromptModal
								isAgentOverview={true}
								isOpen={showPromptModal}
								closeModal={() => setShowPromptModal(false)}
							></PromptModal>
						)}
					</div>
				</>
			)}
		</>
	);
}
