import React, { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Spinner } from "react-bootstrap";
import CSV from "components/Uploads/CSV.svg";
import { optimizationLicenseClassifications } from "./constants/OptimizationConstants";
import { useDispatch } from "react-redux";
import {
	endPdfGeneration,
	startPdfGeneration,
} from "./redux/Optimization-action";

export default function OptimizationGeneratePDF({ licenseUsageRefObj }) {
	const dispatch = useDispatch();
	const [printing, setPrinting] = useState(false);

	const printDocument = async () => {
		dispatch(startPdfGeneration());
		setPrinting(true);
		let pdf = new jsPDF();

		const keys = [
			`overview`,
			...Object.values(optimizationLicenseClassifications),
		];

		const refs = [...Object.values(licenseUsageRefObj)];

		for (let i = 0; i < refs.length; i++) {
			const input = refs[i].current;
			input.width = "fit-content";
			const canvas = await html2canvas(input);
			pdf.internal.pageSize.width = canvas.width;
			pdf.internal.pageSize.height = canvas.height;
			const imgData = canvas.toDataURL("image/png");
			pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
			pdf.setPage(i + 1);
			input.style.width = "auto";
			if (i < keys.length - 1) {
				pdf.addPage();
			}
		}

		pdf.save(`Optimization Report ${new Date().toISOString()}.pdf`);
		setPrinting(false);
		dispatch(endPdfGeneration());
	};
	return (
		<button
			onClick={printDocument}
			className="d-flex justify-content-center align-items-center export mr-3"
			style={{ height: "36px", width: "166px" }}
		>
			{printing ? (
				<Spinner
					animation="border"
					role="status"
					variant="dark"
					size="sm"
					className="mr-2"
					style={{ borderWidth: 2 }}
				/>
			) : (
				<img src={CSV} className="mr-2" />
			)}
			<div>{printing ? "Downloading..." : "Download as PDF"}</div>
		</button>
	);
}
