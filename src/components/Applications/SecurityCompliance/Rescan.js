import React from "react";
import { Button } from "../../../UIComponents/Button/Button";
import needsreview from "../../../assets/applications/needsreview.svg";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

function Rescan(props) {
	return (
		<Button
			className={` ${props.reScanningFailed
					? "btn btn-outline-danger"
					: "btn btn-outline-primary"
				} font-12`}
			disabled={props.isScanning}
			onClick={() => props.rescan && props.rescan()}
			style={
				props.isScanning
					? { borderColor: "#717171", width: "91px" }
					: { width: "91px" }
			}
		>
			{props.isScanning ? (
				<OverlayTrigger
					overlay={<Tooltip>Previous scan is in progress.</Tooltip>}
					placement="top"
				>
					<div className="d-flex flex-row">
						<img
							src={needsreview}
							width={11}
							height={11}
							style={{ paddingTop: "2px", marginRight: "2px" }}
						/>
						<div className="grey-1">Scanning</div>
					</div>
				</OverlayTrigger>
			) : props.reScanningFailed ? (
				<div className="red">Retry</div>
			) : props.loading ? (
				<div className="grey-1 o-6">loading</div>
			) : (
				"Rescan"
			)}
		</Button>
	);
}

export default Rescan;
