import React, { useEffect, useRef, useState } from "react";
import healthPoints from "assets/applications/card_health_points.svg";
import rightTick from "assets/right_tick.svg";
import { deleteAppHealthCards, fetchAppHealthCards } from "./redux";
import { useDispatch, useSelector } from "react-redux";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";

export default function CompletedCard({ action, app, title, reset, cardId, handleSubmit, tab }) {
	const timerRef = useRef(null);
	const intervalRef = useRef(null);
	const dispatch = useDispatch();
	const { SHOW_HEALTH_POINTS } = useSelector((state) => state.featureFlags);
	const [percentage, setPercentage] = useState(10);
	
	useEffect(() => {
		const interval = setInterval(() => {
			setPercentage(p => p+10)
		}, 300)
		const timer = setTimeout(async () => {
			reset();
			dispatch(deleteAppHealthCards(cardId));
			await handleSubmit();
			dispatch(fetchAppHealthCards(app?.app_id, false,tab));
		}, 3000);
		timerRef.current = timer;
		intervalRef.current = interval;
		return () => {
			clearInterval(intervalRef);
			clearTimeout(timerRef);
		}
	}, []);

	const handleUndo = () => {
		clearTimeout(timerRef.current);
		clearInterval(timerRef.current);
		reset();
	}
	return (
		<div className="completed_card">
			{SHOW_HEALTH_POINTS && (
				<img src={healthPoints} className="healthpoints" />
			)}
			<div className="d-flex">
				<span className="card_status"> COMPLETED </span>{" "}
				<img src={rightTick} />
			</div>
			<p className="card_completed_text">
				{action?.compltedText || `${title} has completed successfully`}
			</p>
			<div className="d-flex align-items-center">
				<a onClick={handleUndo} className="undo cursor-pointer">UNDO </a>
				<div style={{ width: 8, marginLeft: 2 }}>
					<CircularProgressbar
						value={percentage}
						strokeWidth={50}
						styles={buildStyles({
							strokeLinecap: "butt",
						})}
					/>
				</div>
			</div>
		</div>
	);
}
