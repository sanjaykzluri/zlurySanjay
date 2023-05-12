import React from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import summaryPDF from "assets/optimization/summaryPDF.svg";

export default function OptimizationSummaryTableGeneratePDF({}) {
	const printDocument = async () => {
		let pdf = new jsPDF();

		const input = document.getElementById("optimization_summary_table");
		const canvas = await html2canvas(input);
		const imgData = canvas.toDataURL("image/png");
		pdf.internal.pageSize.width = canvas.width;
		pdf.internal.pageSize.height = canvas.height;
		pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);

		pdf.save(`Optimization Summary Table ${new Date().toISOString()}.pdf`);
	};

	return (
		<div
			className="d-flex align-items-center"
			style={{ gap: "4px" }}
			onClick={printDocument}
		>
			<img src={summaryPDF} width={20} height={20} />
			<div className="d-flex align-items-center">PDF</div>
		</div>
	);
}
