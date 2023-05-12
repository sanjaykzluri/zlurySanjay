import React, { useState, useEffect, useRef } from "react";
import "./AppInfo.css";
import ContentLoader from "react-content-loader";
import { grey, white } from "color-name";
import adobe from "../../../assets/transactions/adobe.svg";
import { IntegrationTag } from "../Tag";
import { Helmet } from "react-helmet";
import informationIcon from "../../../assets/information-circle.svg";
import { Button } from "../../../UIComponents/Button/Button";
import { useHistory } from "react-router";
import { getValueFromLocalStorage } from "utils/localStorage";

const CardList = (props) => {
	const [chosen, setChosen] = useState();
	return (
		<div className="appsinfo__cardlist">
			{props.cards.map((profile, i) => (
				<Card
					profile={profile}
					key={i}
					active={i === chosen}
					onClick={() => setChosen(i)}
				/>
			))}
		</div>
	);
};
const CardListLoading = (props) => {
	return (
		<div className="appsinfo__cardlist">
			<CardLoading />
			<CardLoading />
			<CardLoading />
		</div>
	);
};
class CardLoading extends React.Component {
	render() {
		return (
			<>
				<div className="appsinfo__card">
					<div className="appsinfo__card__top">
						<div className="appsinfo__card__top__l">
							<ContentLoader height={38} width={38}>
								<circle cx="19" cy="19" r="19" fill="#EBEBEB" />
							</ContentLoader>
						</div>
						<div className="appsinfo__card__top__r">
							<ContentLoader height={14} width={108}>
								<rect
									width="108"
									height="14"
									rx="2"
									fill="#EBEBEB"
								/>
							</ContentLoader>
						</div>
					</div>
					<div className="apps__info__bottom">
						<ContentLoader height={9} width={170}>
							<rect
								width="170"
								height="9"
								rx="2"
								fill="#EBEBEB"
							/>
						</ContentLoader>
						<br />
						<ContentLoader
							height={9}
							width={108}
							style={{ marginTop: "10px" }}
						>
							<rect
								width="108"
								height="9"
								rx="2"
								fill="#EBEBEB"
							/>
						</ContentLoader>
					</div>
					<div className="appsinfo__card__bottom"></div>
				</div>
			</>
		);
	}
}
class Card extends React.Component {
	render() {
		const profile = this.props.profile;
		return (
			<>
				<div className="appsinfo__card">
					<div className="appsinfo__card__top">
						<div className="appsinfo__card__top__l">
							<img
								src={adobe}
								style={{ height: "32px", width: "32px" }}
							></img>
						</div>
						<div className="appsinfo__card__top__r">Adobe CC</div>
					</div>
					<div className="apps__info__bottom">
						Enim culpa ullamco ea laborum enim deserunt cillum dolor
						tempor dolore in est in et.
					</div>
					<div className="appsinfo__card__bottom"></div>
				</div>
			</>
		);
	}
}

