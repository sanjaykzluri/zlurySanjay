import React, { useRef, useState } from "react";
import { OverlayTrigger, Popover, Spinner } from "react-bootstrap";
import arrowdropdown from "assets/arrowdropdown.svg";
import useOutsideClick from "common/OutsideClick/OutsideClick";

export default function DropDownButton({
	setValue,
	updateStep,
	label,
	options = [],
}) {
	const ref = useRef(null);
	const [show, setShow] = useState(false);
	const toggleShow = () => setShow((s) => !s);
	const handleChange = (value) => {
		setShow(false);
		setValue(value);
		updateStep();
	};
	useOutsideClick(ref, () => {
		setShow(false);
	});

	const popover = (
		<Popover id="popover-basic">
			<div className="health__card__dropdown__options">
				{options.map((option) => (
					<div
						className="health__card__dropdown__option"
						onClick={() => handleChange(option?.value)}
					>
						<div className="z-select-option">{option.name}</div>
					</div>
				))}
			</div>
		</Popover>
	);

	return (
		<div ref={ref}>
			<OverlayTrigger
				show={show}
				onToggle={toggleShow}
				trigger="click"
				placement="top"
				overlay={popover}
			>
				<div className="card__action_button d-flex align-items-center cursor-pointer">
					{label}
					<span className="m-2">
						<img src={arrowdropdown} />
					</span>
				</div>
			</OverlayTrigger>
		</div>
	);
}
