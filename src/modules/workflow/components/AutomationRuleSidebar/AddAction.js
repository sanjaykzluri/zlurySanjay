import React, { useState } from "react";
import { Button } from "UIComponents/Button/Button";
import { Select } from "UIComponents/Select/Select";
import add from "assets/icons/plus-blue-circle-reverse.svg";

export default function AddAction({ onActionChange, options, action }) {
	const [showAddAction, setShowAddAction] = useState(false);
	return (
		<>
			<Button
				className="d-block bold-600 mt-3 mb-2"
				onClick={() => {
					setShowAddAction(true);
				}}
				type="dashed"
			>
				<img alt="" src={add} height="14" />
				<span className="ml-2">
					{!action ? "Add" : "Change"} Action
				</span>
			</Button>
			{showAddAction && (
				<>
					<Select
						filter
						search
						options={options}
						placeholder="Search for attributes"
						fieldNames={{
							label: "name",
							value: "path",
						}}
						onChange={(val) => {
							onActionChange(val);
							setShowAddAction(false);
						}}
					/>
				</>
			)}
		</>
	);
}