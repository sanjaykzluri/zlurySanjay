import React, { Component, useState, useEffect, useContext } from "react";
import "./Overview.css";
import Description from "./Components/Description/Description";
import { ContactDetails } from "./Components/ContactDetails/ContactDetails";
import { HeaderRight } from "./Components/HeaderRight/HeaderRight";
import { AppsList } from "./Components/AppsList/AppsList";
import { NotesListVendor } from "./Components/NotesList/NotesList";
import { DocumentsListVendor } from "./Components/DocumentsList/DocumentsListVendor";
import VendorCustomFields from "./Components/VendorCustomFields/VendorCustomFields";
import VendorSpendGraph from "./Components/VendorSpendGraph/VendorSpendGraph";
export function Overview(props) {
	const vendor = props.vendor;
	const loading = props.loading;
	return (
		<>
			<div className="vendoroverview__cont">
				<div className="vendoroverview__cont__left">
					<Description
						vendor={props.vendor}
						loading={props.loading}
						fetchVendorOverview={props.fetchVendorOverview}
					></Description>
					<ContactDetails
						vendor={props.vendor}
						loading={props.loading}
					></ContactDetails>
				</div>
				<div className="vendoroverview__cont__right">
					<HeaderRight
						vendor={props.vendor}
						loading={props.loading}
					></HeaderRight>
					<VendorCustomFields
						vendor={vendor}
						loading={props.loading}
						fetchVendorOverview={props.fetchVendorOverview}
					/>
					<AppsList
						vendor={props.vendor}
						loading={props.loading}
					></AppsList>
					<NotesListVendor
						vendor={props.vendor}
						loading={loading}
					></NotesListVendor>
					<DocumentsListVendor
						fetchVendorOverview={props.fetchVendorOverview}
						vendor={props.vendor}
					></DocumentsListVendor>
					<VendorSpendGraph />
				</div>
			</div>
		</>
	);
}
