import React, { useState } from "react";
import check from "../../../../assets/icons/green-check.svg";
import down from "../../../../assets/icons/angle-down.svg";
import bdown from "../../../../assets/bluearrowdown.svg";
import "./IntegrationPermisionCard.css";
import RoleContext from "services/roleContext/roleContext";
import { useContext } from "react";

export function IntegrationPermisionCard(props) {
	const [indexOpen, setIndexOpen] = useState(null);
	const [showExistingPermission, setShowExistingPermission] = useState(false);
	const { partner } = useContext(RoleContext);

	const toggleBlock = (index) => {
		if (indexOpen === index) {
			setIndexOpen(null);
		} else {
			setIndexOpen(index);
		}
	};

	const permissionList =
		Array.isArray(props.permissions) &&
		props.permissions.map((permission, index) => (
			<li
				className={
					props.disableToggle
						? "d-flex mt-3 align-items-start"
						: "d-flex mt-3 align-items-start pointer"
				}
				key={index}
				onClick={() => {
					toggleBlock(index);
				}}
			>
				<img src={check} className="mr-2 mt-1" />
				<div className="flex-fill">
					<h4 className="black-1 bold-400 font-13">
						{permission.title}
						<span className="ml-2 pl-2 pr-2 text-uppercase font-10 grey-1 o-5 border-radius-4 d-inline-block">
							{permission.scope}
						</span>
					</h4>
					{(indexOpen === index || props.disableToggle) && (
						<p className="grey font-12 o-8">
							{permission.description}
						</p>
					)}
				</div>
				{!props.disableToggle && (
					<img src={down} className="mr-2 mt-1" />
				)}
			</li>
		));

	const addScopesList =
		props.scopeDetails &&
		Array.isArray(props.scopeDetails.missingScopes) &&
		props.scopeDetails.missingScopes.map((scope, index) => (
			<li className="d-flex mt-3 align-items-start" key={index}>
				<img src={check} className="mr-2 mt-1" />
				<div className="flex-fill">
					<h4 className="black-1 bold-400 font-13">
						{scope}
						<span className="ml-2 pl-2 pr-2 text-uppercase font-10 grey-1 o-5 border-radius-4 d-inline-block">
							WRITE
						</span>
					</h4>
				</div>
			</li>
		));

	const addedScopesList =
		props.scopeDetails &&
		Array.isArray(props.scopeDetails.scopesPresent) &&
		props.scopeDetails.scopesPresent.map((scope, index) => (
			<li className="d-flex mt-3 align-items-start" key={index}>
				<img src={check} className="mr-2 mt-1" />
				<div className="flex-fill">
					<h4 className="black-1 bold-400 font-13">{scope}</h4>
				</div>
			</li>
		));

	return (
		<>
			{props.permissions.length > 0 || addScopesList?.length > 0 ? (
				<>
					<div className={props.className}>
						<h4 className="font-14 blac-1">
							{partner?.name} would be able to:
						</h4>
						<ul className="z_i_app_info_permissions p-0 ">
							{addScopesList?.length > 0
								? addScopesList
								: permissionList}
						</ul>
					</div>
					{addedScopesList?.length > 0 && (
						<>
							<div
								className={`z_i_app_existing_permissions border-radius-4  ml-n4 mr-n4 position-relative ${
									showExistingPermission
										? "show-permissions p-4"
										: "hide-permissions"
								} `}
							>
								{showExistingPermission && (
									<>
										<h4 className="font-14 blac-1">
											Existing Permission
										</h4>
										<ul className="z_i_app_info_permissions p-0 ">
											{addedScopesList}
										</ul>
									</>
								)}
								<div
									onClick={() => {
										setShowExistingPermission(
											!showExistingPermission
										);
									}}
									className="position-absolute z_hide_added_permissions p-2  pl-4 pr-4"
								>
									<p className="primary-color font-12 m-0 pointer">
										{showExistingPermission
											? "Hide "
											: "View "}
										existing permission (
										{addedScopesList?.length})
										{!showExistingPermission && (
											<img src={bdown} className="ml-2" />
										)}
									</p>
								</div>
							</div>
						</>
					)}
				</>
			) : null}
		</>
	);
}
