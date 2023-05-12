import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useOutsideClickListener } from "../../utils/clickListenerHook";
import { noteColors } from "./NoteColors"

import Check from "../../assets/icons/check.svg";

export function NoteEditor(props) {
    const defaultNoteColor = "#E3FBFF";
    const defaultNoteState = {
        text: "",
        color: defaultNoteColor,
    };

    const [note, setNote] = useState({ ...defaultNoteState });
    const [isExpanded, setIsExpanded] = useState(false);
    const noteEditorRef = useRef();

    useEffect(() => {
        if (!props.collapsible || props.expanded === true) {
            setIsExpanded(true);
        }

        if (props.note) {
            setNote({
                ...note,
                text: props.note.text,
                color: props.note.color,
            })
        }
    }, [])

    useOutsideClickListener(noteEditorRef, () => {
        if (props.collapsible) {
            setIsExpanded(false);
        }
    })

    const handleEditorClick = () => {
        if (!props.collapsible) return;
        setIsExpanded(true);
    }

    const handleNoteChange = (key, value) => {
        setNote({
            ...note,
            [key]: value,
        })
    }

    function handleSave() {
        props.onSave(note);
        handleNoteChange("text", "");
    }

    return (
        <div ref={noteEditorRef} className={`note-input-container ${props.className}`}>
            <textarea
                className="w-100 mt-1"
                placeholder="Add a Note"
                value={note.text}
                onClick={handleEditorClick}
                onChange={(e) => handleNoteChange("text", e.target.value)}
                maxLength={165}
            />
            {isExpanded && (
                <div className="d-flex flex-wrap align-items-center justify-content-between py-2 px-3">
                    <div className="d-flex">
                        {noteColors.map((colorObj) => (
                            <div
                                style={{
                                    backgroundColor: colorObj.color,
                                    borderColor: colorObj.border,
                                }}
                                className="color-circle flex-center mr-2"
                                onClick={() => handleNoteChange("color", colorObj.color)}
                            >
                                {colorObj.color === note.color && (
                                    <img src={Check} width="12" />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-2">
                        {props.cancellable && (
                            <button
                                className="btn z-btn-outline-primary mr-2"
                                onClick={props.onCancel}
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            className="btn z-btn-primary px-4"
                            disabled={!note.text?.trim()}
                            onClick={handleSave}
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

NoteEditor.propTypes = {
    note: PropTypes.object,
    className: PropTypes.string,
    collapsible: PropTypes.bool.isRequired,
    cancellable: PropTypes.bool.isRequired,
    expanded: PropTypes.bool,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
}

NoteEditor.defaultProps = {
    className: "",
    collapsible: true,
    cancellable: false,
    expanded: false,
}