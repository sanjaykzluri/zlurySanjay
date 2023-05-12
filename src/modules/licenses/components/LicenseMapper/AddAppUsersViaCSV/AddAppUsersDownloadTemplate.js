import React from "react";
import CsvDownload from "react-json-to-csv";

export default function AddAppUsersDownloadTemplate() {
	return (
		<>
			<CsvDownload
				style={{
					background: "#fff",
					border: "none",
				}}
				data={[{ Email: "john.doe@mycompany.com" }]}
				filename={`Bulk add app-users template.csv`}
			>
				<div className="primary_bg_2 border-radius-8 padding_4 font-10 bold-500 font-white">
					Download Template
				</div>
			</CsvDownload>
		</>
	);
}
