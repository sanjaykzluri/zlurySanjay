import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import useOutsideClick from "common/OutsideClick/OutsideClick";
import downArrow from "assets/down_arrow.svg";
import "./TimePicker.css";
import { numberGenerator } from "utils/DateUtility";
import { Button } from "UIComponents/Button/Button";

const TimePicker = ({
	toggler,
	onOptionSelect,
	top,
	right,
	optionClassName,
	menuClassName,
	subMenuClassName,
	optionStyle,
	togglerStyle,
	dropdownWidth,
	className,
	value,
}) => {
	const ref = useRef();
	const [hours] = useState(numberGenerator(1, 12) || []);
	const [minutes] = useState(numberGenerator(0, 59) || []);
	const [hour, setHour] = useState();
	const [minute, setMinute] = useState();
	const [showDropdown, setShowDropdown] = useState(false);

	useEffect(() => {
		if (value) {
			let [h = 0, m = 0] = value.split(":");
			setHour(parseInt(h));
			setMinute(parseInt(m));
		}
	}, [value]);

	useOutsideClick(ref, () => {
		if (showDropdown) setShowDropdown(false);
		setHour();
		setMinute();
	});

	const handleOptionSelect = (key, option) => {
		if (key === "hour") {
			setHour(option);
		} else if (key === "minute") {
			setMinute(option);
		}
	};

	const handleCancel = () => {
		setShowDropdown(false);
		setHour();
		setMinute();
	};

	const validation = () => {
		if (hour && (minute || minute === 0)) {
			return true;
		}
		return false;
	};

	const handleSubmit = () => {
		if (validation()) {
			const time = `${hour}:${minute}`;
			onOptionSelect && onOptionSelect(time);
			setShowDropdown(false);
		}
	};

	return (
		<>
			<div
				className={`position-relative ${className}`}
				style={{ width: dropdownWidth }}
			>
				<div
					onClick={(e) => {
						setShowDropdown(!showDropdown);
						e.stopPropagation();
					}}
					className="cursor-pointer"
					style={{ ...togglerStyle }}
				>
					{toggler}
				</div>
				<div
					className={menuClassName}
					style={{ top: top, right: right }}
					hidden={!showDropdown}
					ref={(el) => {
						if (el) {
							ref.current = el;
						}
					}}
				>
					<div
						style={{ maxHeight: "250px" }}
						className="flex-row d-flex"
					>
						<div className={subMenuClassName}>
							{hours?.length > 1 &&
								hours.map((item, index) => (
									<div
										id={index}
										className={`${optionClassName} ${
											item === hour
												? "timepicker_options_selected"
												: ""
										}`}
										key={index}
										onClick={(e) => {
											handleOptionSelect("hour", item);
											e.stopPropagation();
										}}
										style={optionStyle}
									>
										{item}
									</div>
								))}
						</div>
						<div
							style={{
								border: "1px solid rgb(113 113 113 / 9%)",
							}}
						/>
						<div className={subMenuClassName}>
							{minutes?.length > 1 &&
								minutes.map((item, index) => (
									<div
										id={index}
										className={`${optionClassName} ${
											item === minute
												? "timepicker_options_selected"
												: ""
										}`}
										key={index}
										onClick={(e) => {
											handleOptionSelect("minute", item);
											e.stopPropagation();
										}}
										style={optionStyle}
									>
										{item}
									</div>
								))}
						</div>
					</div>
					<div
						className="timepicker_options_button"
						hidden={!showDropdown}
						style={{
							borderTop: "1px solid rgb(113 113 113 / 9%)",
							justifyContent: "space-around",
							alignItems: "center",
						}}
					>
						<Button
							className="timepicker_button"
							style={{ padding: "0px" }}
							type="normal"
							onClick={() => {
								handleCancel();
							}}
						>
							Cancel
						</Button>
						<Button
							className="timepicker_button"
							style={{ padding: "4px" }}
							disabled={!validation()}
							onClick={() => {
								handleSubmit();
							}}
						>
							Save
						</Button>
					</div>
				</div>
			</div>
		</>
	);
};

export default TimePicker;

TimePicker.propTypes = {
	toggler: PropTypes.element,
	onOptionSelect: PropTypes.func,
	top: PropTypes.number,
	right: PropTypes.number,
	optionClassName: PropTypes.string,
	menuClassName: PropTypes.string,
	subMenuClassName: PropTypes.string,
	optionStyle: PropTypes.object,
	togglerStyle: PropTypes.object,
	dropdownWidth: PropTypes.string,
	className: PropTypes.string,
	value: PropTypes.string,
};

TimePicker.defaultProps = {
	toggler: <img alt="" src={downArrow} />,
	onOptionSelect: () => {},
	top: -285,
	right: -40,
	optionClassName: "timepicker_options cursor-pointer",
	menuClassName: "timepicker_options_menu",
	subMenuClassName: "timepicker_option",
	optionStyle: {},
	togglerStyle: {},
	dropdownWidth: "fit-content",
	className: "",
	value: "",
};
