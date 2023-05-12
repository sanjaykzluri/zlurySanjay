import React from "react";
import { NameBadge } from "../../../common/NameBadge";
import { unescape } from "../../../utils/common";
import { format, UTCDateFormatter } from "../../../utils/DateUtility";
import "components/Users/ActionLogHistory/HistoryItem.css";
import dayjs from "dayjs";

export default function ActionItem(props) {
	const {
		title,
		subtitle,
		logo,
		note,
		date,
		name,
		logoStyle,
		renderTitle,
		renderSubComponent,
	} = props;
	return (
		<div className="historyItem employee_action_step">
			<div className="employee_action_text_content">
				<div className="v-stepper">
					<div className="iconWrapper">
						{logo ? (
							<img
								className="userHistoryImage"
								alt="action-icon"
								src={unescape(logo)}
								style={{ ...logoStyle }}
							/>
						) : (
							<NameBadge
								name={name}
								className="userHistoryImage"
								height={22}
								width={22}
							/>
						)}
					</div>
					<div className="line"></div>
				</div>
				<div className="d-flex flex-column w-100">
					<div className="historyText">
						<div className="textContent">
							{renderTitle}

							{note && (
								<p className="font-11 noteText">
									Note: {props.note}
								</p>
							)}
						</div>
						{date && (
							<div
								className="font-10 grey-1 "
								style={{ whiteSpace: "nowrap" }}
							>
								{dayjs(date).format("D MMM YYYY, HH:mm")}
							</div>
						)}
					</div>
					<p className="history_text_subtitle_text">{subtitle}</p>
					{renderSubComponent}
				</div>
			</div>
		</div>
	);
}
