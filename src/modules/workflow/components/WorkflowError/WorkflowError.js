import React from "react";
import { useHistory } from "react-router";
import { Button } from "../../../../UIComponents/Button/Button";
import warningIcon from "../../../../assets/icons/delete-warning.svg";

export default function WorkflowError(props) {
	const { title, message, type, hash } = props;
	const history = useHistory();

	const goBackButton = (
		<Button
			className="ml-3 d-flex"
			onClick={() => {
				history.push(`/workflows/${type}${hash}`);
			}}
		>
			Go Back
		</Button>
	);

	return (
		<>
			<div className="container-fluid">
				<div className="row">
					<div className="col-md-12 position-relative  vh-100">
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
							}}
							className="position-center text-center"
						>
							<img
								alt=""
								src={warningIcon}
								height={"75px"}
								width={"75px"}
							/>
							<h3 className="bold-600 black-1 font-18 mb-2 mt-2">
								{title}
							</h3>
							<p className="grey-1 o-8 ">{message}</p>
							{goBackButton}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
