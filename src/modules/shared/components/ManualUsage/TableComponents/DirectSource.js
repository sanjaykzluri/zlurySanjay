import React, { useContext, useState } from "react";
import RoleContext from "../../../../../services/roleContext/roleContext";
import { Popover } from "../../../../../UIComponents/Popover/Popover";
import "./GSuite.css";
import DirectSource from "../../../../../assets/direct-source.png";
import { OverlayTrigger, Tooltip as BootstrapTooltip } from "react-bootstrap";

const GSuite = (props) => {
	const [showLogo, setShowLogo] = useState(false);
	const { isViewer } = useContext(RoleContext);

	return (
		<>
			{Array.isArray(props.source) && props.source[0] && (
				<div style={{ position: "relative" }}>
					<OverlayTrigger
						placement="top"
						overlay={
							<BootstrapTooltip>
								{props.source[0].name ||
									props.source[0].source_name}
							</BootstrapTooltip>
						}
					>
						<div
							onClick={() => {
								if (!isViewer) {
									!props.noActionOnClick &&
										setShowLogo((val) => !val);
								}
							}}
							style={{ margin: 4 }}
							className="cursor-pointer"
						>
							<img
								src={
									props.source[0].logo ||
									props.source[0].source_logo ||
									props.source[0].source_img ||
									props.source[0].logo_url ||
									DirectSource
								}
								width={15}
							/>
						</div>
					</OverlayTrigger>
					<Popover
						align="center"
						show={showLogo}
						onClose={() => setShowLogo(false)}
						style={{
							width: "217px",
							position: "absolute",
							top: "15px",
							height: "180px",
							padding: "15px",
						}}
					>
						<div className="d-flex">
							<img
								src={props.source[0].logo || DirectSource}
								className="mr-2"
								style={{ width: 19, height: 19 }}
							/>
							<p
								className="z__header-secondary flex-fill m-0"
								style={{
									fontSize: 12,
									fontWeight: 400,
									textTransform: "capitalize",
								}}
							>
								{props.source[0].name ||
									props.source[0].source_name}
							</p>
						</div>
						<hr className="mt-2" />
					</Popover>
				</div>
			)}
		</>
	);
};

export default GSuite;
