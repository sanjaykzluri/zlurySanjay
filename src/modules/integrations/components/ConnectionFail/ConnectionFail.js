import React from "react";
import exclamation from "../../../../assets/icons/exclamation.svg";
import { Button } from "../../../../UIComponents/Button/Button";
import "./ConnectionFail.css";

export function ConnectionFail(props) {
	return (
		<div className={"text-center " + props.className}>
			<img className="mb-3" width={46} src={exclamation} />
			<p className="mb-3 font-18 bold-600 black-1">
				An error occured while trying to connect
			</p>
			<p className="mb-3 font-14 bold-400 black-1">
				Would you like to retry?
			</p>
			<Button
				className="mb-3"
				onClick={(e) => {
					props.onClose();
				}}
			>
				{
					props.isRetryOnClose ?
						"Retry"
						:
						"Close"
				}
			</Button>
		</div>
	);
}
