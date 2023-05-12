import React, { useState } from "react";
import ApplicationAuthStatusDropdown from "../overview/ApplicationAuthStatusDropdown";
import rightarrow from "../../../../components/Transactions/Recognised/rightarrow.svg";
import leftarrow from "../../../../components/Transactions/Recognised/leftarrow.svg";

export function WhatsNextContainer(props) {
	const onAppChange = (value) => {
		let tempArray = [...props.fullRowArray];
		let tempMessage = [...props.fullRowMessage];

		let index = tempMessage.findIndex(
			(row) => row.id === props.data.app_id
		);
		if (index > -1) {
			tempMessage.splice([index], 1);
		}
		tempMessage.push({
			id: props.data.app_id,
			message: `has been moved to ${value}`,
		});
		let index2 = tempArray.findIndex((row) => row === props.data.app_id);
		if (index2 > -1) {
			tempArray.splice([index2], 1);
		}
		tempArray.push(props.data.app_id);
		props.setFullRowArray(tempArray);
		props.setFullRowMessage(tempMessage);
	};
	const renderAuthButton = () => {
		return (
			<ApplicationAuthStatusDropdown
				toggler={
					<div className="font-13 bold-600 primary-color ml-2 cursor-pointer">
						{data[index]?.text}
					</div>
				}
				tagClassName="border-none text-decoration-none"
				onAppChange={onAppChange}
				app={props.data}
				isTable={true}
			/>
		);
	};
	const [index, setIndex] = useState(0);
	const [data, setData] = useState([
		{
			text: "Set Authorization",
			renderMethod: renderAuthButton,
		},
	]);

	const renderAddCard = () => {
		return (
			<>
				<div className="d-flex align-items-center">
					<div className="font-13 bold-600 primary-color ml-2 cursor-pointer">
						{data[index]?.text}
					</div>
				</div>
				{data[index]?.score && (
					<div className="font-9 grey-1">
						{`Improves health by`}
						<span>+ {data[index]?.score}</span>
					</div>
				)}
			</>
		);
	};

	const handleLeftClick = () => {
		if (index === 0) {
			setIndex(data.length - 1);
		} else {
			setIndex(index - 1);
		}
	};

	const handleRightClick = () => {
		setIndex((index + 1) % data.length);
	};

	return (
		<>
			<div className="whats_next_box d-flex align-items-center">
				{data.length > 1 && (
					<img
						src={leftarrow}
						onClick={handleLeftClick}
						className="cursor-pointer"
					></img>
				)}
				<div className="ml-auto mr-auto d-flex flex-column align-items-center justify-content-center">
					{data[index].renderMethod()}
				</div>
				{data.length > 1 && (
					<img
						src={rightarrow}
						onClick={handleRightClick}
						className="cursor-pointer"
					></img>
				)}
			</div>
		</>
	);
}
