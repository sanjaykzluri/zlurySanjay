import { ApplicationSourceList } from "modules/applications/components/overview/ApplicationSourceList";
import React, { useContext, useState } from "react";
import SourceIcon from "../modules/shared/components/ManualUsage/TableComponents/SourceIcon";
import { SourceContext } from "../modules/shared/components/ManualUsage/TableFormatter/SourcesFormatter";
import { UserSourceList } from "../modules/users/components/UserSourceList";

export function Sources(props) {
	const { cell, userId, completeRow, isApp } = useContext(SourceContext);
	const [openUserSourceList, setOpenUserSourceList] = useState(false);
	const [openAppSourceList, setOpenAppSourceList] = useState(false);

	const openUserSourceListModal = () => {
		props.isUserSource && setOpenUserSourceList(true);
	};

	const openAppSourceListModal = () => {
		isApp && setOpenAppSourceList(true);
	};

	return (
		<div className="d-flex align-items-center">
			{cell &&
				Array.isArray(cell) &&
				Object.keys(cell).length > 0 &&
				Array.isArray(cell) &&
				cell.map(
					(source, index) =>
						Object.keys(source).length > 0 && (
							<>
								{index < 3 && (
									<SourceIcon
										style={props.style}
										key={index}
										source={source}
										refresh={props.refresh}
									/>
								)}
							</>
						)
				)}
			{Array.isArray(cell) && Object.keys(cell).length > 3 && (
				<div
					className={
						props.isUserSource || isApp
							? "font-12 primary-color cursor-pointer"
							: "font-12 primary-color"
					}
					onClick={() =>
						isApp
							? openAppSourceListModal()
							: openUserSourceListModal()
					}
				>
					+ {Object.keys(cell).length - 3}
				</div>
			)}

			{openUserSourceList && (
				<UserSourceList
					sources={completeRow.source_array}
					user={completeRow}
					userId={userId}
					refresh={props.refresh}
					setOpenUserSourceList={setOpenUserSourceList}
				/>
			)}

			{openAppSourceList && (
				<ApplicationSourceList
					sourceArray={completeRow.source_array}
					app={completeRow}
					setOpenAppSourceList={setOpenAppSourceList}
				/>
			)}
		</div>
	);
}
