import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "./notes.scss";
import dayjs from "dayjs";
import { NameBadge } from "../../common/NameBadge";
import { Dropdown } from "react-bootstrap";
import { NoteEditor } from "./NoteEditor";

import Ellipsis from "../../assets/icons/ellipsis-v.svg";
import { Reminder } from "../../modules/notes/containers/reminder/Reminder";
import { unescape } from "../../utils/common";

const ellipsis = React.forwardRef(({ children, onClick }, ref) => (
	<a
		className="cursor-pointer"
		ref={ref}
		onClick={(e) => {
			e.preventDefault();
			onClick(e);
		}}
	>
		<img src={Ellipsis} width="12" />
	</a>
));

export function Note(props) {
	const editedByUser = props.note?.last_edited_by || props.note?.created_by;
	const [note, setNote] = useState();
	const reminderPositionCss = {
		right: "1px",
		top: "-3px",
	};

	useEffect(() => {
		setNote(props.note);
	}, [props.note]);

	function update(note) {
		setNote(note);
		if (props.isInSidePanel) {
			props.updateNotes(note, props.index);
		} else {
			props.updateNote(note, props.index);
		}
	}

	return (
		<>
			{!props.isEditing ? (
				<div
					className={"note" + " " + props.className}
					style={{
						backgroundColor: props.note?.color,
						maxWidth: "380px",
					}}
				>
					<div className="note-content">{props.note?.text}</div>
					<div className="note-footer d-flex border-top">
						<div
							style={{ flexGrow: 1 }}
							className="position-relative"
						>
							Last edited on&nbsp;
							{dayjs(props.note?.last_modified_at).format(
								"D MMM YYYY"
							)}
							{editedByUser ? " by " : ""}
							{props.note?.created_by?.profile_img && (
								<img
									src={unescape(
										props.note?.created_by?.profile_img
									)}
									width="14"
									className="mr-1"
									style={{ borderRadius: "50%" }}
								/>
							)}
							{editedByUser?.name}
							<div
								style={reminderPositionCss}
								className="position-absolute"
							>
								<Reminder
									isInSidePanel={props.isInSidePanel}
									entity={props.entity}
									note={note}
									updateNotes={props.updateNotes}
									update={(note) => update(note)}
								/>
							</div>
						</div>
						<Dropdown>
							<Dropdown.Toggle as={ellipsis} />

							<Dropdown.Menu className="notes-menu">
								<Dropdown.Item
									onClick={() =>
										props.makeNoteEditable(
											props.note?._id,
											props.isInSidePanel
										)
									}
								>
									Edit Note
								</Dropdown.Item>
								<hr className="mx-3 my-0" />
								<Dropdown.Item
									onClick={() =>
										props.onDelete(props.note?._id)
									}
								>
									Delete Note
								</Dropdown.Item>
							</Dropdown.Menu>
						</Dropdown>
					</div>
				</div>
			) : (
				<NoteEditor
					className={props.className}
					note={props.note}
					cancellable={true}
					collapsible={false}
					onSave={(editedNote) => {
						props.onEdit(props.note?._id, editedNote);
						props.makeNoteEditable(
							props.note?._id,
							props.isInSidePanel
						);
					}}
					onCancel={() =>
						props.makeNoteEditable(
							props.note?._id,
							props.isInSidePanel
						)
					}
				/>
			)}
		</>
	);
}

Note.propTypes = {
	note: PropTypes.object.isRequired,
	className: PropTypes.string,
	onEdit: PropTypes.func.isRequired,
	onDelete: PropTypes.func.isRequired,
};

Note.defaultProps = {
	className: "",
};
