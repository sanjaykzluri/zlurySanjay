import React, { useEffect, useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import "./UserManualUsage.scss";
import { SelectOld } from "../../../../UIComponents/SelectOld/Select";
import { NameBadge } from "../../../../common/NameBadge";
import { unescape } from "../../../../utils/common";
const UserManualUsage = (props) => {
	return (
		<div
			className="row d-flex flex-column grow"
			style={{ marginTop: "6px", marginBottom: "6px" }}
		>
			<div
				className="d-flex flex-nowrap align-items-start"
				style={{ paddingLeft: 12 }}
			>
				<input
					className="z__checkbox mt-auto mb-auto"
					type="checkbox"
					checked={props.user.checked}
					onClick={() =>
						props.updateUserChecked(
							props.index,
							!props.user.checked
						)
					}
					style={{
						marginRight: 8,
						marginLeft: 8,
						marginTop: 5,
					}}
				/>
				{!!props.user.user_image ? (
					<img
						src={unescape(props.user.user_image)}
						className="mr-2 ml-2 mt-auto mb-auto rounded-circle"
						width={28}
					/>
				) : (
					<NameBadge
						name={props.user.user_name}
						className="mt-auto mb-auto ml-2 mr-1"
						width={28}
					/>
				)}
				<div
					style={{ width: 117, marginRight: 20 }}
					className="mt-auto mb-auto"
				>
					<div
						style={{
							fontSize: 11,
							fontWeight: 500,
							marginTop:
								!props.user.user_designation ||
								props.user.user_designation === ""
									? 6
									: 0,
						}}
					>
						{props.user.user_name}
					</div>
					<div
						style={{
							fontSize: 9,
							color: "#717171",
						}}
					>
						{props.user.user_designation}
					</div>
				</div>
				<div
					className="z__operator mt-auto mb-auto"
					onClick={() => {
						if (props.user.frequency > 1)
							props.updateUserFrequency(
								props.index,
								props.user.frequency - 1
							);
					}}
				>
					-
				</div>
				<div className="z__number mt-auto mb-auto">
					{props.user.frequency}
				</div>
				<div
					className="z__operator mt-auto mb-auto"
					onClick={() => {
						props.updateUserFrequency(
							props.index,
							props.user.frequency + 1
						);
					}}
				>
					+
				</div>
				<p
					className="z__block-header text-left mt-auto mb-auto"
					style={{
						lineHeight: "28px",
						marginLeft: 5,
						marginRight: 5,
					}}
				>
					every
				</p>
				<SelectOld
					value={props.intervalOptions.find(
						(res) => res.value === props.user.interval
					)}
					style={{
						width: "78px",
						height: "28px",
					}}
					className="mt-auto mb-auto"
					options={props.intervalOptions}
					isSearchable={false}
					// onSelect={(v) => mapValueToKeyState(props.updateUserInterval, v.value)}
					onSelect={(v) =>
						props.updateUserInterval(props.index, v.value)
					}
				/>
			</div>
		</div>
	);
};

export default UserManualUsage;
