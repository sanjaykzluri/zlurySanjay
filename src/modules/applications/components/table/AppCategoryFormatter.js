import React, { useRef, useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import useOutsideClick from "../../../../common/OutsideClick/OutsideClick";
import { ChangeCategory } from "../../../../components/Applications/Overview/ChangeCatgeory";
import subcategoryarrow from "../../../../assets/applications/subcategoryarrow.svg";

export function CategoryFormatter({ data, handleRefresh, isNotActive }) {
	const ref = useRef();
	const [additionalCategoriesOpen, setAdditionalCategoriesOpen] =
		useState(false);

	const renderCategories = (el, condition = false) => {
		return (
			<>
				<div
					className="allapps-categories-subcategories-cont"
					style={condition ? { marginBottom: "7px" } : {}}
					onClick={(e) => {
						e.stopPropagation();
						e.preventDefault();
					}}
				>
					<OverlayTrigger
						placement="top"
						overlay={<Tooltip>{el.category_name || ""}</Tooltip>}
					>
						<div
							className="subcategory__truncate"
							style={{
								textTransform: "uppercase",
								color: "#717171",
								fontSize: "8px",
							}}
						>
							{el.category_name}
						</div>
					</OverlayTrigger>
					<div className="d-flex">
						<img
							src={subcategoryarrow}
							style={{ position: "relative", top: "-4px" }}
						></img>
						{data.app_is_custom ? (
							<ChangeCategory
								categoryId={el.sub_category_id || ""}
								categoryName={el.sub_category_name || ""}
								operation={"replace"}
								field_name={"sub_category"}
								subCategoryPresent={true}
								idFromTable={data.app_id || data._id}
								handleRefresh={handleRefresh}
							/>
						) : (
							<div className="font-weight-normal ml-1">
								<OverlayTrigger
									placement="top"
									overlay={
										<Tooltip>
											{el.sub_category_name || ""}
										</Tooltip>
									}
								>
									<div
										className="subcategory__truncate"
										style={{
											fontSize: "10px",
										}}
									>
										{el.sub_category_name || ""}
									</div>
								</OverlayTrigger>
							</div>
						)}
					</div>
				</div>
			</>
		);
	};

	useOutsideClick(ref, () => {
		if (additionalCategoriesOpen) setAdditionalCategoriesOpen(false);
	});

	return (
		<>
			{data.app_categories &&
			data.app_categories.length > 0 &&
			Array.isArray(data.app_sub_categories) &&
			data.app_sub_categories.length > 0 ? (
				<>
					<div className="d-flex">
						<div className={` ${isNotActive ? "o-6" : ""}`}>
							{data.app_sub_categories
								.slice(0, 1)
								.map((el) => renderCategories(el))}
						</div>

						{data.app_sub_categories.length > 1 && (
							<div style={{ position: "relative" }}>
								<div
									className={`d-flex flex-center cursor-pointer ${
										isNotActive ? "o-6" : ""
									}`}
									style={{
										width: "25px",
										background: "rgba(235, 235, 235, 0.6)",
										borderRadius: " 4px",
										marginLeft: "10px",
										height: "100%",
									}}
									onClick={(e) => {
										e.stopPropagation();
										e.preventDefault();
										setAdditionalCategoriesOpen(true);
									}}
								>
									<span
										style={{
											fontSize: 8,
											color: "#717171",
										}}
									>
										+ {data.app_sub_categories.length - 1}
									</span>
								</div>
								{additionalCategoriesOpen && (
									<>
										<div
											className="additionalcategories__dropdowncont"
											ref={(el) => {
												if (el) {
													ref.current = el;
												}
											}}
											style={
												data.app_sub_categories.length >
												4
													? {
															paddingBottom:
																"7px",
													  }
													: { cursor: "default" }
											}
										>
											<div
												className="d-flex flex-column mr-1"
												style={{
													marginTop: "9px",
													maxHeight: "210px",
													width: "100%",
													overflowY: "auto",
													overflowX: "none",
												}}
											>
												{data.app_sub_categories
													.slice(1)
													.map((el) =>
														renderCategories(
															el,
															additionalCategoriesOpen
														)
													)}
											</div>
										</div>
									</>
								)}
							</div>
						)}
					</div>
				</>
			) : (
				<ChangeCategory
					isNotActive={isNotActive}
					idFromTable={data.app_id || data._id}
					operation={"add"}
					field_name={"sub_category"}
					subCategoryPresent={true}
					handleRefresh={handleRefresh}
				/>
			)}
		</>
	);
}
