import React, { useEffect, useState } from "react";
import { Card, Form } from "react-bootstrap";
import backarrow from "../../../../assets/licenses/backarrow.svg";
import rightarrow from "../../../../assets/licenses/rightarrow.svg";
import edit from "../../../../assets/icons/edit.svg";
import close from "../../../../assets/close.svg";
import greenTick from "../../../../assets/green_tick.svg";
import { capitalizeFirstLetter } from "../../../../utils/common";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setInititalStepperState } from "../../../../common/Stepper/redux";
import moment from "moment";

export default function ContractHeader({
	defaultName,
	updateData,
	entity,
	hashValue,
	editEntity = false,
	returnEntityId,
	savedName,
}) {
	const { data } = useSelector((state) => state.stepper);

	let contractNameArray =
		data?.payment_term === "recurring"
			? [
					data?.app_name,
					"Recurring",
					"Every",
					data?.payment_repeat_frequency,
					data?.payment_repeat_interval,
			  ]
			: [
					data?.app_name,
					!data?.payment_date ||
					moment(data?.payment_date).format("DD MMM YYYY") ==
						"Invalid date"
						? ""
						: moment(data?.payment_date).format("DD MMM YYYY"),
			  ];

	const dispatch = useDispatch();
	const [name, setName] = useState(defaultName);
	const [editing, setEditing] = useState(false);
	const history = useHistory();
	const [manaullyEdited, setManuallyEdited] = useState(
		editEntity && contractNameArray.join(" ") !== savedName
	);

	useEffect(() => {
		if (defaultName) {
			setName(defaultName);
		}
	}, [defaultName]);

	useEffect(() => {
		if (
			!Object.keys(data).length ||
			manaullyEdited ||
			!(data.app_id || !data.is_app)
		) {
			return;
		}
		let contractName =
			data?.payment_term === "recurring"
				? [
						data?.app_name,
						`${capitalizeFirstLetter(entity)} -`,
						"Recurring",
						"Every",
						data?.payment_repeat_frequency,
						data?.payment_repeat_interval,
				  ]
				: data?.auto_renews
				? [
						data?.app_name,
						`${capitalizeFirstLetter(entity)} -`,
						!data?.payment_date ||
						moment(data?.payment_date).format("DD MMM YYYY") ==
							"Invalid date"
							? ""
							: moment(data?.payment_date).format("DD MMM YYYY"),
						" Renews every",
						data?.renewal_repeat_frequency,
						data?.renewal_repeat_frequency > 1
							? data?.renewal_repeat_interval
							: data?.renewal_repeat_interval?.slice(0, -1),
				  ]
				: [
						data?.app_name,
						`${capitalizeFirstLetter(entity)} -`,
						!data?.payment_date ||
						moment(data?.payment_date).format("DD MMM YYYY") ==
							"Invalid date"
							? ""
							: moment(data?.payment_date).format("DD MMM YYYY"),
				  ];
		updateData(contractName.join(" "));
	}, [
		data?.app_id,
		data?.is_app,
		data?.app_name,
		data?.payment_term,
		data?.payment_repeat_frequency,
		data?.payment_repeat_interval,
		data?.renewal_repeat_frequency,
		data?.renewal_repeat_interval,
		data?.payment_date,
		data?.auto_renews,
	]);

	return (
		<Card className="plan__header__wrapper">
			<div className="ml-2">
				<img
					width={16}
					src={backarrow}
					className="cursor-pointer"
					onClick={() => {
						dispatch(setInititalStepperState());
						history.goBack();
					}}
				/>
			</div>
			<div className="ml-2">
				{editEntity ? "Edit " : "Create a "}
				{capitalizeFirstLetter(entity)}
			</div>
			<div className="ml-2">
				<img width={6} src={rightarrow} />
			</div>
			{editing ? (
				<div className="d-flex align-items-center pl-2">
					<Form.Control
						value={name}
						onChange={(e) => setName(e.target.value?.trimStart())}
					/>
					<img
						src={greenTick}
						className="ml-2 cursor-pointer"
						onClick={() => {
							setManuallyEdited(true);
							updateData(name);
							setEditing(false);
						}}
						height={16}
						width={16}
					/>
					<img
						src={close}
						className="ml-2 cursor-pointer"
						onClick={() => {
							setName(defaultName);
							setEditing(false);
						}}
						height={16}
						width={16}
					/>
				</div>
			) : (
				<>
					<div className="ml-2">{name}</div>
					<img
						src={edit}
						className="ml-2 cursor-pointer"
						onClick={() => setEditing(true)}
						height={16}
						width={16}
					/>
				</>
			)}
		</Card>
	);
}
