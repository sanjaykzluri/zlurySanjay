import React, { useState } from "react";
import showPassword from "../assets/showPassword.svg";
import hidePassword from "../assets/hidePassword.svg";

export default function PasswordInputField(props) {
	const { placeholder, value, onChange } = props;
	const [inputType, setInputType] = useState("password");

	const handleShowHidePassword = () => {
		inputType === "password"
			? setInputType("text")
			: setInputType("password");
	};

	return (
		<div
			className="position-relative border-1 border-radius-4"
			style={{
				height: "36px",
				borderColor: "#dddddd !important",
			}}
		>
			<input
				placeholder={placeholder}
				className="pl-2 border-0 password-field-text-input"
				type={inputType}
				value={value}
				onChange={onChange}
			/>
			<img
				src={inputType === "password" ? showPassword : hidePassword}
				width={20}
				height={20}
				className="password-field-show-hide-btn"
				onClick={handleShowHidePassword}
			/>
		</div>
	);
}
