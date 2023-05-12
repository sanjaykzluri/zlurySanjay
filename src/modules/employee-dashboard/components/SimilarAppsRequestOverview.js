import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import React, { useEffect, useState } from "react";
import { SimilarAppsSection } from "./similarAppsSection";

export function SimilarAppsRequestOverview({ data }) {
	return (
		<>
			<div
				style={{
					height: "fit-content",
					padding: "33px 30px",
				}}
				className="d-flex flex-column background-color-white border-radius-4 mt-3 w-100 "
			>
				<div
					className="font-14 bold-700 black-1 o-7"
					style={{
						alignSelf: "flex-start",
					}}
				>
					SIMILAR APPS USED IN YOUR ORG
				</div>
				<hr style={{ margin: "15px 10px " }} className="w-100 "></hr>
				<div
					className="d-flex flex-row align-items-center"
					style={{ overflowX: "auto", paddingBottom: "10px" }}
				>
					<SimilarAppsSection
						needSlicing={false}
						className={"flex-row"}
						handleOnClick={(app) => {}}
						app_id={data?.app_id}
						showAlternativeApps={false}
						app_in_org={data.is_org_app}
					></SimilarAppsSection>
				</div>
			</div>
		</>
	);
}
