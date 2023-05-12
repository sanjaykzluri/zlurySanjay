import React from "react";
import ContentLoader from "react-content-loader";
import { NotesList } from "../../../../components/Notes/NotesList";

export function ApplicationNotes({ app }) {
	return (
		<>
			{!app ? (
				<div className="vendoroverview__appslist__cont">
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
				<div className="vendoroverview__noteslist__cont">
					<NotesList
						className="mt-4"
						notes={app.app_notes}
						entity={{
							id: app.app_id,
							name: app.app_name,
							image: app.app_logo,
							type: "application",
						}}
					/>
				</div>
			)}
		</>
	);
}
