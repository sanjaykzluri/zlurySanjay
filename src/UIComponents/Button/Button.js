import React from "react";
import "./Button.css";
import edit from "../../assets/icons/edit.svg";

export const BUTTON_TYPE = {
	EDIT: "edit",
	DASHED: "dashed",
	LINK: "link",
	NORMAL: "normal",
	BORDER: "border",
	REVERSE: "reverse",
};

export function Button(props) {
	return (
		<button
			type={props.btnType}
			style={props.style}
			onMouseEnter={props.onMouseEnter && props.onMouseEnter}
			onMouseLeave={props.onMouseLeave && props.onMouseLeave}
			className={`${
				props.type
					? `z__button ${props.className} ${props.type}`
					: `z__button ${props.className}`
			}`}
			disabled={props.disabled}
			onClick={(e) => {
				props.onClick && props.onClick(e);
			}}
		>
			{props.children}
			{props.type === BUTTON_TYPE.EDIT && (
				<img
					className="z__button-edit ml-2"
					src={edit}
					style={props.editBtnStyle}
				/>
			)}
		</button>
	);
}
