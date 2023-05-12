import React, { useEffect, useState } from "react";
import plus from "../../../../assets/icons/plus-blue.svg";
import authorized from "../../../../assets/authorizedGreen.svg";
import completeicon from "../../../../assets/icons/completeicon.svg";
import "./RecommendedApplicationCard.css";
import { useDispatch, useSelector } from "react-redux";
import { addAppToWorkflow, editWorkflowNodes } from "../../redux/workflow";
import { WorkFlowApplicationModel } from "../../model/model";
import { NameBadge } from "../../../../common/NameBadge";
import { AppAuthStatusIconAndTooltip } from "../../../../common/AppAuthStatus";
import { Loader } from "../../../../common/Loader/Loader";
import RoleContext from "services/roleContext/roleContext";
import { useContext } from "react";

function RecommendedApplicationCard(props) {
	const workflow = useSelector((state) => state.workflows.workflow);
	const [isAppAdded, setIsAppAdded] = useState(false);
	const [loading, setLoading] = useState(false);
	const { partner } = useContext(RoleContext);
	const dispatch = useDispatch();

	const handleAdd = () => {
		setLoading(true);
		dispatch(
			addAppToWorkflow(
				workflow.id,
				{
					app_id: props.application.id,
					isAppAdded: true,
				},
				false,
				props.isTemplate,
				partner?.name
			)
		);
	};

	useEffect(() => {
		if (Object.keys(workflow).length) {
			workflow.nodes.forEach((application) => {
				if (application.id === props.application.id) {
					setIsAppAdded(true);
					setLoading(false);
				}
			});
		}
	}, [workflow, props.application]);

	return (
		<>
			<div
				className={`d-flex flex-row recommendedItem mt-2 ${
					isAppAdded ? "added" : ""
				} ${workflow.isExecuted ? "o-5" : ""}`}
			>
				<div className="position-relative">
					{props.application.logo ? (
						<img
							className="recommendedAppIcon"
							src={props.application.logo}
						/>
					) : (
						<NameBadge
							className="mr-2 img-circle"
							width={32}
							name={props.application.name}
						/>
					)}

					<AppAuthStatusIconAndTooltip
						authStatus={props.application.state}
						width={10}
						className="position-absolute d-flex"
						style={{
							bottom: "-4px",
							left: "20px",
							background: "#fff",
							borderRadius: "30px",
						}}
					/>
				</div>

				<div className="d-flex flex-column align-self-center">
					<div className="grey font-16 title">
						{props.application.name}
					</div>
				</div>
				<div className="d-flex ml-auto mt-auto mb-auto">
					{loading ? (
						<>
							<Loader height={30} width={30} />
						</>
					) : (
						<>
							{isAppAdded ? (
								<>
									<img
										src={completeicon}
										width={10}
										className="mr-1"
									/>
									<div className="authorized_green font-13">
										Added
									</div>
								</>
							) : (
								!workflow.isExecuted && (
									<div
										className="d-flex cursor-pointer"
										onClick={() => handleAdd()}
									>
										<img
											src={plus}
											width={10}
											className="mr-1"
										/>
										<div className="primary-color font-13">
											Add
										</div>
									</div>
								)
							)}
						</>
					)}
				</div>
			</div>
		</>
	);
}

export default RecommendedApplicationCard;
