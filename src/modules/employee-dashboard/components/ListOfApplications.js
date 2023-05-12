import React, { useEffect, useState } from "react";
import { getEmployeeMostUsedApps } from "services/api/employeeDashboard";
import noAppsFound from "assets/employee/noAppsFound.png";
import "./overview.css";
import { SmallAppCard } from "./secondaryAppCard";

import { useSelector } from "react-redux";
import { TriggerIssue } from "utils/sentry";
export function ListOfApplications() {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState([]);
	const { userInfo } = useSelector((state) => state);

	useEffect(() => {
		if (loading) {
			fetchEmployeeMostUsedApps();
		}
	}, []);

	const fetchEmployeeMostUsedApps = () => {
		setLoading(true);
		getEmployeeMostUsedApps(userInfo?.user_id)
			.then((res) => {
				setData(res.data);
				setLoading(false);
				if (res?.data?.length) {
					setData(res.data);
				}
			})
			.catch((err) => {
				TriggerIssue("Error in fetching employee most used apps", err);
				setLoading(false);
			});
	};

	return (
		<>
			{loading ? (
				<div className="d-flex" style={{ paddingTop: "20px" }}>
					<div
						className="d-flex flex-wrap align-items-center ml-2"
						style={{ height: "fit-content" }}
					>
						{Array(8)
							.fill({ dummy: "Hello" })
							.map((el) => (
								<SmallAppCard app={el} loading={loading} />
							))}
					</div>
				</div>
			) : (
				<>
					<div
						className="d-flex w-100"
						style={{ paddingTop: "20px" }}
					>
						{Array.isArray(data) && data.length > 0 ? (
							<div
								className="d-flex flex-wrap align-items-center ml-2"
								style={{ height: "fit-content" }}
							>
								{data.map((el) => (
									<SmallAppCard
										app={el}
										onAddToFav={fetchEmployeeMostUsedApps}
									/>
								))}
							</div>
						) : (
							<>
								<div className="d-flex flex-column align-items-center w-100 mt-5">
									<img
										src={noAppsFound}
										width={200}
										height={133}
									/>
									<div className="font-16 bold-500">
										No Apps Found
									</div>
								</div>
							</>
						)}
					</div>
				</>
			)}
		</>
	);
}
