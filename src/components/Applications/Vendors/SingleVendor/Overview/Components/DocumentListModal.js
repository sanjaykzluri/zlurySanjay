import React from "react";
import close from "../../../../../../assets/close.svg";
import { DocumentItem } from "./DocumentsList/Document";

export function DocumentListModal({ documents, onHide, fetchVendorOverview }) {
	return (
		<>
			<div show className="addContractModal__TOP h-100 overflow-auto">
				<div className="d-flex flex-row align-items-center py-4">
					<div className="m-auto">
						<span className="contracts__heading">Documents</span>
					</div>
					<img
						alt="Close"
						onClick={onHide}
						src={close}
						className="cursor-pointer mr-4"
					/>
				</div>
				<div>
					{Array.isArray(documents) && documents.length > 0 ? (
						documents.map((document, key) => (
							<DocumentItem
								className="document__modal__item"
								key={key}
								document={document}
								fetchVendorOverview={fetchVendorOverview}
								isModal
							/>
						))
					) : (
						<div className="w-100 mt-4 ">
							{" "}
							No more documents to show
						</div>
					)}
				</div>
			</div>
		</>
	);
}
