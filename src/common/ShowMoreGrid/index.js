import React, { useState } from "react";

export default function ShowMoreGrid({
	data,
	component,
	dataKey,
	limit = 6,
	showMoreComponent,
	showLessComponent,
}) {
	const [showMore, setShowMore] = useState(false);
	return (
		<>
			{Array.isArray(data) &&
				data?.map((el, index) => {
					if (showMore) {
						return React.cloneElement(component, { [dataKey]: el });
					} else {
						if (index < limit) {
							return React.cloneElement(component, {
								[dataKey]: el,
							});
						}
					}
				})}
			{Array.isArray(data) && data?.length > limit && (
				<div onClick={() => setShowMore(!showMore)}>
					{showMore ? showLessComponent : showMoreComponent}
				</div>
			)}
		</>
	);
}
