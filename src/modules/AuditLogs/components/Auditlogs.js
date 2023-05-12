import React, { useState } from "react";
//import { AllAuditLogsExport } from "./AllAuditlogsExport"; will use this once API is implemented
import moment from "moment";
import InfiniteTableContainer from "../../v2InfiniteTable/InfiniteTableContainer";
import {
	getAllAuditlogsPropertiesList,
	getAllAuditlogsV2,
} from "../../../services/api/auditlogs";
import rightarrow from "assets/auditlogs/rightarrow.svg";
import downarrow from "assets/auditlogs/downarrow.svg";
import { EventType } from "./eventtype/eventtype";
import { Actors } from "./actors/actors";
import { EventDescription } from "./eventDescription/event_description";
import { Comments } from "./comments/comments";
import { Metadata } from "./metadata/metadata";
import BetaModal from "../../shared/components/BetaTagAndModal/BetaModal";
import BetaTag from "../../shared/components/BetaTagAndModal/BetaTag";
import { betaTypes } from "../../shared/components/BetaTagAndModal/BetaConstants";
import V2PaginatedTableContainer from "modules/v2PaginatedTable/v2PaginatedTableContainer";

export function AuditLogsTable() {
	const [showdescription, setshowdescription] = useState([]);
	const [showmetadata, setshowmetadata] = useState(false);
	const [rowdata, setrowData] = useState({});
	const showeventdescription = (row) => {
		let items = [...showdescription];
		let index = items.indexOf(row._id);
		if (index > -1) {
			items.splice(index, 1);
		} else {
			items.push(row._id);
		}
		setshowdescription(items);
	};
	const getColumnsMapper = (handleRefresh) => {
		const columnsMapper = {
			arrow: {
				formatter: (data, row) => (
					<img
						src={
							showdescription.includes(row._id)
								? downarrow
								: rightarrow
						}
						alt=""
						onClick={() => showeventdescription(row)}
					/>
				),
			},
			timestamp: {
				dataField: "event_date",
				text: "Timestamp",
				sortKey: "timestamp",
				formatter: (data, row) => (
					<div className="d-flex flex-column justify-content-center">
						<div>
							{moment(new Date(data)).format("DD MMM YYYY")}
						</div>
						<div style={{ fontSize: "10px", color: "#717171" }}>
							{moment(new Date(row.event_timestamp)).format(
								"HH:mm:ss"
							)}
						</div>
					</div>
				),
				headerStyle: {
					fontWeight: "normal",
				},
			},
			actor: {
				dataField: "actor",
				text: "Actor Details",
				sortKey: "actor",
				formatter: (data, row) => (
					<Actors
						actor={data}
						actor_name={row?.actor_name}
						actor_role={row?.actor_role}
						actor_id={row?.actor_id}
					/>
				),
				headerStyle: {
					fontWeight: "normal",
				},
			},
			ip_address: {
				dataField: "ip_address",
				text: "IP Address",
				sortKey: "ip_address",
				formatter: (data, row) => (
					<div
						className="d-flex flex-column justify-content-center"
						style={{
							whiteSpace: "break-spaces",
							wordBreak: "break-word",
							width: "200px",
						}}
					>
						<div>{data}</div>
						<div style={{ fontSize: "10px", color: "#717171" }}>
							{row.location}
						</div>
					</div>
				),
				headerStyle: {
					fontWeight: "normal",
				},
			},
			event_type: {
				dataField: "event_type",
				text: "Event Type",
				sortKey: "event_type",
				formatter: (data, row) => <EventType event_type={data} />,
				headerStyle: {
					fontWeight: "normal",
				},
			},
			event_description: {
				dataField: "event_title",
				text: "Event Description",
				sortKey: "event_title",
				formatter: (data, row) => (
					<EventDescription
						event_title={data}
						id={row._id}
						row_data={row}
						setrowData={setrowData}
						entity={row.entity}
						setshowmetadata={setshowmetadata}
						event_description={row.event_description}
						showdescription={showdescription}
					/>
				),
				headerStyle: {
					fontWeight: "normal",
				},
			},
		};
		return columnsMapper;
	};
	const loadComponent = (e) => {
		return (
			<Comments
				comment_by_profile_img={e.comment_by_profile_img}
				comment_is={e.comment_is}
				comment_by={e.comment_by}
				comment_at={e.comment_at}
				id={e._id}
				showdescription={showdescription}
			/>
		);
	};
	return (
		<>
			<BetaModal betaType={betaTypes.PRIVATE} feature="Audit Logs" />
			<BetaTag
				betaType={betaTypes.PRIVATE}
				style={{ padding: "0 40px" }}
			/>
			<V2PaginatedTableContainer
				columnsMapper={getColumnsMapper}
				v2TableEntity="auditlogs"
				v2SearchFieldId="event_title"
				v2SearchFieldName="Event title"
				getAPI={getAllAuditlogsV2}
				searchAPI={getAllAuditlogsV2}
				propertyListAPI={getAllAuditlogsPropertiesList}
				keyField="_id"
				hasBulkEdit={false}
				hasExpandedRow={true}
				loadexpandedRowComponent={loadComponent}
				//exportComponent={AllAuditLogsExport}
				chipText="Logs"
			/>
			{Object.keys(rowdata).length > 0 && (
				<Metadata
					show={showmetadata}
					setshowmetadata={setshowmetadata}
					data={rowdata}
				/>
			)}
		</>
	);
}
