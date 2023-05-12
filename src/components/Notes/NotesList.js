import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Note } from "./Note";
import { AddNoteModal } from "./AddNoteModal";
import { addNewNote, deleteNote, updateNote } from "../../services/api/notes";
import { useDispatch, useSelector } from "react-redux";
import Plus from "../../assets/icons/plus.svg";
import { getValueFromLocalStorage } from "utils/localStorage";

export function NotesList(props) {
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const listSize = 2; // Number of notes to be displayed in the list
	const [showAddNoteModal, setShowAddNoteModal] = useState(false);
	const [shouldOpenEditor, setShouldOpenEditor] = useState(false);
	const [notes, setNotes] = useState([]);
	const fromSidePanel = false;
	const [update, setUpdate] = useState(false);
	useEffect(() => {
		if (props.notes && props.notes.length > 0) {
			let newNotes = props.notes.map((n) => ({
				...n,
				isEditable: false,
				isEditableInSidePanel: false,
			}));
			setNotes([...newNotes]);
		}
	}, []);

	const handleNoteAdd = (note) => {
		const userInfo = getValueFromLocalStorage("userInfo");
		let noteObj = {
			...note,
			created_by: userInfo.user_id,
			entity_type: props.entity.type,
			note_belongs_to: props.entity.id,
		};

		addNewNote(noteObj)
			.then((res) => {
				if (res.error) return;

				setNotes([res.note, ...notes]);
			})
			.catch((err) => {
				console.error(
					`Error adding new note to ${props.entity.type}:`,
					err
				);
			});
	};

	const handleNoteEdit = (noteId, note) => {
		const userInfo = getValueFromLocalStorage("userInfo");
		let noteObj = {
			...note,
			last_edited_by: userInfo.user_id,
			entity_type: props.entity.type,
			note_belongs_to: props.entity.id,
		};

		updateNote(noteId, noteObj)
			.then((res) => {
				if (res.error) return;

				let index = notes.findIndex((n) => n._id === noteId);
				let notesArray = [...notes];
				notesArray.splice(index, 1);
				notesArray.unshift(res.note);

				setNotes(notesArray);
			})
			.catch((err) => {
				console.error(`Error updating ${props.entity.type} note:`, err);
			});
	};

	const handleNoteDelete = (noteId) => {
		let noteObj = {
			entity_type: props.entity.type,
			note_belongs_to: props.entity.id,
		};

		deleteNote(noteId, noteObj)
			.then((res) => {
				if (res.error) {
					console.error(
						`Error deleting ${props.entity.type} note:`,
						res.error
					);
					return;
				}

				let notesArray = notes.filter((n) => n._id !== noteId);
				setNotes(notesArray);
			})
			.catch((err) => {
				console.error(`Error deleting ${props.entity.type} note:`, err);
			});
	};

	const handleModalClose = () => {
		setShowAddNoteModal(false);
		setShouldOpenEditor(false);
	};

	function makeNoteEditable(noteId, fromSidePanel) {
		notes.map((note) => {
			if (note?._id === noteId) {
				fromSidePanel
					? (note.isEditableInSidePanel =
							!note?.isEditableInSidePanel)
					: (note.isEditable = !note?.isEditable);
			} else {
				fromSidePanel
					? (note.isEditableInSidePanel = false)
					: (note.isEditable = false);
			}
			setShouldOpenEditor(!shouldOpenEditor);
		});
		setNotes([...notes]);
	}

	function updateCurrentNote(note, index) {
		const notesObj = notes;
		notesObj[index] = note;
		setNotes(notesObj);
		setUpdate(!update);
	}
	const commonSegmentTrack = (message, category) => {
		//Segment Implementation
		window.analytics.track(message, {
			currentCategory: `${category}s`,
			currentPageName: `${category}-Overview`,
			[`${category}_name`]: props.entity?.name,
			[`${category}_id`]: props.entity?.id,
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};
	function clickOnAddNotesApps() {
		commonSegmentTrack("Clicked on Add Note", "Application");
		setShouldOpenEditor(true);
		setShowAddNoteModal(true);
	}
	function clickonAddNotesUsers() {
		commonSegmentTrack("Clicked on Add Note", "User");
		setShouldOpenEditor(true);
		setShowAddNoteModal(true);
	}
	function clickOnAddNotesDept() {
		commonSegmentTrack("Clicked on Add Note", "Department");
		setShouldOpenEditor(true);
		setShowAddNoteModal(true);
	}
	function clickOnAddNotesVendor() {
		commonSegmentTrack("Clicked on Add Note", "Vendor");
		setShouldOpenEditor(true);
		setShowAddNoteModal(true);
	}
	return (
		<div className={props.className}>
			<div className="d-flex justify-content-between mb-3">
				<div className="font-16">{`Notes (${notes?.length})`}</div>
				<div
					className="z-text-primary cursor-pointer"
					style={{ fontSize: 13 }}
					onClick={
						props.entity.type === "application"
							? clickOnAddNotesApps
							: props.entity.type === "user"
							? clickonAddNotesUsers
							: props.entity.type === "department"
							? clickOnAddNotesDept
							: clickOnAddNotesVendor
					}
				>
					+ Add Note
				</div>
			</div>
			<div className="d-flex" key={update}>
				{notes && notes.length > 0 ? (
					<>
						{notes.slice(0, listSize).map((note, index) => (
							<Note
								key={index}
								index={index}
								className="note--width mr-3"
								note={note}
								onEdit={handleNoteEdit}
								onDelete={handleNoteDelete}
								makeNoteEditable={makeNoteEditable}
								isEditing={note && note.isEditable}
								isInSidePanel={fromSidePanel}
								entity={props.entity}
								updateNote={(note, index) =>
									updateCurrentNote(note, index)
								}
							/>
						))}
						{notes.length > listSize && (
							<div
								className="flex-center cursor-pointer border rounded-lg"
								style={{ width: "25%" }}
								onClick={() => setShowAddNoteModal(true)}
							>
								<img src={Plus} width="20" />
								<span style={{ fontSize: 14 }}>
									{notes.length - listSize} more
								</span>
							</div>
						)}
					</>
				) : (
					<div
						className="text-center border-dashed p-5 cursor-pointer"
						style={{ width: "35%" }}
						onClick={
							props.entity.type === "application"
								? clickOnAddNotesApps
								: props.entity.type === "user"
								? clickonAddNotesUsers
								: props.entity.type === "department"
								? clickOnAddNotesDept
								: clickOnAddNotesVendor
						}
					>
						<img src={Plus} width="25" />
						<div className="mt-1" style={{ fontSize: 13 }}>
							Add Note
						</div>
					</div>
				)}
			</div>
			{showAddNoteModal && (
				<AddNoteModal
					show={showAddNoteModal}
					notes={notes}
					entity={props.entity}
					onHide={handleModalClose}
					editorActive={shouldOpenEditor}
					handleNoteAdd={handleNoteAdd}
					handleNoteEdit={handleNoteEdit}
					handleNoteDelete={handleNoteDelete}
					makeNoteEditable={makeNoteEditable}
					setNotes={(notes) => {
						setNotes(notes);
						setUpdate(!update);
					}}
				/>
			)}
		</div>
	);
}

NotesList.propTypes = {
	notes: PropTypes.array,
	entity: PropTypes.objectOf(
		PropTypes.shape({
			name: PropTypes.string,
			type: PropTypes.string,
			image: PropTypes.string,
		})
	),
};
