import React, { useEffect } from "react";
import edit from "assets/icons/edit.svg";
import borderdedit from "assets/workflow/bordered-edit.svg";
import { getAppRule, resetAppRule } from "./redux/action";
import { useState } from "react";
import { CreateRule } from "./appPlaybookRules/createRule";
import { useDispatch } from "react-redux";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { openModal } from "reducers/modal.reducer";

const EditRuleCell = ({ handleRefresh, rule, app, folderType }) => {
	const dispatch = useDispatch();

	const [showEdit, setShowEdit] = useState(false);
	const [template, setTemplate] = useState("");
	const [showCreatePlaybook, setShowCreatePlaybook] = useState(false);
	const [saveRule, setSaveRule] = useState(false);

	const showEditRuleModel = (ruleId) => {
		setShowEdit(true);
		setTemplate("");
		setShowCreatePlaybook(true);
		dispatch(getAppRule(ruleId));
	};

	const closeModal = () => {
		setShowCreatePlaybook(false);
		dispatch(resetAppRule());
		setShowEdit(false);
		handleRefresh();
	};

	const showcreatePlaybookModal = () => {
		setTemplate("");
		setShowCreatePlaybook(true);
	};

	useEffect(() => {
		if (showCreatePlaybook)
			dispatch(
				openModal("createRule", {
					handleRefreshTable: handleRefresh,
					onCloseModal: closeModal,
					folderType: folderType,
					entity: "application",
					showEdit: showEdit,
					setShowEdit: setShowEdit,
					setSaveRule: setSaveRule,
					application: app,
				})
			);
	}, [showCreatePlaybook]);

	return (
		<>
			<OverlayTrigger
				placement="bottom"
				overlay={<Tooltip>{"Edit"}</Tooltip>}
			>
				<img
					className="cursor-pointer"
					src={borderdedit}
					alt=""
					onClick={(e) => {
						showEditRuleModel(rule._id);
					}}
				/>
			</OverlayTrigger>
		</>
	);
};

export default EditRuleCell;
