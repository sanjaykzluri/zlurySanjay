import React, { useState } from "react";
import "./comments.css";
import message from "assets/auditlogs/message.svg";
import check from "assets/auditlogs/check.svg";
import close from "assets/auditlogs/close.svg";
import { postComment } from "services/api/auditlogs";
import { NameBadge } from "../../../../common/NameBadge";
import { useDispatch } from "react-redux";
import moment from "moment";
import { v2UpdateData } from "modules/v2PaginatedTable/redux/v2paginated-action";
export function Comments({
	comment_is,
	comment_by_profile_img,
	comment_by,
	comment_at,
	showdescription,
	id,
}) {
	const [showButton, setShowButton] = useState(true);
	const [commentText, setCommentText] = useState("");
	const dispatch = useDispatch();
	const handleChange = (e) => {
		setCommentText(e.target.value);
	};
	const createComment = async () => {
		console.log(commentText);
		const data = await postComment(id, commentText);
		dispatch(v2UpdateData("auditlogs", data));
	};
	return (
		<>
			{showdescription.includes(id) && (
				<tr>
					<td
						style={{
							border: "none",
						}}
					></td>
					<td
						colSpan="3"
						style={{
							border: "none",
						}}
					>
						{comment_is && (
							<>
								<div style={{ display: "flex" }}>
									{comment_by_profile_img ? (
										<img
											src={comment_by_profile_img}
											style={{
												padding: "3px 6px",
												borderRadius: "50%",
												width: "35px",
												height: "28px",
												background: "#FFFFFF",
											}}
										/>
									) : (
										<NameBadge
											name={comment_by}
											width={26}
											height={26}
											borderRadius={"50%"}
										/>
									)}
									<div
										style={{
											display: "flex",
											flexDirection: "column",
											width: "100%",
											marginLeft: "15px",
										}}
									>
										<div className="box arrow-left">
											<b>{comment_by}</b> added a comment{" "}
											<label
												style={{
													color: "#717171",
													fontSize: "8px",
													fontFamily: "Sora",
												}}
											>
												{moment(
													new Date(comment_at)
												).format("hh:mm:ss a")}
												,
												{moment(
													new Date(comment_at)
												).format("DD MMM YYYY")}
											</label>
										</div>
										<div className="comment_box">
											{comment_is}
										</div>
									</div>
								</div>
							</>
						)}
						{!comment_is && (
							<div>
								{showButton && (
									<button
										className="comment_button"
										onClick={() => {
											setShowButton(false);
										}}
									>
										<img
											src={message}
											style={{ padding: "3px 6px" }}
										/>
										Add comment
									</button>
								)}
								{!showButton && (
									<div className="input-with-icon">
										<input
											type="text"
											placeholder="Add Comment"
											className="input_field"
											onChange={handleChange}
										/>
										<div className="icon">
											<img
												src={close}
												style={{
													zIndex: "2",
												}}
												onClick={(e) =>
													setShowButton(true)
												}
											/>
											<img
												src={check}
												style={{
													zIndex: "2",
												}}
												onClick={createComment}
											/>
										</div>
									</div>
								)}
							</div>
						)}
					</td>
				</tr>
			)}
		</>
	);
}
