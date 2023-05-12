import { trackActionSegment } from "modules/shared/utils/segment";
import React, { useEffect, useState } from "react";
import ContentLoader from "react-content-loader";
import { useSelector } from "react-redux";
import {
	getListOfCategories,
	getSingleCategoryApplications,
} from "services/api/employeeDashboard";
import "./overview.css";

export function ListOfCategories({ setActiveCategory, setCategoryView, show }) {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState([]);
	const { userInfo } = useSelector((state) => state);

	useEffect(() => {
		if (loading) {
			getListOfCategories(userInfo?.user_id).then((res) => {
				setData(res.data);
				setLoading(false);
			});
		}
	}, []);

	return (
		<>
			{show && (
				<>
					<div className="font-16 mt-5 black-1">Categories</div>
					<div
						className="d-flex flex-wrap align-items-center"
						style={{ height: "fit-content", marginTop: "20px" }}
					>
						{loading ? (
							<>
								{Array(5)
									.fill({ dummy: "Hello" })
									.map((el) => (
										<div
											className="font-12 grey cursor-pointer mb-2"
											style={{
												border: "1px solid #EBEBEB",
												height: "40px",
												width: "220px",
												marginRight: "10px",
												backgroundColor:
													"rgba(235, 235, 235, 0.35)",
											}}
										>
											<ContentLoader
												width={220}
												height={40}
												backgroundColor={"#DDDDDD"}
											>
												<rect
													width="220"
													height="40"
													rx="2"
													fill="#EBEBEB"
												/>
											</ContentLoader>
										</div>
									))}
							</>
						) : (
							Array.isArray(data) &&
							data?.length > 0 &&
							data?.map((el) => (
								<div
									className="font-12 grey d-flex align-items-center justify-content-center cursor-pointer mb-2"
									style={{
										border: "1px solid #EBEBEB",
										height: "40px",
										width: "220px",
										marginRight: "10px",
									}}
									onClick={() => {
										getSingleCategoryApplications(
											el.category_id
										).then((res) => {
											trackActionSegment(
												"Application categories viewed",
												{
													currentCategory:
														"Employee View",
													currentPageName:
														"Applications",
												}
											);
											setActiveCategory(res);
											setCategoryView(true);
										});
									}}
								>
									{el.category_name}
								</div>
							))
						)}
					</div>
				</>
			)}
		</>
	);
}
