import React, { useState } from "react";
import PropTypes from "prop-types";
import adobe from "../../assets/transactions/adobe.svg";
import "./Overviewins.css";
const CardList = (props) => {
	return (
		<div className="overview__b__cont">
			{props.profiles.map((profile, i) => (
				<Card key={i} profile={profile} />
			))}
		</div>
	);
};
class Card extends React.Component {
	constructor() {
		super();
		this.state = {};
	}

	render() {
		const { profile } = this.props;
		return (
			<>
				<div className="overview__bottom__card">
					<div className="ov__b__d1">
						<div className="ov__b__d1__d1">{profile.daysleft}</div>
						<div className="ov__b__d1__d2">DAYS</div>
						<div className="ov__b__d1__d3">{profile.dateofren}</div>
					</div>
					<div className="ov__b__d2">
						<div className="ov__b__d2__l">
							<img
								src={adobe}
								style={{ height: "32px", width: "32px" }}
							></img>
						</div>
						<div className="ov__b__d2__r">
							<div className="ov__b__d2__r__d1">
								{profile.applications}
							</div>
							<div className="ov__b__d2__r__d2">
								{profile.usage}
							</div>
						</div>
					</div>
					<div className="ov__b__d3"></div>
					<div className="ov__b__d4">{profile.cost}</div>
				</div>
			</>
		);
	}
}
export function OverviewBox(props) {
	const profiles = props.data;
	return (
		<>
			<div className="d-flex flex-row">
				<div>
					<CardList profiles={profiles}></CardList>
				</div>
				{/* <div style={{ marginLeft: "50px" }}>
            <CardInfo></CardInfo>
          </div> */}
			</div>
		</>
	);
}

OverviewBox.propTypes = {
	data: PropTypes.array,
	profiles: PropTypes.shape,
};
