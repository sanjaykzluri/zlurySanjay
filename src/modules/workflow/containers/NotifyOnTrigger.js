import { NameBadge } from "common/NameBadge";
import React, { useState } from "react";
import { useEffect } from "react";
import { unescape } from "utils/common";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import GetImageOrNameBadge from "common/GetImageOrNameBadge";

const NotifyOnTrigger = ({ rule }) => {
	const [notifyUsersIconComponent, setNotifyUsersIconComponent] = useState();
	const [notifyUsersArrlength, setNotifyUsersArrlength] = useState(0);

	useEffect(() => {
		setNotifyUsersArrlength(rule?.notify_users?.length);
	}, [rule]);

	useEffect(() => {
		if (notifyUsersArrlength > 0) {
			let user1 = rule?.notify_users[0];
			setNotifyUsersIconComponent(
				<GetImageOrNameBadge
					url={user1?.profile_img}
					name={user1?.user_name}
					height={15}
				/>
			);
		}
	}, [notifyUsersArrlength]);

	return (
		<>
			{notifyUsersArrlength >= 1 ? (
				<OverlayTrigger
					placement="top"
					overlay={
						<Tooltip>
							<div>
								{rule?.notify_users.map((el) => {
									return <div>{el.user_name}</div>;
								})}
							</div>
						</Tooltip>
					}
				>
					<div className="d-flex">
						{notifyUsersIconComponent}
						{notifyUsersArrlength > 1 &&
							`+ ${notifyUsersArrlength - 1}`}
					</div>
				</OverlayTrigger>
			) : (
				"N/A"
			)}
		</>
	);
};

export default NotifyOnTrigger;
