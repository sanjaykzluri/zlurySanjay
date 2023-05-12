import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	addCustomField,
	deleteCustomField,
	editCustomField,
	getAllCustomField,
} from "../../redux/custom-field";
import { Modal } from "../../../../UIComponents/Modal/Modal";
import "./CustomFields.css";
import { AddEditCustomField } from "../../components/AddEditCustomField/AddEditCustomField";
import { CustomFieldSection } from "../../components/CustomFieldSection/CustomFieldSection";
import { CustomFieldLoader } from "../../components/CustomFieldLoader/CustomFieldLoader";
import RestrictedContent from "../../../../common/restrictions/RestrictedContent";
import { ENTITIES } from "../../../../constants";
import { clearPropertyFileCache } from "modules/v2InfiniteTable/redux/v2infinite-action";

export function CustomFields(props) {
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const data = useSelector((state) => state.customFields);
	const [isLoading, setIsLoading] = useState(true);
	const dispatch = useDispatch();
	const [editField, setEditField] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const onEditField = (field) => {
		setShowModal(true);
		setEditField(field);
	};

	useEffect(() => {
		//Segment Implementation
		window.analytics.page("Settings", "Custom Fields", {
			orgId: orgId || "",
			orgName: orgName || "",
		});
	}, []);

	useEffect(() => {
		if (!Object.keys(data).length) {
			dispatch(getAllCustomField());
		} else {
			setIsLoading(false);
			setShowModal(false);
		}
	}, [data]);

	return (
		<>
			<div className="custom-fields__container pt-4 pl-5 pr-5">
				<div className="custom-fields__header mb-4">
					<h3 className="font-18 black-1  bold-normal">
						{" "}
						Custom Fields
					</h3>
				</div>
				<RestrictedContent entity={ENTITIES.CUSTOM_FIELDS}>
					{!isLoading && (
						<div className="custom-fields__body">
							{Object.keys(data)
								.reverse()
								.map(
									(res, index) =>
										//removed Transactions from custom fields page as required. Remove the check later if required.
										res !== "transactions" &&
										res !== "isCustomFieldRequested" && (
											<CustomFieldSection
												key={index}
												title={res}
												fields={data[res]}
												onEdit={(field) => {
													onEditField(field);
												}}
											/>
										)
								)}
						</div>
					)}
					{isLoading && <CustomFieldLoader />}
				</RestrictedContent>
			</div>
			{showModal && (
				<Modal
					dialogClassName="cf__edit-modal"
					onClose={() => {
						setShowModal(false);
					}}
					show={showModal}
					title={
						editField?.name
							? `Edit ${editField.name}`
							: `Add Custom Field to ${
									editField?.of === "licensecontracts"
										? "Contracts"
										: editField?.of
										? editField.of.charAt(0).toUpperCase() +
										  editField.of.slice(1)
										: ""
							  }`
					}
				>
					<AddEditCustomField
						customFields={data}
						field={editField}
						onAddEditField={(field) => {
							if (field.entity === "contracts") {
								dispatch(clearPropertyFileCache("contracts"));
								dispatch(
									clearPropertyFileCache("subscriptions")
								);
								dispatch(clearPropertyFileCache("perpetuals"));
							} else {
								dispatch(clearPropertyFileCache(field.entity));
							}
							!field._id
								? dispatch(addCustomField(field))
								: dispatch(editCustomField(field));
						}}
						onDeleteField={(field) => {
							if (field.entity === "contracts") {
								dispatch(clearPropertyFileCache("contracts"));
								dispatch(
									clearPropertyFileCache("subscriptions")
								);
								dispatch(clearPropertyFileCache("perpetuals"));
							} else {
								dispatch(clearPropertyFileCache(field.entity));
							}
							dispatch(deleteCustomField(field));
						}}
						onClose={() => {
							setShowModal(false);
						}}
					/>
				</Modal>
			)}
		</>
	);
}
