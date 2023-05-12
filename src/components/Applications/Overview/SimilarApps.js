import React, { Component } from "react";
import { Modal, Row, Col, Form, Button } from "react-bootstrap";
import "./SimilarApps.css";
import close from "../../../assets/close.svg";
import adobe from "../../../assets/transactions/adobe.svg";
import authorised from "../../../assets/applications/authorised.svg";
import needsreview from "../../../assets/applications/needsreview.svg";
import restricted from "../../../assets/applications/restricted.svg";
import InfiniteScroll from "react-infinite-scroll-component";
import AlternateOrSimilarApp from "../AlternateOrSimilarApp";
import { client } from "../../../utils/client";
import "./Overview.css";
import { getSimilarAndAlternateApps } from "../../../services/api/applications";
import { Loader } from "../../../common/Loader/Loader";
import { useDispatch, useSelector } from "react-redux";
import { APPLICATION_AUTH_STATUS } from "../../../constants";
import { AppAuthStatusIconAndTooltip } from "../../../common/AppAuthStatus";
import { unescape } from "../../../utils/common";
import { getValueFromLocalStorage } from "utils/localStorage";

export class SimilarApps extends Component {
	constructor(props) {
		super(props);
		this.state = {
			hasMore: true,
			infiniteScrollData: [],
			loaded: false,
			emptyScreen: false,
		};
		this.fetchMoreData = this.fetchMoreData.bind(this);
		this.cancelToken = React.createRef();
		this.similarAndAlternateApps = {};
		this.alternateContentLoader = [];
		for (var i = 0; i < 2; i++) {
			this.alternateContentLoader.push(
				<AlternateOrSimilarApp loaded={this.state.loaded} />
			);
		}
		this.loader = (
			<div className="option__card__WFM">
				<Loader height={60} width={60}></Loader>
			</div>
		);
		this.emptyList = this.emptyList.bind(this);
	}

	componentDidMount() {
		this.cancelToken.current = client.CancelToken.source();
		getSimilarAndAlternateApps(this.props.appId, this?.cancelToken?.current)
			.then((res) => {
				if (res.apps && !res.apps.error) {
					this.similarAndAlternateApps = res.apps;
					this.setState({
						loaded: true,
						infiniteScrollData:
							this.similarAndAlternateApps.alternate_apps?.slice(
								0,
								20
							),
					});
				} else {
					this.setState({
						loaded: true,
						emptyScreen: true,
					});
				}
			})
			.catch((err) =>
				console.error(
					"Error fetching similar & alternative apps list",
					err
				)
			);
		//Segment Implementation

		window.analytics.page(
			"Applications",
			"Application-Overview; Similar Apps",
			{
				app_name: this.props.application?.app_name,
				app_id: this.props.application?.app_id,
				orgId: getValueFromLocalStorage("userInfo")?.org_id || "",
				orgName: getValueFromLocalStorage("userInfo")?.org_name || "",
			}
		);
	}

	fetchMoreData() {
		if (
			this.state.infiniteScrollData.length >=
			this.similarAndAlternateApps.alternate_apps?.length
		) {
			this.setState({ hasMore: false });
			return;
		}
		setTimeout(() => {
			var from = this.state.infiniteScrollData.length;
			var to = this.state.infiniteScrollData.length + 20;
			this.setState({
				infiniteScrollData: [
					...this.state.infiniteScrollData,
					...this.similarAndAlternateApps.alternate_apps?.slice(
						from,
						to
					),
				],
			});
		}, 1500);
	}

	emptyList(listName) {
		return (
			<div className="empty-lower mr-auto ml-auto">
				No {listName} apps found
			</div>
		);
	}

	render() {
		const { appstatus } = this.props;
		return (
			<>
				<div className="modal-backdrop show"></div>
				<div
					show={this.props.show}
					onHide={this.props.onHide}
					className="addContractModal__TOP"
					style={{ height: "100%" }}
				>
					<div className="similarapps__d1">
						Similar Apps
						<img
							src={close}
							onClick={this.props.onHide}
							style={{ cursor: "pointer" }}
						></img>
					</div>
					<hr style={{ margin: "0px 10px" }}></hr>
					<div className="similarapps__d2">
						<div className="similarapps__d2__d1">
							<img src={unescape(this.props.appLogo)}></img>
						</div>
						<div className="similarapps__d2__d2">
							<div className="similarapps__d2__d2__d1">
								{this.props.appName}
								<AppAuthStatusIconAndTooltip
									className="ml-1 pb-1"
									height={14}
									width={14}
									authStatus={appstatus}
								/>
							</div>
							<div className="similarapps__d2__d2__d2">
								{this.props.appSmallDescription}
							</div>
						</div>
					</div>
					<div className="similarapps__d3 d-block" id="scrollableDiv">
						<div className="similarapps__d3__d1">
							Similar to{" "}
							{this.state.loaded &&
							this.similarAndAlternateApps.similar_apps?.length >
								0
								? this.similarAndAlternateApps.similar_apps
										?.length
								: null}{" "}
							Apps you use
						</div>
						<hr className="heading_border"></hr>
						{this.state.loaded &&
						this.similarAndAlternateApps.similar_apps?.length >
							0 ? (
							this.similarAndAlternateApps.similar_apps.map(
								(i, index) => (
									<AlternateOrSimilarApp
										name={i.name}
										image={i.image}
										small_description={i.small_description}
										appId={i._id}
										loaded={this.state.loaded}
										show_view_button={true}
									/>
								)
							)
						) : this.state.emptyScreen ||
						  this.similarAndAlternateApps.similar_apps?.length ==
								0 ? (
							<>{this.emptyList("Similar")}</>
						) : (
							<AlternateOrSimilarApp loaded={this.state.loaded} />
						)}
						<div className="similarapps__d3__d1 mt-3">
							Alternative Apps
						</div>
						<hr className="heading_border"></hr>
						{this.state.loaded &&
						this.similarAndAlternateApps.alternate_apps?.length >
							0 ? (
							<InfiniteScroll
								dataLength={
									this.state.infiniteScrollData.length
								}
								next={this.fetchMoreData}
								hasMore={this.state.hasMore}
								loader={this.loader}
								scrollableTarget="scrollableDiv"
								scrollThreshold="50px"
								style={{
									height: "unset",
									overflow: "unset",
								}}
							>
								{this.state.infiniteScrollData.map(
									(i, index) => (
										<AlternateOrSimilarApp
											name={i.name}
											image={i.image}
											small_description={
												i.small_description
											}
											appId={i._id}
											loaded={this.state.loaded}
											show_view_button={false}
										/>
									)
								)}
							</InfiniteScroll>
						) : this.state.emptyScreen ||
						  this.similarAndAlternateApps.alternate_apps?.length ==
								0 ? (
							<>{this.emptyList("Alternative")}</>
						) : (
							<>
								{this.alternateContentLoader}
								{this.loader}
							</>
						)}
					</div>
				</div>
			</>
		);
	}
}
