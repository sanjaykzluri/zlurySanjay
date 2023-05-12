import React from "react";
import { useSelector } from "react-redux";
import plus from "../../../../assets/icons/plus.svg";
import { NameBadge } from "../../../../common/NameBadge";
import "./SelectUser.css";

export default function SelectUser(props) {
	const workflow = useSelector((state) => state.workflows.workflow);
	const usersList = workflow?.users?.map((user, index) => {
		return (
			<li className="mr-2 mb-2" key={index}>
				<div className="d-flex d-inline-flex z-worflow-user-card p-2 pl-3 pr-3">
					{user.user_logo ? (
						<img
							className="mr-1 rounded-circle"
							width="16"
							height="16px"
							src={user.user_logo}
						/>
					) : (
						<NameBadge
							className="mr-2 img-circle"
							width={16}
							name={user.user_name}
						/>
					)}

					<p className="font-14 black-1 m-0">{user.user_name}</p>
				</div>
			</li>
		);
	});

	return (
		<div className="z-workflow-select-user white-bg p-4 mb-2 position-relative">
			<h3 className="font-14 grey">Selected users</h3>
			<div className="d-flex d-inline-flex">
				<ul className="d-flex d-inline-flex list-style-none p-0 m-0  flex-wrap">
					{usersList}
					{!workflow.isExecuted && (
						<li>
							<div
								onClick={() => {
									props.addMore();
								}}
								className="d-flex d-inline-flex z-worflow-user-card p-2 pl-3 pr-3 pointer"
							>
								<img
									className="mr-1"
									width="16"
									height="16px"
									src={plus}
								/>
								<p className="font-14 grey-1 m-0">Add more</p>
							</div>
						</li>
					)}
				</ul>
			</div>
		</div>
	);
}
