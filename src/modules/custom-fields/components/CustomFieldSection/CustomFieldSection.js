import React from "react";
import { CustomField } from "../../model/model";
import { CustomFieldCard } from "../CustomFieldCard/CustomFieldCard";
import "./CustomFieldSection.css";
import { useDispatch, useSelector } from "react-redux";
export function CustomFieldSection(props) {
	const list =
		Array.isArray(props.fields) &&
		props.fields.map((field, index) => (
			<CustomFieldCard
				key={index}
				field={field}
				onEdit={(field) => props.onEdit(field)}
			/>
		));
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const clickedOnAddNewCustomField = () => {
		props.onEdit(new CustomField({ entity_type: props.title }));
		//Segment
		window.analytics.track("Clicked on Add New Custom Field", {
			currentCategory: "Settings",
			currentPageName: "Custom Fields",
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};
	return (
		<div className="cf-section pb-4 mb-4">
			<div className="cf__section-header mb-3">
				<h4 className="z__header-ternary text-capitalize d-flex bold-600 ">
					{props.title === "licensecontracts"
						? "Contracts"
						: props.title}
				</h4>
			</div>
			<div className="cf__sections-body d-flex flex-row flex-wrap">
				{list}
				<div
					onClick={clickedOnAddNewCustomField}
					className="cf-card  mb-3 p-2 pl-3 pr-3 position-relative pointer"
					style={{ background: "#fff" }}
				>
					<div className="cf-card__add">
						<p className="z__header-quaternary text-capitalize m-0">
							<span
								className="mr-1 font-18 position-relative"
								style={{ top: 2 }}
							>
								+
							</span>
							Add New Field
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
