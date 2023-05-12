import React, { Component, useState, useEffect, useContext } from "react";
import "./ContactDetails.css";
import downvector from "../../../../../../../assets/applications/downvector.svg";
import email from "../../../../../../../assets/applications/email.svg";
import copy from "../../../../../../../assets/applications/copy.svg";
import ContentLoader from "react-content-loader";
import { NameBadge } from "../../../../../../../common/NameBadge";
export function ContactDetails(props) {
	const vendor = props.vendor;
	const [show, setShow] = useState(true);

	return (
		<>
			{props.loading ? (
				<div className="contactdetails__cont">
					<div className="contactdetails__cont__d1 pr-1">
						Contact Details
						<img
							src={downvector}
							className="cursor-pointer contact_details_arrow"
							height={6}
							width={12}
						></img>
					</div>
					<div className="contactdetails__cont__d2" hidden={show}>
						<div className="contactdetails__card">
							<div className="contactdetails__card__d1">
								<ContentLoader
									style={{ marginRight: 8 }}
									width={31}
									height={31}
									viewBox="0 0 31 31"
								>
									<circle
										cx="15"
										cy="15"
										r="15"
										fill="#EBEBEB"
									/>
								</ContentLoader>
								<div className="contactdetails__card__d1__d2">
									<div className="contactdetails__card__d1__d2__d1">
										<ContentLoader width={193} height={10}>
											<rect
												width={193}
												height={10}
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
									<div className="contactdetails__card__d1__d2__d2">
										<ContentLoader width={134} height={10}>
											<rect
												width={134}
												height={10}
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								</div>
							</div>
						</div>
						<div className="contactdetails__card">
							<div className="contactdetails__card__d1">
								<ContentLoader
									style={{ marginRight: 8 }}
									width={31}
									height={31}
									viewBox="0 0 31 31"
								>
									<circle
										cx="15"
										cy="15"
										r="15"
										fill="#EBEBEB"
									/>
								</ContentLoader>
								<div className="contactdetails__card__d1__d2">
									<div className="contactdetails__card__d1__d2__d1">
										<ContentLoader width={193} height={10}>
											<rect
												width={193}
												height={10}
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
									<div className="contactdetails__card__d1__d2__d2">
										<ContentLoader width={134} height={10}>
											<rect
												width={134}
												height={10}
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			) : (
				<>
					{vendor && vendor.contact_details?.length > 0 && (
						<div className="contactdetails__cont">
							<div className="contactdetails__cont__d1">
								Contact Details{" "}
								<img
									src={downvector}
									onClick={() => setShow(!show)}
									className={`cursor-pointer contact_details_arrow ${
										show && "contact_details_arrow_on_show"
									}`}
									height={6}
									width={12}
								></img>
							</div>
							<div
								className="contactdetails__cont__d2"
								hidden={!show}
							>
								{vendor.contact_details.map((el, idx) => (
									<div
										key={idx}
										className="contactdetails__card"
									>
										<div className="contactdetails__card__d1">
											<NameBadge
												fontSize={12}
												name={el.name}
												borderRadius={31}
												width={31}
											></NameBadge>
											<div className="contactdetails__card__d1__d2">
												<div className="contactdetails__card__d1__d2__d1">
													{el.name}
												</div>
												<div className="contactdetails__card__d1__d2__d2">
													{el.designation}
												</div>
											</div>
											<div className="contactdetails__card__d1__d3">
												{el.type}
											</div>
										</div>
										<div className="contactdetails__card__d2">
											✉️
											<div className="contactdetails__card__d2__d2">
												{el.email}
											</div>
											<img
												src={copy}
												className="cursor-pointer"
												onClick={() =>
													navigator.clipboard.writeText(
														el.email
													)
												}
											></img>
										</div>
										{el.phone && (
											<div className="contactdetails__card__d3">
												📞
												<div className="contactdetails__card__d2__d2">
													{el.phone.replace("-", "")}
												</div>
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					)}
				</>
			)}
		</>
	);
}
