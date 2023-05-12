import React, { useContext, useState } from "react";
import RoleContext from "../../../../../services/roleContext/roleContext";
import { Popover } from "../../../../../UIComponents/Popover/Popover";
import "./GSuite.css";

const GSuite = (props) => {
	const googleLogo =
		"https://zluri-assets-new.s3-us-west-1.amazonaws.com/files/assets/logos/5fc4ac5bc70ae4043c76db20.png";

	const [showGoogle, setShowGoogle] = useState(false);
	const { isViewer } = useContext(RoleContext);

	return (
		<div>
			<div
				onClick={() => {
					if (!isViewer) {
						setShowGoogle((val) => !val);
					}
				}}
				style={{ margin: 4 }}
				className="cursor-pointer"
			>
				<img src={googleLogo} width={15} />
			</div>
			<Popover
				align="center"
				show={showGoogle}
				onClose={() => setShowGoogle(false)}
				style={{
					width: "217px",
					transform: "translateX(-39%)",
					left: "unset",
					height: "180px",
					padding: "15px",
				}}
			>
				<div className="d-flex">
					<img
						src={googleLogo}
						className="mr-2"
						style={{ width: 19, height: 19 }}
					/>
					<p
						className="z__header-secondary flex-fill m-0"
						style={{ fontSize: 12, fontWeight: 400 }}
					>
						Google Workspace
					</p>
				</div>
				<hr className="mt-2" />
			</Popover>
		</div>
	);
};

export default GSuite;
