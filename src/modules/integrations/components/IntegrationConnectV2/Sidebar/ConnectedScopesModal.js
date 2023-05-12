import React from "react";
import closeIcon from "assets/close.svg";
import IntegrationHowTo from "../../IntegrationHowTo";
import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import ScopeDetailCard from "../../scopeDetailCard";

const ConnectedScopesModal = ({
	integration,
	setShowConnectedScopesSidebar,
	scopesData,
}) => {
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
							<GetImageOrNameBadge
								url={integration?.logo}
								name={integration?.name}
								width="26px"
								height="26px"
							/>
							<span className="ml-2">{integration?.name}</span>
							<span className="ml-2 grey-1">
								Connected Scopes
							</span>
						</div>
					</div>
					<div style={{ float: "right" }}>
						<img
							alt="Close"
							onClick={() => setShowConnectedScopesSidebar(false)}
							src={closeIcon}
							className="cursor-pointer mr-4"
						/>
					</div>
				</div>
				<hr className="mb-0 mt-0 ml-3 mr-3" />
				<div className="ml-4 mt-2 __show_all font-12 color-gray-2">
					Showing {scopesData?.length > 0 ? scopesData?.length : 0}{" "}
					scopes
				</div>
				<div className="px-3 py-2">
					<div className="z__scope_container">
						{Array.isArray(scopesData) &&
						scopesData.length > 0 &&
						scopesData?.[0]?.scope_name ? (
							scopesData?.map((singlePermission, index) => (
								<ScopeDetailCard
									scope={singlePermission}
									index={index}
									showScopeState={true}
									width="100%"
									showDescription={true}
									showFeatures={true}
									numberOfItems={3}
									showConnectedScopes={true}
								/>
							))
						) : (
							<div align="center" className="my-2">
								No scopes here{" "}
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default ConnectedScopesModal;
