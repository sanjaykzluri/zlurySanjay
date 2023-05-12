import React, { Component, useContext, useState } from "react";
import CardRender from "./CardRender";
import add from "./add.svg";
import ContentLoader from "react-content-loader";
import { fetchPaymentMethods } from "../../actions/transactions-action";
import { addPaymentMethodNew } from "../../services/api/transactions";
import { AddPaymentMethod } from "./AddPaymentMethod";
import { AddBankAccount } from "./AddBankAccount";
import { useDispatch, useSelector } from "react-redux";
import { AddCard } from "./AddCard";
import RoleContext from "../../services/roleContext/roleContext";
export default function CardRenderOuter(props) {
	const dispatch = useDispatch();
	const [addCardShow, setaddcardshow] = useState(false);
	const [addBankAccountshow, setaddBankAccountshow] = useState(false);
	const [addPaymentMethod1, setPaymentMethod] = useState(false);
	const [bankAccWarningMsg, setbankAccWarningMsg] = useState(false);
	const [creditCardWarningMsg, setCreditCardWarningMsg] = useState(false);
	const { isViewer } = useContext(RoleContext);
	const [submitting, setSubmitting] = useState(false);
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	let addCardClose = () => {
		setaddcardshow(false);
		setCreditCardWarningMsg(false);
	};
	let addBankAccountClose = () => {
		setaddBankAccountshow(false);
	};
	let addPaymentMethodClose = () => {
		setPaymentMethod(false);
	};
	const handlePaymentAdd = (paymentObj) => {
		setSubmitting(true);
		addPaymentMethodNew(paymentObj).then((res) => {
			if (res?.error) {
				setSubmitting(false);
				console.error(res.error);
				setCreditCardWarningMsg(true);
			} else {
				setSubmitting(false);
				dispatch(fetchPaymentMethods());
				setaddcardshow(false);
			}
		});
	};
	const handleBankAdd = (paymentObj) => {
		setSubmitting(true);
		addPaymentMethodNew(paymentObj).then((res) => {
			if (res?.error) {
				setSubmitting(false);
				setbankAccWarningMsg(true);
			} else {
				setSubmitting(false);
				dispatch(fetchPaymentMethods());
				setaddBankAccountshow(false);
			}
		});
	};
	const handleOtherAdd = (paymentObj) => {
		setSubmitting(true);
		addPaymentMethodNew(paymentObj)
			.then((res) => {
				setSubmitting(false);
				dispatch(fetchPaymentMethods());
				setPaymentMethod(false);
			})
			.catch((err) => {
				setSubmitting(false);
				TriggerIssue("Error in adding payment Method", err);
			});
	};
	const commonSegmentTrack = (message) => {
		//Segment Implement
		window.analytics.track(message, {
			currentCategory: "Transactions",
			currentPageName: "Payment-Methods",
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};
	const clickedOnAddCreditCard = () => {
		setaddcardshow(true);
		commonSegmentTrack("Clicked on Add Credit Card");
	};
	const clickedOnAddBankAccount = () => {
		setaddBankAccountshow(true);
		commonSegmentTrack("Clicked on Add Bank Account");
	};
	const clickedOnAddOtherPayment = () => {
		setPaymentMethod(true);
		commonSegmentTrack("Clicked on Add Other Payment Method");
	};
	if (props.loading) {
		return (
			<>
				<div className="topnext">
					<div className="cre">
						<ContentLoader width={96} height={16}>
							<rect width="96" height="16" fill="#EBEBEB" />
						</ContentLoader>
					</div>
					<hr style={{ margin: "10px 40px 0px" }}></hr>
				</div>
				<div className="creditcards">
					<div
						className="credit-card__body__vis__loading"
						style={{ marginRight: "22px" }}
					>
						<ContentLoader width={"100%"} height={"100%"}>
							<rect
								width="115"
								height="16"
								fill="#EBEBEB"
								y={24}
								x={23}
								rx="4"
								ry="4"
							/>
							<rect
								width="80"
								height="11"
								fill="#EBEBEB"
								y={88}
								x={23}
								rx="4"
								ry="4"
							/>
							<rect
								width="118"
								height="8"
								fill="#EBEBEB"
								y={108}
								x={23}
								rx="4"
								ry="4"
							/>
							<rect
								width="59"
								height="36"
								fill="#EBEBEB"
								y={94}
								x={154}
								rx="25"
								ry="25"
							/>
						</ContentLoader>
					</div>
					<div
						className="credit-card__body__vis__loading"
						style={{ marginRight: "22px" }}
					>
						<ContentLoader width={"100%"} height={"100%"}>
							<rect
								width="115"
								height="16"
								fill="#EBEBEB"
								y={24}
								x={23}
								rx="4"
								ry="4"
							/>
							<rect
								width="80"
								height="11"
								fill="#EBEBEB"
								y={88}
								x={23}
								rx="4"
								ry="4"
							/>
							<rect
								width="118"
								height="8"
								fill="#EBEBEB"
								y={108}
								x={23}
								rx="4"
								ry="4"
							/>
							<rect
								width="59"
								height="36"
								fill="#EBEBEB"
								y={94}
								x={154}
								rx="25"
								ry="25"
							/>
						</ContentLoader>
					</div>
					<div
						className="credit-card__body__vis__loading"
						style={{ marginRight: "22px" }}
					>
						<ContentLoader width={"100%"} height={"100%"}>
							<rect
								width="115"
								height="16"
								fill="#EBEBEB"
								y={24}
								x={23}
								rx="4"
								ry="4"
							/>
							<rect
								width="80"
								height="11"
								fill="#EBEBEB"
								y={88}
								x={23}
								rx="4"
								ry="4"
							/>
							<rect
								width="118"
								height="8"
								fill="#EBEBEB"
								y={108}
								x={23}
								rx="4"
								ry="4"
							/>
							<rect
								width="59"
								height="36"
								fill="#EBEBEB"
								y={94}
								x={154}
								rx="25"
								ry="25"
							/>
						</ContentLoader>
					</div>
					<div
						className="credit-card__body__vis__loading"
						style={{ marginRight: "22px" }}
					>
						<ContentLoader width={"100%"} height={"100%"}>
							<rect
								width="115"
								height="16"
								fill="#EBEBEB"
								y={24}
								x={23}
								rx="4"
								ry="4"
							/>
							<rect
								width="80"
								height="11"
								fill="#EBEBEB"
								y={88}
								x={23}
								rx="4"
								ry="4"
							/>
							<rect
								width="118"
								height="8"
								fill="#EBEBEB"
								y={108}
								x={23}
								rx="4"
								ry="4"
							/>
							<rect
								width="59"
								height="36"
								fill="#EBEBEB"
								y={94}
								x={154}
								rx="25"
								ry="25"
							/>
						</ContentLoader>
					</div>
				</div>
				<div className="topnext1">
					<div className="cre">
						<ContentLoader width={118} height={16}>
							<rect width="118" height="16" fill="#EBEBEB" />
						</ContentLoader>
					</div>
					<hr style={{ margin: "10px 40px 0px" }}></hr>
					<div className="creditcards">
						<div
							className="bankacc1__body1__loading"
							style={{ marginRight: "22px" }}
						>
							<ContentLoader width={"100%"} height={"100%"}>
								<rect
									width="115"
									height="16"
									fill="#EBEBEB"
									y={24}
									x={23}
									rx="4"
									ry="4"
								/>
								<rect
									width="59"
									height="8"
									fill="#EBEBEB"
									y={63}
									x={23}
									rx="4"
									ry="4"
								/>
								<rect
									width="89"
									height="11"
									fill="#EBEBEB"
									y={76}
									x={23}
									rx="4"
									ry="4"
								/>
								<rect
									width="59"
									height="8"
									fill="#EBEBEB"
									y={111}
									x={23}
									rx="4"
									ry="4"
								/>
								<rect
									width="89"
									height="11"
									fill="#EBEBEB"
									y={124}
									x={23}
									rx="4"
									ry="4"
								/>
								<rect
									width="141"
									height="8"
									fill="#EBEBEB"
									y={153}
									x={23}
									rx="4"
									ry="4"
								/>
							</ContentLoader>
						</div>
						<div
							className="bankacc1__body1__loading"
							style={{ marginRight: "22px" }}
						>
							<ContentLoader width={"100%"} height={"100%"}>
								<rect
									width="115"
									height="16"
									fill="#EBEBEB"
									y={24}
									x={23}
									rx="4"
									ry="4"
								/>
								<rect
									width="59"
									height="8"
									fill="#EBEBEB"
									y={63}
									x={23}
									rx="4"
									ry="4"
								/>
								<rect
									width="89"
									height="11"
									fill="#EBEBEB"
									y={76}
									x={23}
									rx="4"
									ry="4"
								/>
								<rect
									width="59"
									height="8"
									fill="#EBEBEB"
									y={111}
									x={23}
									rx="4"
									ry="4"
								/>
								<rect
									width="89"
									height="11"
									fill="#EBEBEB"
									y={124}
									x={23}
									rx="4"
									ry="4"
								/>
								<rect
									width="141"
									height="8"
									fill="#EBEBEB"
									y={153}
									x={23}
									rx="4"
									ry="4"
								/>
							</ContentLoader>
						</div>
					</div>
				</div>
			</>
		);
	} else {
		return (
			<>
				<div className="topnext">
					<div className="cre">Credit Cards</div>
					<hr style={{ margin: "10px 40px 0px" }}></hr>
				</div>
				<div className="creditcards">
					{props.data?.payment_ccs?.length === 0 && !isViewer ? (
						<button
							className="empty__payment__cc"
							onClick={clickedOnAddCreditCard}
						>
							<img
								src={add}
								style={{ marginRight: "8.5px" }}
							></img>
							Add Credit Card
						</button>
					) : props.data?.payment_ccs?.length === 0 && isViewer ? (
						<button className="empty__payment__cc">
							No Credit Cards
						</button>
					) : (
						<>
							{props.data?.payment_ccs?.map((el) => (
								<CardRender
									id={el?.payment_method_id}
									bankname={el?.cc_card_name}
									number={el?.cc_masked_digits}
									expiry_year={el?.cc_expiry_month}
									expiry_month={el.cc_expiry_year}
									type="credit"
									uid="123"
									currency={el?.payment_default_currency}
									masorvi={el?.cc_card_type}
								/>
							))}
							{!isViewer && (
								<button
									className="empty__payment__cc"
									onClick={clickedOnAddCreditCard}
								>
									<img
										src={add}
										style={{ marginRight: "8.5px" }}
									></img>
									Add Credit Card
								</button>
							)}
						</>
					)}
					{addCardShow && (
						<AddCard
							submitting={submitting}
							show={addCardShow}
							onHide={addCardClose}
							handleSubmit={handlePaymentAdd}
							showWarningMessage={creditCardWarningMsg}
						></AddCard>
					)}
				</div>
				<div className="topnext1">
					<div className="cre">Bank Accounts</div>
					<hr style={{ margin: "10px 40px 0px" }}></hr>
					<div className="creditcards">
						{props.data?.payment_banks?.length === 0 &&
						!isViewer ? (
							<button
								className="empty__payment__cc"
								onClick={clickedOnAddBankAccount}
							>
								<img
									src={add}
									style={{ marginRight: "8.5px" }}
								></img>
								Add Bank Account
							</button>
						) : props.data?.payment_banks?.length === 0 &&
						  isViewer ? (
							<button className="empty__payment__cc">
								No Bank Account
							</button>
						) : (
							<>
								{props.data?.payment_banks?.map((el) => (
									<CardRender
										id={el?.payment_method_id}
										bankname={el?.bank_name}
										number={el?.bank_masked_account_digits}
										type="bank"
										uid="12332342"
										benefname={el?.bank_beneficiary_name}
										currency={el?.payment_default_currency}
									></CardRender>
								))}
								{!isViewer && (
									<button
										style={{ height: "160px" }}
										className="empty__payment__cc"
										onClick={clickedOnAddBankAccount}
									>
										<img
											src={add}
											style={{ marginRight: "8.5px" }}
										></img>
										Add Bank Account
									</button>
								)}
							</>
						)}
						{addBankAccountshow && (
							<AddBankAccount
								submitting={submitting}
								show={addBankAccountshow}
								onHide={addBankAccountClose}
								handleSubmit={handleBankAdd}
								showWarningMessage={bankAccWarningMsg}
							></AddBankAccount>
						)}
					</div>
				</div>
				<div className="topnext">
					<div className="cre">Other Payment Options</div>
					<hr style={{ margin: "10px 40px 0px" }}></hr>
				</div>
				<div className="creditcards__new">
					{props.data?.payment_others?.length === 0 && !isViewer ? (
						<button
							className="empty__otherpayment__cc mb-4"
							onClick={clickedOnAddOtherPayment}
						>
							<img
								src={add}
								style={{ marginRight: "8.5px" }}
							></img>
							Add Other Payment
						</button>
					) : props.data?.payment_others?.length === 0 && isViewer ? (
						<button className="empty__otherpayment__cc mb-4">
							No Other Payments
						</button>
					) : (
						<>
							{props.data?.payment_others?.map((el) => (
								<CardRender
									id={el?.payment_method_id}
									method={el?.payment_method_name}
									type="other"
									currency={el?.payment_default_currency}
									logo={el.payment_logo_url || ""}
								/>
							))}
							{!isViewer && (
								<button
									style={{ height: "92px" }}
									className="empty__otherpayment__cc mb-4"
									onClick={clickedOnAddOtherPayment}
								>
									<img
										src={add}
										style={{ marginRight: "8.5px" }}
									></img>
									Add Other Payment
								</button>
							)}
						</>
					)}
					{addPaymentMethod1 && (
						<AddPaymentMethod
							submitting={submitting}
							show={addPaymentMethod1}
							onHide={addPaymentMethodClose}
							handleSubmit={handleOtherAdd}
						></AddPaymentMethod>
					)}
				</div>
			</>
		);
	}
}
