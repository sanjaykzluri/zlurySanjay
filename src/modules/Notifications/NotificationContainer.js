import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";

export default function NotificationContainer({}) {
	const { toastCounter } = useSelector((state) => state.notifications);
	const [showClearAll, setShowClearAll] = useState(true);

	useEffect(() => {
		if (toastCounter > 0) {
			if (!showClearAll) {
				setShowClearAll(true);
			}
		}
	}, [toastCounter]);

	return (
		<div className="position-relative">
			{toastCounter > 0 && showClearAll && (
				<div
					className="notification_clear_all"
					onClick={() => {
						setShowClearAll(false);
						toast.dismiss();
					}}
				>
					Clear All
				</div>
			)}
			<ToastContainer
				position={toast.POSITION.TOP_RIGHT}
				autoClose={5000}
				limit={3}
				style={{ marginTop: "8px" }}
			/>
		</div>
	);
}
