import React from "react";
import closeIcon from "assets/close.svg";
import IntegrationHowTo from "../../IntegrationHowTo";
import GetImageOrNameBadge from "common/GetImageOrNameBadge";

const IntegrationHowToModal = ({ integration, setShowHowToSidebar }) => {
	return (
		<>
			<div
				style={{ overflowY: "scroll" }}
				className="addContractModal__TOP h-100 z__i_sidebar"
			>
				<div
					style={{
						justifyContent: "space-between",
						alignItems: "center",
					}}
					className="flex"
				>
					<div
						style={{ alignItems: "center" }}
						className="flex flex-row py-4 flex-fill"
					>
						<div className="contracts__heading ml-1 pl-4 text-truncate">
							<span className="mr-2">How to Connect</span>
							<GetImageOrNameBadge
								url={integration?.logo}
								name={integration?.name}
								width="26px"
								height="26px"
							/>
							<span className="ml-2">{integration?.name}</span>
						</div>
					</div>
					<div style={{ float: "right" }}>
						<img
							alt="Close"
							onClick={() => setShowHowToSidebar(false)}
							src={closeIcon}
							className="cursor-pointer mr-4"
						/>
					</div>
				</div>
				<hr className="mb-0 mt-0 ml-3 mr-3" />
				<div className="px-3 py-2">
					<IntegrationHowTo
						showTitle={false}
						intId={integration.id}
						integration={integration}
					/>
				</div>
			</div>
		</>
	);
};

export default IntegrationHowToModal;
