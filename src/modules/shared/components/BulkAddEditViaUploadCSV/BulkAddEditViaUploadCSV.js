import React, { useState } from "react";
import close from "assets/close.svg";
import { Modal } from "react-bootstrap";
import { Loader } from "common/Loader/Loader";

export default function BulkAddEditViaUploadCSV({
	isOpen,
	handleClose,
	modalProps = {},
}) {
	const [uploading, setUploading] = useState(false);
	const [uploaded, setUploaded] = useState(false);
	const [invalidRows, setInvalidRows] = useState([]);

	return (
		<Modal centered show={isOpen} onHide={handleClose}>
			<Modal.Header closeButton={false} style={{ width: "500px" }}>
				<Modal.Title
					className="d-flex align-items-center"
					style={{ fontWeight: "600" }}
				>
					<div className="font-18">{modalProps.title}</div>
				</Modal.Title>
				<img alt="Close" onClick={handleClose} src={close} />
			</Modal.Header>
			<Modal.Body style={{ height: "300px", width: "500px" }}>
				{uploading ? (
					<div className="d-flex align-items-center w-100 h-100 justify-content-between">
						<Loader height={120} width={120} />
					</div>
				) : uploaded ? (
					invalidRows.length > 0 ? (
						modalProps.invalidRowsComponent({
							rows: invalidRows,
							reUploadFile: () => {
								setInvalidRows([]);
								setUploaded(false);
							},
							handleClose: handleClose,
						})
					) : (
						modalProps.noInvalidRowsComponent
					)
				) : (
					<div className="d-flex justify-content-between">
						{Array.isArray(modalProps.steps) &&
							modalProps.steps.map((step, index) => (
								<>
									<div
										className="d-flex flex-column align-items-center"
										key={index}
										style={{
											width: "160px",
											padding: "10px",
										}}
									>
										<img
											className="mb-4"
											src={step.img}
											height={80}
											width={80}
											alt={`step${index + 1}`}
										/>
										<div className="primary-color border-radius-8 blue_tint_bg font-10 bold-600 padding_4">
											Step {index + 1}
										</div>
										<div className="font-11 bold-700 mt-2">
											{step.title}
										</div>
										<div
											className="font-9 grey-1 mt-2 mb-2"
											style={{
												textAlign: "center",
												height:
													modalProps.descriptionHeight ||
													"35px",
											}}
										>
											{step.description}
										</div>
										{modalProps.getStepButtons({
											step: index + 1,
											uploading,
											setUploading,
											uploaded,
											setUploaded,
											invalidRows,
											setInvalidRows,
											handleClose,
										})}
									</div>
								</>
							))}
					</div>
				)}
			</Modal.Body>
		</Modal>
	);
}
