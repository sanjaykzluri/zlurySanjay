import React, { useEffect, useState } from "react";
import { Accordion, Card, Form } from "react-bootstrap";
import caret from "components/Integrations/caret.svg";
import "./overview.css";
import { getImageWithName } from "../containers/RequestOverview";
import { UTCDateFormatter } from "utils/DateUtility";
import NumberPill from "UIComponents/NumberPill/NumberPill";
import Dropdown from "UIComponents/CustomDropdown/Dropdown";
import downArrow from "assets/down_arrow.svg";
import nocomments from "assets/employee/nocomments.svg";
import {
	getCommentsOfARequest,
	saveNewCommentOfARequest,
} from "services/api/employeeDashboard";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { Loader } from "common/Loader/Loader";
import { trackActionSegment } from "modules/shared/utils/segment";

export function CommentsSection({ id, isSuperior }) {
	const [toggleState, setToggleState] = useState({});
	const [comments, setComments] = useState();
	const [loading, setLoading] = useState(true);
	const userInfo = useSelector((state) => state.userInfo);
	useEffect(() => {
		if (loading) {
			fetchComments();
		}
	}, []);

	const fetchComments = () => {
		setLoading(true);
		getCommentsOfARequest(id).then((res) => {
			setComments(res.data);
			setLoading(false);
		});
	};
	const defaultNewComment = {
		comment: "",
		comment_type: "me",
		visible_to: "everyone",
	};
	const [newComment, setNewComment] = useState({
		...defaultNewComment,
	});

	const [savingComment, setSavingComment] = useState(false);
	const singleComment = (comment) => {
		return (
			<>
				<div className="d-flex flex-column">
					<div
						className="d-flex flex-row mt-3 align-items-center"
						style={{
							marginLeft:
								comment.user_id === userInfo.user_id
									? "auto"
									: "",
						}}
					>
						{getImageWithName(
							comment.user_name,
							comment.user_profile_image
						)}
						<div className="ml-1 grey-1 o-5 font-8 mr-1">
							{dayjs(comment?.created_at).format(
								"D MMM YYYY, HH:mm"
							)}
						</div>
						<NumberPill
							number={
								comment.visible_to === "everyone"
									? "Everyone"
									: "Only Approvers"
							}
							fontColor={"#2266E2"}
							fontSize="8px"
							fontWeight="400"
							pillBackGround={"#F4F6FA"}
							pillHeight="15px"
							borderRadius={2}
							style={{ padding: "2px 6px", width: "fit-content" }}
						/>
					</div>
					<NumberPill
						number={comment.comment}
						fontColor={"#222222"}
						fontSize="14px"
						fontWeight="400"
						pillBackGround={"#F9FAFB"}
						borderRadius={2}
						style={{
							padding: "7px 13px",
							width: "100%",
							height: "fit-content",
							wordWrap: "break-word",
							textAlign:
								comment.user_id === userInfo.user_id
									? "right"
									: "left",
						}}
						className=" mt-2"
					></NumberPill>
				</div>
			</>
		);
	};
	return (
		<>
			<Accordion className="w-100 border-0  mt-2" defaultActiveKey="0">
				<Card className="p-0 w-100 ml-auto mr-auto  ml-2 mr-2 border-0">
					<Accordion.Toggle
						as={Card.Header}
						onClick={() => {
							setToggleState(!toggleState);
						}}
						className="p-1 d-flex border-0 background-color-white flex-column"
						variant="link"
						eventKey="0"
					>
						<div
							className="d-flex w-100"
							style={{ padding: "0px 26px" }}
						>
							<div className="mr-1 bold-600 font-16 border-0">
								Comments
							</div>
							<img
								width={10}
								className="ml-auto"
								style={
									toggleState
										? {
												transform: "rotate(180deg)",
										  }
										: null
								}
								src={caret}
							></img>
						</div>
						<hr className="m-0 mt-2"></hr>
					</Accordion.Toggle>
					<Accordion.Collapse eventKey="0" className="">
						<Card.Body className="p-2 font-11 m-0 pl-0 pr-0 pb-3">
							<div
								style={{
									height: "380px",
									maxHeight: "380px",
									overflowY: "auto",
									padding: "0px 26px",
								}}
							>
								{loading ? (
									<Loader height={60} width={60}></Loader>
								) : Array.isArray(comments) &&
								  comments.length > 0 ? (
									comments.map((el) => singleComment(el))
								) : (
									<div className="d-flex w-100 h-100 align-items-center justify-content-center flex-column">
										<img src={nocomments}></img>
										<div className="font-14 grey-1">
											No comments yet!
										</div>
									</div>
								)}
							</div>
							{isSuperior && (
								<>
									<div
										className="border-top border-bottom mt-2 d-flex align-items-center"
										style={{
											backgroundColor:
												"rgba(245, 246, 249, 0.75)",
											height: "36px",
											padding: "9px 23px",
										}}
									>
										<div className="grey-1 font-10 o-5">
											To :
										</div>
										<Dropdown
											options={[
												"Everyone",
												"Only Approvers",
											]}
											onOptionSelect={(option) => {
												setNewComment({
													...newComment,
													visible_to:
														option.toLowerCase(),
												});
											}}
											optionStyle={{
												whiteSpace: "nowrap",
											}}
											toggler={
												<div className="d-flex align-items-center">
													<div className="font-12 o-5">
														{newComment.visible_to ===
														"everyone"
															? "Everyone"
															: "Only Approvers"}
													</div>
													<img
														src={downArrow}
														style={{
															marginLeft: "4px",
														}}
													/>
												</div>
											}
										/>
									</div>
								</>
							)}

							<div style={{ width: "100%" }} className="mt-2">
								<input
									required
									placeholder="Type and press Enter to Add a Comment"
									type="text"
									onChange={(e) => {
										setNewComment({
											...newComment,
											comment: e.target.value,
										});
									}}
									className="o-5 commentsection-custom-input-area"
									value={newComment?.comment}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											if (newComment.comment.length > 0) {
												setSavingComment(true);
												saveNewCommentOfARequest({
													comment: newComment.comment,
													comment_type: "me",
													request_license_id: id,
													visible_to:
														newComment.visible_to ===
														"everyone"
															? "everyone"
															: "approvers",
												}).then((res) => {
													trackActionSegment(
														"Application request - comments added",
														{
															currentCategory:
																window.location.pathname.includes(
																	"user"
																)
																	? "Employee View"
																	: "Admin View",
															currentPageName:
																"Request Summary",
														}
													);
													fetchComments();
													setNewComment({
														...defaultNewComment,
														visible_to:
															newComment.visible_to ===
															"everyone"
																? "everyone"
																: "approvers",
													});
												});
											}
										}
									}}
								/>
							</div>
						</Card.Body>
					</Accordion.Collapse>
				</Card>
			</Accordion>
		</>
	);
}
