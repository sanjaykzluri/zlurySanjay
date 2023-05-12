import React from "react";
import "./beta.css";

export function Beta({ text, style = {} }) {
	return (
		<>
			<span>
				{text}
				<span className="beta_text" style={style}>
					BETA
				</span>
			</span>
		</>
	);
}
