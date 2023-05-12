import React from "react";
import ContentLoader from "react-content-loader";
import { NotesList } from "components/Notes/NotesList";

export function ContractNotes({ loading, data, contractId }) {
	return (
		<>
			{loading ? (
				<div className="contract-notes-section">
					<div className="vendoroverview__appslist__cont__d1">
						<ContentLoader width={100} height={14}>
							<rect width={100} height={14} fill="#EBEBEB" />
						</ContentLoader>
					</div>
					<div className="vendoroverview__noteslist__cont__d2">
						<div className="vendoroverview__noteslist__cont__d2__note">
							<ContentLoader width={200} height={80}>
								<rect
									y="17"
									width={193}
									height={14}
									fill="#EBEBEB"
									rx="2"
									ry="2"
								/>
								<rect
									y="38"
									width={134}
									height={14}
									fill="#EBEBEB"
									rx="2"
									ry="2"
								/>
							</ContentLoader>
						</div>
						<div className="vendoroverview__noteslist__cont__d2__note">
							<ContentLoader width={200} height={80}>
								<rect
									y="17"
									width={193}
									height={14}
									fill="#EBEBEB"
									rx="2"
									ry="2"
								/>
								<rect
									y="38"
									width={134}
									height={14}
									fill="#EBEBEB"
									rx="2"
									ry="2"
								/>
							</ContentLoader>
						</div>
					</div>
				</div>
			) : (
				<div className="contract-notes-section">
					<NotesList
						className="mt-4"
						notes={data?.notes}
						entity={{
							id: contractId,
							name: data.name,
							type: "contract",
						}}
					/>
				</div>
			)}
		</>
	);
}
