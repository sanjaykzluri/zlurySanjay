import EventCard from "components/Applications/SecurityCompliance/EventCard";
import React, { useEffect, useState } from "react";
import ContentLoader from "react-content-loader";

export function SecurityEvents({ data, loading }) {
	return (
		<>
			{loading ? (
				<>
					{[1, 2].map(() => (
						<div className="mt-1">
							<ContentLoader
								width={820}
								height={93}
								backgroundColor={`#DDDDDD`}
							>
								<rect
									y={0}
									width={820}
									height={93}
									fill="#EBEBEB"
								/>
							</ContentLoader>
						</div>
					))}
				</>
			) : (
				<>
					{Array.isArray(data) && data.length > 0 && (
						<>
							<div className="font-14 black-1 mt-3">
								Security Events
							</div>
							{data.map((event, index) => (
								<EventCard
									event={event}
									key={index}
									isRecentEvent={true}
								/>
							))}
						</>
					)}
				</>
			)}
		</>
	);
}
