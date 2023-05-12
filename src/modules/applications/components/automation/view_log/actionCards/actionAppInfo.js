import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import { NameBadge } from "common/NameBadge";
import React from "react";
export const ActionAppInfo = ({ actionLog }) => {
	return (
		<div className="mt-2 d-flex flex-row align-items-center">
			{actionLog?.group_state ? (
				<>
					<div className="position-relative d-flex">
						{actionLog?.group_state &&
							actionLog?.apps &&
							actionLog?.apps.length > 0 &&
							actionLog.apps
								.map((app, index) => (
									<GetImageOrNameBadge
										key={index}
										name={app.app_name}
										url={app.app_logo}
										width={20}
										height={20}
										imageClassName={
											index === 0
												? " mr-n2 z-index-20  img-circle white-bg"
												: "border-radius-4 object-contain avatar"
										}
										nameClassName={
											index === 0
												? " mr-n2 z-index-20  img-circle white-bg"
												: "img-circle avatar  mr-n2 z-index-20"
										}
									/>
								))
								.slice(0, 2)}
					</div>
					<p className="ml-3 font-11 text-capitalize m-0 grey text-capitalize">
						{actionLog?.apps &&
							actionLog?.apps.length > 0 &&
							actionLog?.apps
								.map((res) => res.app_name)
								.slice(0, 2)
								.join(", ")}
						<span className="ml-1 font-11 text-capitalize text-lowercase">
							{actionLog?.apps &&
								actionLog?.apps.length > 0 &&
								actionLog?.apps.length > 2 &&
								` , + ${actionLog?.apps.length - 2} more apps`}
						</span>
						<span className="font-11 text-capitalize">
							{` |  Delete account from ${
								actionLog?.apps.length
							} ${
								actionLog?.group_state === "needs_review"
									? "uncategorized"
									: actionLog?.group_state
							} apps`}
						</span>
					</p>
				</>
			) : (
				<>
					<span>
						{actionLog?.app_logo ? (
							<img
								className="mr-1"
								src={actionLog?.app_logo}
								width={20}
								height={20}
							/>
						) : (
							<NameBadge
								className="mr-1"
								name={actionLog?.app_name || ""}
								height={20}
								width={20}
								borderRadius={"50%"}
							/>
						)}
						{/* <img src={actionLog?.app_logo} width={10} height={10} /> */}
					</span>
					<span
						style={{ marginRight: actionLog?.app_name ? 3 : 0 }}
						className="font-11"
					>
						{actionLog?.app_name}
						{actionLog?.app_name && ` | `}
					</span>
					<span className="font-11">{actionLog?.action_name}</span>
				</>
			)}
		</div>
	);
};
