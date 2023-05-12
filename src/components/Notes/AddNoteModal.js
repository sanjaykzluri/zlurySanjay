import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { NameBadge } from "../../common/NameBadge";
import { Note } from "./Note";
import { useDispatch, useSelector } from "react-redux";
import Close from "../../assets/close.svg";
import NotesEmptySVG from "../../assets/notes/notes-empty.svg";
import { NoteEditor } from "./NoteEditor";
import { unescape } from "../../utils/common";
import { useAuth0 } from "@auth0/auth0-react";

export function AddNoteModal(props) {
	const { user } = useAuth0();
	const [notes, setNotes] = useState(props.notes);
	const fromSidePanel = true;
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	useEffect(() => {
		if (props.notes) {
			setNotes(props.notes);
		}
	}, [props.notes]);
	useEffect(() => {
		//Segment Implementation
		window.analytics.page(
			`${props.entity.type}`,
			`${props.entity.type}-Overview; Add-Note`,
			{
				orgId: orgId || "",
				orgName: orgName || "",
			}
		);
	}, []);
	if (!props.show) return <></>;

	function updateNotes(note, index) {
		const notesObj = notes;
		notesObj[index] = note;
		props.setNotes(notesObj);
	}

	return (
		<>
			<div className="modal-backdrop show"></div>
			<div className="notes-drawer h-100">
				<div className="d-flex flex-row align-items-center border-bottom py-4">
					<div className="m-auto">
						<div className="notes-drawer__header-title">
							Notes for &nbsp;
							{props.entity.image ? (
								<img
									src={unescape(props.entity.image)}
									width="30"
									className="border-radius-50"
								/>
							) : (
								<NameBadge
									name={props.entity.name}
									width={30}
									variant="round"
								/>
							)}
							&nbsp;&nbsp;
							{props.entity.name || ""}
						</div>
					</div>
					<img
						alt="Close"
						onClick={props.onHide}
						src={Close}
						className="cursor-pointer mr-4"
					/>
				</div>
				<div
					className="notes-drawer__content pt-3 px-4 pb-5"
					key={notes.length}
				>
					{notes && notes.length > 0 ? (
						<>
							{notes.map((note, index) => (
								<Note
									key={index}
									className="mb-3"
									note={note}
									onEdit={props.handleNoteEdit}
									onDelete={props.handleNoteDelete}
									makeNoteEditable={props.makeNoteEditable}
									isEditing={note?.isEditableInSidePanel}
									isInSidePanel={fromSidePanel}
									entity={props.entity}
									index={index}
									updateNotes={(note) =>
										updateNotes(note, index)
									}
								/>
							))}
						</>
					) : (
						<div className="notes-empty">
							<img
								src={NotesEmptySVG}
								alt="No Notes Found"
								width="300"
							/>
							<div className="mt-2">Nothing here!</div>
						</div>
					)}
				</div>
				<div className="notes-drawer__footer fixed-bottom border-top bg-white py-3">
					<img
						src={user.picture}
						className="ml-3"
						width="40"
						style={{ borderRadius: "50%" }}
					/>
					<NoteEditor
						className="w-100 mx-3"
						onSave={props.handleNoteAdd}
						expanded={props.editorActive}
					/>
				</div>
			</div>
		</>
	);
}

AddNoteModal.propTypes = {
	show: PropTypes.bool,
	notes: PropTypes.array,
	entity: PropTypes.object.isRequired,
	onHide: PropTypes.func.isRequired,
	editorActive: PropTypes.bool.isRequired,
	handleNoteAdd: PropTypes.func.isRequired,
	handleNoteEdit: PropTypes.func.isRequired,
	handleNoteDelete: PropTypes.func.isRequired,
};

AddNoteModal.defaultProps = {
	notes: [],
	editorActive: false,
};
