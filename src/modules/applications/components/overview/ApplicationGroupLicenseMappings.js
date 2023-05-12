import React from "react";
import deleteIcon from "assets/deleteIcon.svg";
import { searchLicensesV2 } from "services/api/search";
import { AsyncTypeahead } from "common/Typeahead/AsyncTypeahead";
import { getGroupsList } from "modules/Groups/service/Groups.api";
import { getSearchReqObj } from "modules/v2InfiniteTable/utils/v2infiniteTableUtil";

export default function ApplicationGroupLicenseMappings({
	appId,
	mappings,
	setMappings,
}) {
	const handleMappingGroupEdit = (group, index) => {
		const temp = [...mappings];
		temp[index].group_id = {};
		temp[index].group_id._id = group.group_id;
		temp[index].group_id.name = group.group_name;
		setMappings([...temp]);
	};

	const handleMappingLicenseEdit = (license, index) => {
		const temp = [...mappings];
		temp[index].license_id = {};
		if (license.license_id) {
			temp[index].license_id._id = license.license_id;
			temp[index].license_id.name = license.license_name;
		} else {
			temp[index].license_id._id = null;
			temp[index].license_id.name = null;
			temp[index].license_name = license.license_name;
		}
		setMappings([...temp]);
	};

	const addMapping = () => {
		const temp = [...mappings];
		temp.push({
			license_id: {},
			group_id: {},
			license_name: null,
		});
		setMappings([...temp]);
	};

	const deleteMapping = (index) => {
		let temp = [...mappings];
		temp.splice(index, 1);
		setMappings(temp);
	};

	return (
		<>
			<div className="d-flex flex-column" style={{ marginTop: "5px" }}>
				{Array.isArray(mappings) &&
					mappings.map((mapping, index) => (
						<div
							className="d-flex"
							style={{ gap: "10px" }}
							key={index}
						>
							<AsyncTypeahead
								fetchFn={(query, cancelToken) =>
									getGroupsList(
										{
											filter_by: [
												getSearchReqObj(
													query,
													"group_name",
													"Group Name"
												),
											],
											columns: [],
											sort_by: [],
										},
										0,
										30,
										cancelToken
									)
								}
								keyFields={{
									id: "group_id",
									value: "group_name",
								}}
								allowFewSpecialCharacters={true}
								defaultValue={mapping.group_id.name}
								onSelect={(selection) =>
									handleMappingGroupEdit(selection, index)
								}
								placeholder="Enter Group Name"
								style={{ width: "250px", marginBottom: "5px" }}
							/>
							<AsyncTypeahead
								fetchFn={(query, cancelToken) =>
									searchLicensesV2(
										{
											filter_by: [
												getSearchReqObj(
													query,
													"license_name",
													"License Name"
												),
												{
													field_id: "app_id",
													field_name:
														"Application Id",
													field_values: [appId],
													filter_type: "objectId",
													negative: false,
													is_custom: false,
												},
												{
													field_id:
														"source_is_org_integration",
													field_name:
														"Source is org integration?",
													field_values: false,
													filter_type: "boolean",
													negative: false,
													is_custom: false,
												},
												{
													field_id: "archive",
													field_name: "Archive",
													field_values: false,
													filter_type: "boolean",
													negative: false,
													is_custom: false,
												},
											],
											columns: [],
											sort_by: [],
										},
										cancelToken
									)
								}
								keyFields={{
									id: "license_id",
									value: "license_name",
								}}
								allowFewSpecialCharacters={true}
								defaultValue={
									mapping.license_id?.name ||
									mapping.license_name
								}
								onSelect={(selection) =>
									handleMappingLicenseEdit(selection, index)
								}
								onChange={(value) => {
									handleMappingLicenseEdit(
										{ license_name: value },
										index
									);
								}}
								hideNoResultsText={true}
								placeholder="Enter License Name"
								style={{ width: "250px", marginBottom: "5px" }}
							/>
							<img
								src={deleteIcon}
								className="cursor-pointer"
								onClick={() => deleteMapping(index)}
							/>
						</div>
					))}
			</div>
			<div
				className="glow_blue cursor-pointer font-12"
				style={{ width: "fit-content" }}
				onClick={() => addMapping()}
			>
				+ Add license group mapping
			</div>
		</>
	);
}
