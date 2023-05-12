import React from "react";
import { useSelector } from "react-redux";
import plus from "../../../../assets/icons/plus.svg";
import { NameBadge } from "../../../../common/NameBadge";
import "./SelectUser.css";

export default function SelectUser(props) {
	const { assigneeUsers } = props;
	const usersList =
		assigneeUsers &&
		assigneeUsers.map((user, index) => {
			return (
				<li className="mr-2 mb-2" key={index}>
					<div
						style={{ backgroundColor: "#F4F6FA" }}
						className="d-flex d-inline-flex z-worflow-user-card p-1"
					>
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
		<div className="z-workflow-select-user white-bg position-relative">
			{/* <h3 className="font-14 grey">Selected users</h3> */}
			<div className="d-flex d-inline-flex">
				<ul className="d-flex d-inline-flex list-style-none p-0 m-0  flex-wrap">
					{usersList}
				</ul>
			</div>
		</div>
	);
}
