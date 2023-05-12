import React from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import ContentLoader from "react-content-loader";
import { Link } from "react-router-dom";
import adobe from "../../../assets/transactions/adobe.svg";
import "./AllApps.css";
const CardList = (props) => (
	<div className="appsbox__cont">
		{props.loading ? (
			<>
				<div className="apps__card__loading">
					<ContentLoader>
						<circle cx="48" cy="48" r="30" fill="#EBEBEB" />
						<rect
							width="108"
							height="14"
							rx="2"
							x="96"
							y="33"
							fill="#EBEBEB"
						/>
						<rect
							width="76"
							height="9"
							rx="2"
							x="96"
							y="56"
							fill="#EBEBEB"
						/>

						<rect
							width="63"
							height="9"
							rx="2"
							x="17"
							y="115"
							fill="#EBEBEB"
						/>
					</ContentLoader>
					<div className="apps__card__bottom"></div>
				</div>
				<div className="apps__card__loading">
					<ContentLoader>
						<circle cx="48" cy="48" r="30" fill="#EBEBEB" />
						<rect
							width="108"
							height="14"
							rx="2"
							x="96"
							y="33"
							fill="#EBEBEB"
						/>
						<rect
							width="76"
							height="9"
							rx="2"
							x="96"
							y="56"
							fill="#EBEBEB"
						/>

						<rect
							width="63"
							height="9"
							rx="2"
							x="17"
							y="115"
							fill="#EBEBEB"
						/>
					</ContentLoader>
					<div className="apps__card__bottom"></div>
				</div>
				<div className="apps__card__loading">
					<ContentLoader>
						<circle cx="48" cy="48" r="30" fill="#EBEBEB" />
						<rect
							width="108"
							height="14"
							rx="2"
							x="96"
							y="33"
							fill="#EBEBEB"
						/>
						<rect
							width="76"
							height="9"
							rx="2"
							x="96"
							y="56"
							fill="#EBEBEB"
						/>

						<rect
							width="63"
							height="9"
							rx="2"
							x="17"
							y="115"
							fill="#EBEBEB"
						/>
					</ContentLoader>
					<div className="apps__card__bottom"></div>
				</div>
				<div className="apps__card__loading">
					<ContentLoader>
						<circle cx="48" cy="48" r="30" fill="#EBEBEB" />
						<rect
							width="108"
							height="14"
							rx="2"
							x="96"
							y="33"
							fill="#EBEBEB"
						/>
						<rect
							width="76"
							height="9"
							rx="2"
							x="96"
							y="56"
							fill="#EBEBEB"
						/>

						<rect
							width="63"
							height="9"
							rx="2"
							x="17"
							y="115"
							fill="#EBEBEB"
						/>
					</ContentLoader>
					<div className="apps__card__bottom"></div>
				</div>
			</>
		) : (
			props.profiles.map((profile, i) => (
				<Card key={i} profile={profile} />
			))
		)}
	</div>
);

const Card = (props) => {
	const { profile } = props;

	return (
		<Link
			to={`/applications/${encodeURI(profile._id)}#overview`}
			style={{ textDecoration: "none" }}
		>
			<div className="apps__card">
				<div className="apps__card__top">
					<div className="apps__card__top__left">
						<img
							src={adobe}
							style={{ width: "60px", height: "60px" }}
						></img>
					</div>
					<div className="apps__card__top__right">
						<div className="apps__card__app">{profile.name}</div>
						<div className="apps__card__category">
							{profile.category}
						</div>
					</div>
				</div>
				<div className="apps__card__bottom">
					<div className="apps__card__bottom__1">
						<div>
							<span className="span_css">Users</span>
						</div>
						<div>
							<span className="span_css1">
								{profile.usersCount}
							</span>
						</div>
					</div>
					<div className="apps__card__bottom__1">
						<div>
							<span className="span_css">Usage</span>
						</div>
						<div>
							<span className="span_css1">{profile.usage}</span>
						</div>
					</div>
					<div className="apps__card__bottom__1">
						<div>
							<span className="span_css">Status</span>
						</div>
						<div>
							<span className="span_css1">
								{profile.isActive === true
									? "Active"
									: "Inactive"}
							</span>
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
};
export function AllAppsBox(props) {
	const profiles = props.data;
	const dispatch = useDispatch();

	const allApplications = useSelector(
		(state) => state.applications.allApplications
	);

	return (
		<>
			<div>
				<CardList
					profiles={allApplications.data}
					loading={allApplications.loading}
				></CardList>
			</div>
		</>
	);
}

AllAppsBox.propTypes = {
	data: PropTypes.array,
	profiles: PropTypes.shape,
};
