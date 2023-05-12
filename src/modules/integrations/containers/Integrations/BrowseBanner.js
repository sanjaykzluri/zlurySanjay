import React from "react";
import browseIcon from "assets/browse-icon.svg";
import browseIconWhite from "assets/integrations/catalog-pointer-white.svg";
import { Button } from "UIComponents/Button/Button";
import { useHistory } from "react-router-dom";
import RoleContext from "services/roleContext/roleContext";
import { useContext } from "react";

export const BrowseBanner = ({ imageBanner = false }) => {
	const history = useHistory();
	const { partner } = useContext(RoleContext);
	return imageBanner ? (
		<div
			style={{
				alignItems: "left",
				color: "white",
				flexDirection: "column",
			}}
			onClick={() => {
				history.push("/integrations/catalog");
			}}
			className="flex catalog-banner-full p-2 mt-3 w-100 cursor-pointer"
		>
			<div
				style={{
					position: "absolute",
					left: "10%",
					fontSize: "25px",
					color: "rgba(72, 72, 72, 1)",
				}}
				className="mt-4 font-500"
			>
				Bring all your SaaS into {partner?.name}
			</div>
			<div
				style={{
					position: "absolute",
					left: "10%",
					fontSize: "15px",
					color: "rgba(113, 113, 113, 1)",
				}}
				className="mt-6"
			>
				Explore upto 650+ integrations
			</div>

			<div
				style={{ position: "absolute", left: "10%" }}
				className="mr-2 mt-8"
			>
				<Button
					type="primary"
					onClick={() => {
						history.push("/integrations/catalog");
					}}
				>
					Browse Catalog
					<img
						width={"15px"}
						className="ml-2"
						src={browseIconWhite}
					/>
				</Button>
			</div>
		</div>
	) : (
		<>
			<div
				style={{
					justifyContent: "space-between",
					alignItems: "center",
				}}
				className="flex catalog-banner p-2 mt-3 w-100"
			>
				<div className="ml-7">
					Bring all your SaaS into {partner?.name}
				</div>
				<div className="mr-2">
					<Button
						type="link"
						onClick={() => {
							history.push("/integrations/catalog");
						}}
						className="font-500"
					>
						Browse Catalog
						<img width={"15px"} className="ml-2" src={browseIcon} />
					</Button>
				</div>
			</div>
		</>
	);
};
