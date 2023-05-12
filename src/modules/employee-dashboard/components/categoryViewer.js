import React, { useEffect, useState } from "react";
import { getTopCategories } from "services/api/employeeDashboard";
import rightarrow from "assets/users/rightarrow.svg";

import "./overview.css";
import { SmallAppCard } from "./secondaryAppCard";
import ContentLoader from "react-content-loader";
import { useSelector } from "react-redux";
import ShowMoreGrid from "common/ShowMoreGrid";
import { TriggerIssue } from "utils/sentry";

export function CategoryWithApps({ showSidebar, category, show, setDefaultCategory }) {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState();
	const [listOfApps, setListOfApps] = useState([]);
	const { userInfo } = useSelector((state) => state);

	useEffect(() => {
		if (loading && showSidebar) {
			fetchTopCategories();
		} else {
			setLoading(false);
			setListOfApps(category.applications);
		}
	}, [category]);

	const fetchTopCategories = () => {
		setLoading(true);
		getTopCategories(userInfo?.user_id)
			.then((res) => {
				setData(res.data);
				setDefaultCategory(res.data?.[0])
				setLoading(false);
				if (res?.data?.length) {
					setSelectedCategory(res?.data?.[0].category_id);
					setListOfApps(res?.data?.[0].applications);
				}
			})
			.catch((err) => {
				TriggerIssue("Error in fetching top categories", err);
				setLoading(false);
			});
	};

	const onCategoryChange = (id) => {
		setSelectedCategory(id);
		let tempObj = data.find((el) => el.category_id === id);
		setListOfApps(tempObj.applications);
	};
	return (
		<>
			<div className="font-16 mt-5 black-1">
				{!showSidebar
					? `${category.category_name} Apps`
					: "Top Categories"}
			</div>
			{loading ? (
				<div className="d-flex" style={{ paddingTop: "20px" }}>
					{showSidebar && (
						<div
							className="d-flex flex-column"
							style={{ width: "fit-content" }}
						>
							{Array(5)
								.fill({ dummy: "Hello" })
								.map((el) => (
									<div
										className={`d-flex align-items-center employee-category-card font-12 `}
										style={{
											backgroundColor:
												"rgba(235, 235, 235, 0.35)",
										}}
									>
										<ContentLoader
											width={91}
											height={10}
											backgroundColor={"#DDDDDD"}
										>
											<rect
												width="91"
												height="10"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								))}
						</div>
					)}
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
					<div className="d-flex" style={{ paddingTop: "20px" }}>
						{showSidebar && (
							<div
								className="d-flex flex-column"
								style={{ width: "fit-content" }}
							>
								{Array.isArray(data) &&
									data.length > 0 &&
									data.map((el, index) => {
										if (index < 5) {
											return (
												<div
													className={`d-flex align-items-center employee-category-card font-12 ${
														selectedCategory ===
														el.category_id
															? "employee-category-card-active black-1 bold-600"
															: "grey-1"
													}`}
													onClick={() => {
														onCategoryChange(
															el.category_id
														);
													}}
												>
													{el.category_name}
													<img
														src={rightarrow}
														className="ml-auto"
													></img>
												</div>
											);
										}
									})}
							</div>
						)}
						<div
							className="d-flex flex-wrap align-items-center ml-2"
							style={{ height: "fit-content" }}
						>
							
							{
								<ShowMoreGrid
									data={listOfApps}
									component={
										<SmallAppCard
											onAddToFav={fetchTopCategories}
											app={{}}
										/>
									}
									dataKey="app"
									limit={9}
									showMoreComponent={
										<div className="employee-category-app-card font-14 justify-content-center">
											Show More
										</div>
									}
									showLessComponent={
										<div className="employee-category-app-card font-14 justify-content-center">
											Show Less
										</div>
									}
								/>
							}
						</div>
					</div>
				</>
			)}
		</>
	);
}
