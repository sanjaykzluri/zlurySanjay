import React from "react";
import PropTypes from "prop-types";
import adobe from "../../../assets/transactions/adobe.svg";
import "./ApplicationDep.css";
const CardList = (props) => (
	<div className="appsbox__cont">
		{props.profiles.map((profile, i) => (
			<Card key={i} profile={profile} />
		))}
	</div>
);

class Card extends React.Component {
	render() {
		const { profile } = this.props;
		return (
			<div className="apps__card">
				<div className="apps__card__top">
					<div className="apps__card__top__left">
						<img
							src={adobe}
							style={{ width: "60px", height: "60px" }}
						></img>
					</div>
					<div className="apps__card__top__right">
						<div className="apps__card__app">
							{profile.applications}
						</div>
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
							<span className="span_css1">{profile.users}</span>
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
							<span className="span_css1">{profile.status}</span>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
export function AllAppsBox(props) {
	const profiles = props.data;
	return (
		<>
			<div>
				<CardList profiles={profiles}></CardList>
			</div>
		</>
	);
}

AllAppsBox.propTypes = {
	data: PropTypes.array,
	profiles: PropTypes.shape,
};
