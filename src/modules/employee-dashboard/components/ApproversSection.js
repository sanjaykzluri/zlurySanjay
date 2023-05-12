import React, { useCallback, useEffect, useState } from "react";
import copy from "assets/applications/copy.svg";
import { OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
import { getApproversOfARequest } from "services/api/employeeDashboard";
import noapprovers from "assets/employee/noapprovers.svg";
import NumberPill from "UIComponents/NumberPill/NumberPill";
import GetImageOrNameBadge from "common/GetImageOrNameBadge";
import { useSelector } from "react-redux";
import { TriggerIssue } from "utils/sentry";
import { debounce } from "underscore";
import RequestApprovers from "modules/workflow/components/AutomationRuleSidebar/Approvers";

export function ApproversSection({
	approversFromState = [],
	reqData,
	setReqData,
}) {
	const [loading, setLoading] = useState(true);
	const [approvers, setApprovers] = useState([]);
	const [copyText, setcopyText] = useState("Copy Email");
	const [result, setResult] = useState({});
	const userInfo = useSelector((state) => state.userInfo);
	useEffect(() => {
		if (approversFromState?.length) {
			setApprovers(approversFromState);
			setLoading(false);
		}
	}, []);

	const fetchApprovers = async (reqData) => {
		setLoading(true);

		let reqBody = {
			org_id: userInfo.org_id,

			facts: {
				user_id: userInfo.user_id,
				license_name: reqData.license_name || "",
				cost_per_item: {
					amount: reqData.license_cost || "",
				},
				application_id: reqData.app_id,
			},
			trigger: "requestlicenses|insert",
		};
		try {
			const res = await getApproversOfARequest(reqBody);
			if (res) {
				setLoading(false);
				setApprovers(res.approvers);
				setReqData({ ...reqData, ...res });
				setResult(res);
			}
		} catch (err) {
			setLoading(false);
			setApprovers([]);
			let tempData = { ...reqData };
			if (Object.keys(result) && Object.keys(result).length > 0) {
				Object.keys(result).forEach((el) => {
					delete tempData[el];
				});
				setReqData(tempData);
			}
			TriggerIssue("error while fetching Approvers of a request", err);
		}
	};

	const fn = useCallback(debounce(fetchApprovers, 1000), []);
	useEffect(() => {
		if (!approversFromState.length && reqData.app_id) {
			fn(reqData);
			// if (fn) fn.cancel();
			// setLoading(false);
			// setApprovers([]);
			// let tempData = { ...reqData };
			// if (Object.keys(result) && Object.keys(result).length > 0) {
			// 	Object.keys(result).forEach((el) => {
			// 		delete tempData[el];
			// 	});
			// 	setReqData(tempData);
			// }
		}
	}, [reqData.license_name, reqData.license_cost, reqData.app_id]);
	return (
		<>
			<div className="d-flex flex-column">
				<div className="font-16 bold-600 black-1 mt-5">Approvers</div>
				<div className="mt-1 font-12 grey-1">
					These approvers are tentatively rendered based on your
					request.
				</div>
				<hr style={{ margin: "13px 0px 9px" }}></hr>
				<div className="d-flex flex-column w-100">
					{loading ? (
						<>
							<div
								className="d-flex flex-column align-items-center justify-content-center"
								style={{ height: "208px" }}
							>
								<Spinner
									animation="border"
									role="status"
									variant="primary"
									size="sm"
									className="ml-2"
									style={{ borderWidth: 2 }}
								>
									<span className="sr-only">Loading...</span>
								</Spinner>
								<div className="font-14 mt-3">
									Fetching approvers ...
								</div>
							</div>
						</>
					) : Array.isArray(approvers) && approvers.length > 0 ? (
						<>
							<RequestApprovers
								previousApprovers={approvers}
								updateApprovers={() => null}
								isStatic
							/>

							{/* {approvers.map((el, index) => (
								<div className="d-flex align-items-center ml-2 mb-2">
									<NumberPill
										number={index + 1}
										fontColor={"#2266E2"}
										fontSize={12}
										fontWeight={700}
										pillBackGround={
											"rgba(90, 186, 255, 0.1)"
										}
										borderRadius={"50%"}
										pillHeight={24}
										pillWidth={10}
										style={{
											width: "24px",
											marginTop: "2px",
											marginRight: "4px",
										}}
									/>
									<div
										className="w-100 border-radius-4 d-flex "
										style={{
											background: "#F5F6F9",
											height: "53px",
											padding: "9px 12px",
										}}
									>
										<GetImageOrNameBadge
											name={el.user_name}
											url={el.user_logo}
											width={21}
											height={21}
											borderRadius="50%"
										/>
										<div className="d-flex flex-column ml-2">
											<div className="grey font-14 d-flex align-items-center">
												{el.user_name}
												<OverlayTrigger
													placement="top"
													overlay={
														<Tooltip>
															{copyText}
														</Tooltip>
													}
												>
													<div
														className={`grey-1 ml-2 o-5 font-8 cursor-pointer`}
														onClick={() => {
															navigator.clipboard.writeText(
																el.user_email
															);
															setcopyText(
																"Copied"
															);
															setTimeout(() => {
																setcopyText(
																	"Copy Email"
																);
															}, 1000);
														}}
													>
														<img
															src={copy}
															alt="Copy Email"
														/>
													</div>
												</OverlayTrigger>
											</div>
											<div className="o-5 grey-1 font-12">
												{el.designation}
											</div>
										</div>
									</div>
								</div>
							))}  */}
						</>
					) : (
						<>
							<div
								className="d-flex flex-column align-items-center justify-content-center"
								style={{ height: "208px" }}
							>
								<img src={noapprovers}></img>
								<div className="font-14 mt-3">
									No approvers found for this request.
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</>
	);
}
