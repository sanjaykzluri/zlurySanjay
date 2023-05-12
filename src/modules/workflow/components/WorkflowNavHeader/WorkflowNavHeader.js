import React, { useEffect, useState } from "react";
import { Breadcrumb } from "react-bootstrap";
import { useSelector } from "react-redux";

function WorkflowNavHeader(props) {
	const pathname = useSelector((state) => state.router.location.pathname);
	return (
		<>
			<div className="NavH">
				<div className="ins-1 ">
					<Breadcrumb bsPrefix="my-bread">
						<button className="my-bread-item my-bread-itemnew">
							Workflows
						</button>
						<Breadcrumb.Item
							active
							bsPrefix="my-bread-item"
							className="d-flex text-capitalize"
							key={pathname}
						>
							{props.workflowType}
						</Breadcrumb.Item>
					</Breadcrumb>
				</div>
			</div>
		</>
	);
}

export default WorkflowNavHeader;
