import React from "react";
import { NameBadge } from "../../../common/NameBadge";
import { unescape } from "../../../utils/common";
import { format } from "../../../utils/DateUtility";
import "./HistoryItem.css";

export default function HistoryItem(props) {
	const { title, subtitle, logo, note, date, name } = props;
	return (
		<div className="historyItem step">
			<div className="history_text_content">
				<div className="v-stepper">
					<div className="iconWrapper">
						{logo ? (
							<img
								className="userHistoryImage"
								alt="action-icon"
								src={unescape(logo)}
							/>
						) : (
							<NameBadge
								name={name}
								className="userHistoryImage"
								height={26}
								width={26}
							/>
						)}
					</div>
					<div className="line"></div>
				</div>
				<div className="historyText">
					<div className="textContent">
						<span>{title}</span>
						<p>{subtitle}</p>
						{note && (
							<p className="font-11 noteText">
								Note: {props.note}
							</p>
						)}
					</div>
					{date && (
						<div className="date_content">
							{format(new Date(date))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
