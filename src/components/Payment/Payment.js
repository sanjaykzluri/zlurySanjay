import React, { useEffect, useState, useContext } from "react";
import "./Payment.css";
import { useDispatch, useSelector } from "react-redux";
import search from "../../assets/search.svg";
import Add from "../../assets/add.svg";
import AddBox from "./AddBox";
import { fetchPaymentMethods } from "../../actions/transactions-action";
import CardRenderOuter from "./CardRenderOuter";
import RoleContext from "../../services/roleContext/roleContext";
import Strips from "../../common/restrictions/Strips";
import { ENTITIES } from "../../constants";

export function Payment() {
	const [showHide, setshowHide] = useState(false);
	const [showHideFilter, setshowHideFilet] = useState(false);
	let addBoxClose = () => setshowHide(false);
	const dispatch = useDispatch();
	const { paymentMethods } = useSelector((state) => state.transactions);
	const [searchQuery, setSearchQuery] = useState("");
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const [searchTerm, setSearchTerm] = useState("");
	const { isViewer } = useContext(RoleContext);

	useEffect(() => {
		if (!paymentMethods.loaded) {
			dispatch(fetchPaymentMethods());
		}
	}, []);

	const handleSearchQuery = (event) => {
		setSearchTerm(event.target.value?.trimStart());
		let searchQuery = event.target.value.trim();
		setSearchQuery(searchQuery);
	};

	const commonSegmentTrack = (message) => {
		//Segment Implementation
		window.analytics.track(message, {
			currentCategory: "Transactions",
			currentPageName: "Payment-Methods",
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};
	const clickedOnAddPayemnt = () => {
		setshowHide(!showHide);
		commonSegmentTrack("Clicked on Add Payment Method");
	};

	const clickedOnSearch = () => {
		commonSegmentTrack("Clicked on Search Payment Methods");
	};

	return (
		<>
			<div className="top">
				<div className="Uploads__left"></div>
				<div className="Uploads__right">
					<div className="inputWithIconApps">
						<input
							type="text"
							placeholder="Search"
							value={searchTerm}
							onChange={(e) => {
								handleSearchQuery(e);
							}}
							onClick={clickedOnSearch}
						/>
						<img src={search} aria-hidden="true"></img>
					</div>
					{!isViewer && (
						<div className="placing__addbox">
							<button
								className="appsad mr-3"
								onClick={clickedOnAddPayemnt}
							>
								<img src={Add}></img>
								<span id="te">Add</span>
							</button>
							<div className="container__payment">
								{
									<AddBox
										onHide={addBoxClose}
										visible={showHide}
									/>
								}
							</div>
						</div>
					)}
				</div>
			</div>
			<Strips entity={ENTITIES.PAYMENT} />
			<CardRenderOuter
				loading={paymentMethods.loading}
				data={{
					payment_banks: paymentMethods.data?.payment_banks?.filter(
						(bank) =>
							bank.bank_name
								?.toLowerCase()
								.includes(searchQuery?.toLowerCase())
					),
					payment_ccs: paymentMethods.data?.payment_ccs?.filter(
						(card) =>
							card.cc_card_name
								?.toLowerCase()
								.includes(searchQuery?.toLowerCase())
					),
					payment_others: paymentMethods.data?.payment_others?.filter(
						(other) =>
							other.payment_method_name
								?.toLowerCase()
								.includes(searchQuery?.toLowerCase())
					),
				}}
			/>
		</>
	);
}
