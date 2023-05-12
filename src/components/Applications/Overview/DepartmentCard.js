import React from "react";
import { Link } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { kFormatter } from "constants/currency";

function DepartmentCard(props) {
	return (
		<div
			className="overview__middle__left__bottom__newgraph__d2__box"
			style={{ ...props.style }}
		>
			<div className="overview__middle__left__bottom__newgraph__d2__box__d1 ml-2 mr-2">
				<div
					className="overview__circle__depsplit"
					style={{
						backgroundColor: props.color,
					}}
				></div>
			</div>
			<div className="overview__middle__left__bottom__newgraph__d2__box__d2">
				<div className="overview__middle__left__bottom__newgraph__d2__box__d2__d1">
					<Link
						to={`/departments/${props.element.department_id}#users`}
						className="overview__middle__left__bottom__newgraph__d2__box__d2__d1__left truncate_2lines table-link"
					>
						<OverlayTrigger
							placement="left-start"
							overlay={
								<Tooltip>
									{props.element.department_name_path || props.element.department_name}
								</Tooltip>
							}
						>
							<div className="truncate_name">
								{props.element.department_name_path || props.element.department_name}
							</div>
						</OverlayTrigger>
					</Link>

					<div className="overview__middle__left__bottom__newgraph__d2__box__d2__d1__right">
						{isNaN(props.element.department_split)
							? 0
							: Number(props.element.department_split)?.toFixed(
									0
							  )}
						%
					</div>
				</div>

				<div className="overview__middle__left__bottom__newgraph__d2__box__d2__d2 d-flex justify-content-between pr-2">
					<div>{props.element.department_users} Users</div>
					<div>{kFormatter(props.element.YTD_spend)}</div>
				</div>
			</div>
		</div>
	);
}

export default DepartmentCard;
