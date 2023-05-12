import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import "./Overviewins.css";
import { Link } from "react-router-dom";
import { unescape } from "../../utils/common";
import { getValueFromLocalStorage } from "utils/localStorage";

const renderTooltip = (props, data) => (
	<Tooltip className="my-tooltip" bsPrefix="my-tooltip" {...props}>
		<div className="my-tooltip-div1">
			<img
				src={unescape(data.app_logo)}
				style={{
					height: "auto",
					width: "13px",
					borderRadius: "50%",
				}}
			></img>
			<span id="my-tooltip-text1">{data.app_name}</span>
		</div>
		<div className="my-tooltip-div2">
			<div className="my-tooltip-div2-div1">
				{isNaN(parseInt(data?.app_usage_value))
					? 0
					: data?.app_usage_value?.toFixed(2)}
				%
			</div>
			<div className="my-tooltip-div2-div2">usage</div>
		</div>
	</Tooltip>
);

const BarimageContent = (props) => {
	const { graphdata } = props;
	function clickedOnApp(id, name) {
		//Segment Implementation
		window.analytics.track(
			"Clicked on Application in Top Apps by Usage Small Graph",
			{
				currentCategory: "Overview",
				currentPageName: "Overview-HomeScreen",
				clickedAppId: id,
				clickedAppName: name,
				orgId: getValueFromLocalStorage("userInfo")?.org_id || "",
				orgName: getValueFromLocalStorage("userInfo")?.org_name || "",
			}
		);
	}
	return (
		<div className="bar__image__content">
			{graphdata.map((data) => (
				<OverlayTrigger
					placement="top"
					overlay={renderTooltip(props, data)}
				>
					<div className="appUsage">
						<Link
							to={`/applications/${encodeURI(
								data.app_id
							)}#overview`}
							style={{
								height: "max-content",
								display: "contents",
							}}
							onClick={() =>
								clickedOnApp(data.app_id, data.app_name)
							}
						>
							<img
								src={unescape(data.app_logo)}
								className="img__bar__ov"
							></img>
						</Link>
					</div>
				</OverlayTrigger>
			))}
		</div>
	);
};

const Bar = ({ percent }) => {
	return (
		<div className="bar__content" style={{ width: `${percent}%` }}></div>
	);
};

export class GraphBarHor extends React.Component {
	entering = (e) => {
		e.children.placement = "100px";
	};
	renderbars() {
		const { graphdata } = this.props;

		let max = 100;
		for (const data of graphdata) {
			if (!isNaN(data?.app_usage_value) && data?.app_usage_value > max) {
				max = data?.app_usage_value;
			}
		}

		return graphdata.map((data) => {
			const percent = data.app_usage_value;
			return (
				<>
					<OverlayTrigger
						placement="top"
						onEntering={this.entering}
						overlay={renderTooltip(this.props, data)}
					>
						<div
							className="outside__bar__cont"
							style={{ width: "100%" }}
						>
							<Bar percent={(percent / max) * 100}></Bar>
						</div>
					</OverlayTrigger>
				</>
			);
		});
	}
	render() {
		const { graphdata } = this.props;
		return (
			<>
				<div className="overv__graph__cont">
					<div className="overv__graph">
						<BarimageContent
							graphdata={graphdata}
						></BarimageContent>
						<div className="bar__lines__cont">
							{this.renderbars()}
						</div>
					</div>
				</div>
			</>
		);
	}
}
