import React, { useEffect } from "react";
import edit from "assets/icons/edit.svg";
import borderdedit from "assets/workflow/bordered-edit.svg";
import { CreatePlaybook } from "./appPlaybooks/playbooks/createPlaybook";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import UnpublishPlaybookModal from "modules/workflow/components/UnpublishPlaybookModal/UnpublishPlaybookModal";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { openModal } from "reducers/modal.reducer";

const EditPlaybookCell = ({ handleRefresh, playbook, folderType }) => {
	const dispatch = useDispatch();
	const [showCreatePlaybook, setShowCreatePlaybook] = useState(false);
	const [showUnpublishPlaybookModal, setShowUnpublishPlaybookModal] =
		useState(false);

	useEffect(() => {
		if (showCreatePlaybook)
			dispatch(
				openModal("createPlaybook", {
					handleRefreshTable: handleRefresh,
					onCloseModal: () => setShowCreatePlaybook(false),
					folderType: folderType,
					template: playbook,
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
						e.stopPropagation();
						e.preventDefault();
						if (playbook?.is_published) {
							setShowUnpublishPlaybookModal(true);
						} else {
							setShowCreatePlaybook(true);
						}
					}}
				/>
			</OverlayTrigger>

			{showUnpublishPlaybookModal && (
				<UnpublishPlaybookModal
					show={showUnpublishPlaybookModal}
					entity="appPlaybooks"
					onClose={() => {
						setShowUnpublishPlaybookModal(false);
						setShowCreatePlaybook(true);
					}}
					onHide={() => {
						setShowUnpublishPlaybookModal(false);
					}}
					data={playbook}
				/>
			)}
		</>
	);
};

export default EditPlaybookCell;
