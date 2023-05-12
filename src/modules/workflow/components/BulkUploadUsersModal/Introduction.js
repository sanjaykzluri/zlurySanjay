import React from "react";
import { Accordion, Card } from "react-bootstrap";
import UploadCSV from "../../../../assets/workflow/upload-csv-icon.svg";
import Users from "../../../../assets/workflow/users.svg";
import Workflow from "../../../../assets/workflow/workflow.svg";
import Arrow from "../../../../assets/workflow/Arrow.svg";
import RoleContext from "services/roleContext/roleContext";
import { useContext } from "react";

const Introduction = ({ workflowType }) => {
	const { partner } = useContext(RoleContext);
	return (
		<Accordion
			style={{ backgroundColor: "rgba(250, 251, 252, 0.5)" }}
			className="p-3"
			defaultActiveKey="0"
		>
			<Card style={{ borderRadius: "8px" }}>
				<Card.Header
					className="p-0"
					style={{
						backgroundColor: "transparent",
					}}
				>
					<Accordion.Toggle
						className="border-0"
						as={Card.Header}
						variant="link"
						eventKey="0"
					>
						<p className="bold-600 font-11 m-0">
							Upload user CSV and{" "}
							{workflowType === "onboarding"
								? "onboard"
								: "offboard"}{" "}
							them
						</p>
					</Accordion.Toggle>
				</Card.Header>
				<Accordion.Collapse eventKey="0">
					<Card.Body>
						<div
							style={{ justifyContent: "space-evenly" }}
							className="row align-items-center"
						>
							<div className="col-md-3 d-flex">
								<div className="d-flex flex-1 flex-column align-items-center">
									<img
										className="pb-1"
										height={30}
										width={25}
										src={UploadCSV}
										alt=""
									/>
									<p className="bold-600 font-12 m-0 mt-1">
										Upload CSV
									</p>
									<p className="grey-1 bold-400 font-8 m-0 text-align-center mt-1">
										Upload new users data via CSV as in the
										format
									</p>
								</div>
							</div>
							<img height={30} width={25} src={Arrow} alt="" />
							<div className="col-md-3 d-flex p-0">
								<div className="d-flex flex-1 flex-column align-items-center">
									<img
										height={30}
										width={30}
										src={Users}
										alt=""
									/>
									<p className="bold-600 font-12 m-0 mt-1 text-align-center">
										Users added to {partner?.name}
									</p>
									<p className="grey-1 bold-400 font-8 m-0 text-align-center mt-1">
										New users detected in CSV are added to
										{partner?.name}
									</p>
								</div>
							</div>
							<img height={30} width={25} src={Arrow} alt="" />
							<div className="col-md-3 d-flex">
								<div className="d-flex flex-1 flex-column align-items-center">
									<img
										height={30}
										width={30}
										src={Workflow}
										alt=""
									/>
									<p className="bold-600 font-12 m-0 mt-1">
										Run playbook
									</p>
									<p className="grey-1 bold-400 font-8 m-0 text-align-center mt-1">
										Newly added users are{" "}
										{workflowType === "onboarding"
											? "onboarded"
											: "offboarded"}{" "}
										using the selected playbook
									</p>
								</div>
							</div>
						</div>
					</Card.Body>
				</Accordion.Collapse>
			</Card>
		</Accordion>
	);
};

export default Introduction;