export function AppInfo(props) {
	const pathname = window.location.pathname;
	const id = pathname.split("/")[2];
	const { info, loading } = props;
	const isConnected = info?.integration_status === "connected";
	const connectDisconnectUrl = isConnected
		? info.integration_disconnect_url
		: info.integration_connect_url;
	const formRef = useRef();
	const history = useHistory();

	useEffect(() => {
		window.addEventListener("message", (e) => {
			if (e.data.status === "success") {
				props.fetchIntegrations();
			}
		});
	}, []);

	const handleConnectDisconnectClick = () => {
		const userInfo = getValueFromLocalStorage("userInfo");
		const orgId = userInfo.org_id;
		const userId = userInfo.user_id;

		const tokenData = getValueFromLocalStorage("token");
		const token = `Bearer ${tokenData}`;

		const f = formRef.current;

		f.orgId.value = orgId;
		f.integrationId.value = info.integration_id;
		f.Authorization.value = token;
		f.userId.value = userId;
		const popup = window.open("", "popupWindow");
		f.submit();
	};
	return (
		<>
			{loading ? (
				<>
					<div className="INT__appinfo__cont">
						<div className="appinfo__l">
							<div className="appinfo__l__d1">
								<div className="appinfo__l__d1__l">
									<ContentLoader height={38} width={38}>
										<circle
											cx="19"
											cy="19"
											r="19"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								</div>
								<div
									className="appinfo__l__d1__r"
									style={{ marginLeft: "10px" }}
								>
									<div className="appinfo__l__d1__r__text1">
										<ContentLoader height={14} width={108}>
											<rect
												width="108"
												height="14"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
									<div className="appinfo__l__d1__r__text2">
										<ContentLoader height={9} width={76}>
											<rect
												width="76"
												height="9"
												rx="2"
												fill="#EBEBEB"
											/>
										</ContentLoader>
									</div>
								</div>
							</div>
							<hr style={{ margin: "10px 0px 16px" }}></hr>
							<div className="appinfo__l__d2">
								<ContentLoader height={34} width={136}>
									<rect
										width="136"
										height="34"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
								<ContentLoader
									height={34}
									width={94}
									style={{ marginLeft: "20px" }}
								>
									<rect
										width="94"
										height="34"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
							<div className="appinfo__l__d3">
								<ContentLoader height={9} width={76}>
									<rect
										width="76"
										height="9"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
							<div className="appinfo__l__d4">
								<ContentLoader height={12} width={108}>
									<rect
										width="108"
										height="12"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
							<div className="appinfo__l__d3">
								<ContentLoader height={9} width={76}>
									<rect
										width="76"
										height="9"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
							<div className="appinfo__l__d4">
								<ContentLoader height={12} width={108}>
									<rect
										width="108"
										height="12"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
							<div className="appinfo__l__d3">
								<ContentLoader height={9} width={76}>
									<rect
										width="76"
										height="9"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
							<div className="appinfo__l__d5">
								<a href="">
									<ContentLoader height={12} width={108}>
										<rect
											width="108"
											height="12"
											rx="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								</a>
							</div>
							<div className="appinfo__l__d5">
								<a href="">
									<ContentLoader height={12} width={108}>
										<rect
											width="108"
											height="12"
											rx="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								</a>
							</div>
							<div className="appinfo__l__d3">
								<ContentLoader height={9} width={76}>
									<rect
										width="76"
										height="9"
										rx="2"
										fill="#EBEBEB"
									/>
								</ContentLoader>
								<div
									style={{ marginTop: "6px" }}
									className="d-flex flex-row align-items-center flex-wrap"
								>
									<ContentLoader height={12} width={108}>
										<rect
											width="108"
											height="12"
											rx="2"
											fill="#EBEBEB"
										/>
									</ContentLoader>
								</div>
							</div>
						</div>
						<div className="appinfo__r">
							<div className="appinfo__r__d1__loading">
								<ContentLoader width={500}>
									<rect
										width="487"
										height="10"
										rx="2"
										x="24"
										y="34"
										fill="#EBEBEB"
									/>
									<rect
										width="362"
										height="10"
										rx="2"
										x="24"
										y="59"
										fill="#EBEBEB"
									/>
									<rect
										width="487"
										height="10"
										rx="2"
										x="24"
										y="84"
										fill="#EBEBEB"
									/>
									<rect
										width="362"
										height="10"
										rx="2"
										x="24"
										y="109"
										fill="#EBEBEB"
									/>
									<rect
										width="487"
										height="10"
										rx="2"
										x="24"
										y="134"
										fill="#EBEBEB"
									/>
									<rect
										width="362"
										height="10"
										rx="2"
										x="24"
										y="159"
										fill="#EBEBEB"
									/>
								</ContentLoader>
							</div>
							<div
								className="appinfo__r__d2"
								style={{ marginTop: "23px" }}
							>
								Similar Apps
							</div>
							<div className="appinfo__r__d3">
								<CardListLoading></CardListLoading>
							</div>
						</div>
					</div>
				</>
			) : (
				<>
					<Helmet>
						<title>
							{info?.integration_name +
								" Integration - " +
								getValueFromLocalStorage("userInfo")?.org_name +
								`- ${
									getValueFromLocalStorage("partner")?.name
								}`}
						</title>
					</Helmet>
					<div className="INT__appinfo__cont">
						<div className="appinfo__l">
							<div className="appinfo__l__d1">
								<div className="appinfo__l__d1__l">
									<img
										src={info?.integration_logo_url}
										style={{
											height: "38px",
											width: "38px",
										}}
									></img>
								</div>
								<div
									className="appinfo__l__d1__r"
									style={{ marginLeft: "10px" }}
								>
									<div className="appinfo__l__d1__r__text1">
										{info?.integration_name}
									</div>
									<div className="appinfo__l__d1__r__text2">
										Cloud-based VOIP, video conferencing,
										collaboration solution
									</div>
								</div>
							</div>
							<hr style={{ margin: "10px 0px 16px" }}></hr>
							<div className="appinfo__l__d2 d-flex">
								{
									<button
										onClick={handleConnectDisconnectClick}
										className="appinfo__card__button2"
									>
										{isConnected
											? "Disconnect App"
											: "Connect App"}
									</button>
								}
								<form
									method="post"
									action={connectDisconnectUrl}
									target="popupWindow"
									ref={formRef}
								>
									<input type="hidden" name="integrationId" />
									<input type="hidden" name="orgId" />
									<input type="hidden" name="Authorization" />
									<input type="hidden" name="namespace" />
									<input type="hidden" name="userId" />
								</form>
								<a
									href={info.integration_learn_more_url}
									target="_blank"
									rel="noreferrer"
									className="button appinfo__card__button1 ml-auto"
									style={{ textDecoration: "unset" }}
								>
									{" "}
									Learn More
								</a>
							</div>
							<div className="appinfo__l__d3">Category</div>
							<div className="appinfo__l__d4">
								{info?.integration_category}
							</div>
							<div className="appinfo__l__d3">
								Supported Languages
							</div>
							<div className="appinfo__l__d4">
								{info?.integration_supported_languages?.map(
									(el) => el
								)}
							</div>
							<div className="appinfo__l__d3">Developer</div>
							<div className="appinfo__l__d5">
								<a href="">
									{
										info?.integration_developer
											?.integration_developer_support_email
									}
								</a>
							</div>
							<div className="appinfo__l__d5">
								<a href="">
									{
										info?.integration_developer
											?.integration_developer_support_link
									}
								</a>
							</div>
							<div className="appinfo__l__d3">
								Tags
								<div
									style={{ marginTop: "6px" }}
									className="d-flex flex-row align-items-center flex-wrap"
								>
									{info?.integration_tags?.map((el) => (
										<IntegrationTag key={el} text={el} />
									))}
								</div>
							</div>
						</div>
						<div className="appinfo__r">
							{info.count && info.count > 0 ? (
								<div className="appinfo__note">
									<div className="app__info__note__title">
										<img src={informationIcon} />
										<span style={{ margin: 5 }}>Note</span>
									</div>
									{info.integration_name} does not provide us
									with user email IDs. The users for this app
									need to be manually mapped to their{" "}
									{info.integration_name} usernames.
									<Button
										style={{ margin: "10px 0" }}
										onClick={() =>
											history.push("#usermapping")
										}
									>
										Map {info.count} Users
									</Button>
								</div>
							) : null}
							<div className="appinfo__r__d1">
								{info?.integration_description}
							</div>
						</div>
					</div>
				</>
			)}
		</>
	);
}
