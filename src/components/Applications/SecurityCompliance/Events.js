import React, { useEffect, useState } from "react";
import ContentLoader from "react-content-loader";
import { useDispatch, useSelector } from "react-redux";
import { fetchApplicationEvents } from "../../../actions/applications-action";
import EventCard from "./EventCard";
import common_empty from "../../../assets/common/common_empty.png";
import _ from "underscore";
import warning from "../../Onboarding/warning.svg";
import { Button } from "../../../UIComponents/Button/Button";

export default function Events(props) {
	const dispatch = useDispatch();
	const applicationEvents = useSelector(
		(state) =>
			state.applications.singleappSecurityEvents[
				props.application?.app_id
			]
	);
	const [loading, setLoading] = useState(false);
	const [recentEvents, setRecentEvents] = useState([]);
	const [olderEvents, setOlderEvents] = useState([]);
	const [showErrorScreen, setShowErrorScreen] = useState(false);

	const handleRetry = () => {
		dispatch(fetchApplicationEvents(props.application?.app_id));
	};

	useEffect(() => {
		if (props.application) {
			dispatch(fetchApplicationEvents(props.application?.app_id));
		}
	}, [props.application]);

	useEffect(() => {
		setLoading(true);
		if (!_.isEmpty(applicationEvents?.error)) {
			setShowErrorScreen(true);
		} else {
			setShowErrorScreen(false);
		}
		if (
			!applicationEvents?.loading &&
			applicationEvents?.data &&
			Object.keys(applicationEvents?.data)?.length > 0
		) {
			applicationEvents.data.recent &&
				Array.isArray(applicationEvents.data.recent) &&
				applicationEvents.data.recent.length > 0 &&
				setRecentEvents(
					applicationEvents.data.recent.sort((a, b) => {
						const aDate = new Date(a.event_date);
						const bDate = new Date(b.event_date);
						return bDate - aDate;
					})
				);
			applicationEvents.data.older &&
				Array.isArray(applicationEvents.data.older) &&
				applicationEvents.data.older.length > 0 &&
				setOlderEvents(
					applicationEvents.data.older.sort((a, b) => {
						const aDate = new Date(a.event_date);
						const bDate = new Date(b.event_date);
						return bDate - aDate;
					})
				);
			setLoading(false);
		}
	}, [applicationEvents]);

	return (
		<>
			{showErrorScreen ? (
				<div
					className="d-flex flex-column p-3"
					style={{ height: "50vh" }}
				>
					<img
						src={warning}
						className="ml-auto mr-auto mt-auto"
						style={{ width: "45.42px" }}
					/>
					<div className="grey-1 font-18 text-center mt-2">
						An error occured. Please try again
					</div>
					<Button
						className="btn btn-outline-primary ml-auto mr-auto mt-2 mb-auto"
						onClick={handleRetry}
					>
						<div className="font-13">Retry</div>
					</Button>
				</div>
			) : (
				<>
					{loading ? (
						_.times(5, (number) => (
							<div
								className="eventCard mb-3 ml-3 mr-3"
								key={number}
							>
								<ContentLoader height="105" width="100%">
									<rect
										width="160"
										height="10"
										rx="2"
										fill="#EBEBEB"
										y="15"
										x="20"
									/>
									<rect
										width="50%"
										height="17"
										rx="2"
										x={100}
										fill="#EBEBEB"
										y="35"
										x="20"
									/>
									<rect
										width="80%"
										height="12"
										rx="2"
										x={100}
										fill="#EBEBEB"
										y="63"
										x="20"
									/>
									<rect
										width="40%"
										height="12"
										rx="2"
										x={100}
										fill="#EBEBEB"
										y="85"
										x="20"
									/>
								</ContentLoader>
							</div>
						))
					) : recentEvents?.length > 0 || olderEvents?.length > 0 ? (
						<div className="p-3">
							{recentEvents?.length > 0 ? (
								<div className="ml-3 mr-3 mt-3">
									<div className="font-18 ml-3">
										Recent Events
									</div>
									<>
										{recentEvents.map((event, index) => (
											<EventCard
												event={event}
												key={index}
												isRecentEvent={true}
											/>
										))}
									</>
								</div>
							) : null}
							{olderEvents?.length > 0 ? (
								<div className="ml-3 mr-3 mt-4">
									<div className="font-18 ml-3">
										Older Events
									</div>
									<>
										{olderEvents.map((event, index) => (
											<EventCard
												event={event}
												key={index}
											/>
										))}
									</>
								</div>
							) : null}
						</div>
					) : (
						<div
							className="d-flex flex-column p-3"
							style={{ height: "50vh" }}
						>
							<img
								src={common_empty}
								className="mt-auto ml-auto mr-auto"
							/>
							<div className="grey font-16 bold-600 text-center ml-auto mb-auto mr-auto mt-2">
								No recent events :)
							</div>
						</div>
					)}
				</>
			)}
		</>
	);
}
