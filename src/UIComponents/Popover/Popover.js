import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "./Popover.css";
import { useOutsideClickListener } from "../../utils/clickListenerHook";

export function Popover(props) {
	const ref = useRef(null);

	/**
	 *  Function to execute on popver hide.
	 */
	const onClose = () => {
		props.onClose && props.onClose();
	};

	const refs =
		Array.isArray(props.refs) && ref ? props.refs.concat(ref) : null;

	useOutsideClickListener(refs || ref, onClose);

	return (
		<>
			{props.show && (
				<div
					className={
						props.className
							? `z__popover ${props.align} ${props.className} `
							: `z__popover ${props.align}`
					}
					ref={ref}
					style={{ ...props.style }}
				>
					{props.header && (
						<div className="z__popover--header">{props.header}</div>
					)}
					{props.children}
				</div>
			)}
		</>
	);
}

Popover.propTypes = {
	show: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	classNames: PropTypes.string,
	align: PropTypes.string,
};

Popover.defaultProps = {
	show: false,
	align: "left",
	style: {},
};
