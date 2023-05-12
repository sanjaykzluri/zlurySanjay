import React, { Component, useState, useRef, useEffect } from "react";
import "./Payment.css";
import image1 from "../../assets/image1.svg";
import image2 from "../../assets/image2.svg";
import { connect, useDispatch, useSelector } from "react-redux";
import image3 from "../../assets/image3.svg";
import { fetchPaymentMethods } from "../../actions/transactions-action";
import { addPaymentMethodNew } from "../../services/api/transactions";
import { AddCard } from "./AddCard";
import { AddBankAccount } from "./AddBankAccount";
import { AddPaymentMethod } from "./AddPaymentMethod";
import { useOutsideClickListener } from "../../utils/clickListenerHook";
import { ConsoleHelper } from "../../utils/consoleHelper";
import { TriggerIssue } from "utils/sentry";
export default function AddBox(props) {
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const dispatch = useDispatch();
	const [addCardShow, setaddcardshow] = useState(false);
	const [visible, setvisible] = useState(false);
	const [addBankAccountshow, setaddBankAccountshow] = useState(false);
	const [addPaymentMethod1, setPaymentMethod] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [creditCardWarningMsg, setCreditCardWarningMsg] = useState(false);
	const [bankAccWarningMsg, setbankAccWarningMsg] = useState(false);
	const commonSegmentTrack = (message, paymentObj) => {
		//Segment Implementation
		window.analytics.track(message, {
			newPaymentObj: paymentObj,
			currentCategory: "Transactions",
			currentPageName: "Payment-Methods",
			orgId: orgId || "",
			orgName: orgName || "",
		});
	};
	const handlePaymentAdd = (paymentObj) => {
		setSubmitting(true);
		addPaymentMethodNew(paymentObj).then((res) => {
			if (res?.error) {
				//console.error(res.error);
				setSubmitting(false);
				ConsoleHelper(res.error);
				setCreditCardWarningMsg(true);
			} else {
				setSubmitting(false);
				dispatch(fetchPaymentMethods());
				setaddcardshow(false);
			}
			commonSegmentTrack("Added a new Payment Method", paymentObj);
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
			commonSegmentTrack("Added a new Bank Payment Method", paymentObj);
		});
	};
	const handleOtherAdd = (paymentObj) => {
		setSubmitting(true);
		addPaymentMethodNew(paymentObj)
			.then((res) => {
				setSubmitting(false);
				dispatch(fetchPaymentMethods());
				setPaymentMethod(false);
				props.onHide();
				commonSegmentTrack(
					"Added a new Other Payment Method",
					paymentObj
				);
			})
			.catch((err) => {
				setSubmitting(false);
				TriggerIssue("Error in Add payment Method", err);
			});
	};

	let addCardClose = () => {
		setaddcardshow(false);
		setvisible(false);
	};
	let addBankAccountClose = () => {
		setaddBankAccountshow(false);
	};
	let addPaymentMethodClose = () => {
		setPaymentMethod(false);
	};

	const wrapperRef = useRef(null);
	useOutsideClickListener(wrapperRef, () => {
		props.onHide();
		setaddcardshow(false);
		setaddBankAccountshow(false);
		setPaymentMethod(false);
	});

	useEffect(() => {
		//Segment Implementation for Add-Credit-Card
		if (addCardShow) {
			window.analytics.page(
				"Transactions",
				"Payment-Methods; Add-Credit-Card",
				{
					orgId: orgId || "",
					orgName: orgName || "",
				}
			);
		}
	}, [addCardShow]);

	useEffect(() => {
		//Segment Implementation for Add-Bank-Card
		if (addBankAccountshow) {
			window.analytics.page(
				"Transactions",
				"Payment-Methods; Add-Bank-Account",
				{
					orgId: orgId || "",
					orgName: orgName || "",
				}
			);
		}
	}, [addBankAccountshow]);

	useEffect(() => {
		//Segment Implementation for Add-Other-Payment-Method
		if (addPaymentMethod1) {
			window.analytics.page(
				"Transactions",
				"Payment-Methods; Add-Other-Payment-Method",
				{
					orgId: orgId || "",
					orgName: orgName || "",
				}
			);
		}
	}, [addPaymentMethod1]);
	const commonSegmentTrack2 = (message) => {
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
		props.onHide();
		commonSegmentTrack2("Clicked on Add Credit Card");
	};
	const clickedOnAddBankAccount = () => {
		setaddBankAccountshow(true);
		props.onHide();
		commonSegmentTrack2("Clicked on Add Bank Account");
	};
	const clickedOnAddOtherPayment = () => {
		setPaymentMethod(true);
		props.onHide();
		commonSegmentTrack2("Clicked on Add Other Payment Method");
	};
	return (
		<>
			{(visible || props.visible) && (
				<div ref={wrapperRef} className="addbox">
					<button
						className="addbox__button1"
						onClick={clickedOnAddCreditCard}
					>
						<div className="addbox__cont">
							<div className="addbox__button1__left">
								<img src={image1} alt=""></img>
							</div>
							<div className="addboxright">
								<div className="addbox__button1__right__text1 text-left">
									Credit Card
								</div>
								<div className="addbox__button1__right__text2">
									Please click here to add a credit card
								</div>
							</div>
						</div>
					</button>
					<hr style={{ margin: "0px" }}></hr>
					<button
						className="addbox__button1"
						onClick={clickedOnAddBankAccount}
					>
						<div className="addbox__cont">
							<div className="addbox__button1__left">
								<img
									src={image2}
									alt=""
									style={{
										width: "102px",
										height: "74px",
									}}
								></img>
							</div>
							<div className="addboxright">
								<div className="addbox__button1__right__text1 text-left">
									Bank Account
								</div>
								<div className="addbox__button1__right__text2">
									Please click here to add a bank account
								</div>
							</div>
						</div>
					</button>
					<hr style={{ margin: "0px" }}></hr>
					<button
						className="addbox__button1"
						onClick={clickedOnAddOtherPayment}
					>
						<div className="addbox__cont">
							<div className="addbox__button1__left">
								<img src={image3} alt=""></img>
							</div>
							<div className="addboxright">
								<div className="addbox__button1__right__text1 text-left">
									Other
								</div>
								<div className="addbox__button1__right__text2">
									Please click here to add other payment
									methods e.g. Debit cards, Paypal, Checks,
									Prepaid cards etc.
								</div>
							</div>
						</div>
					</button>
				</div>
			)}
			{addCardShow && (
				<AddCard
					show={addCardShow}
					onHide={addCardClose}
					handleSubmit={handlePaymentAdd}
					showWarningMessage={creditCardWarningMsg}
					submitting={submitting}
				></AddCard>
			)}
			{addBankAccountshow && (
				<AddBankAccount
					show={addBankAccountshow}
					onHide={addBankAccountClose}
					handleSubmit={handleBankAdd}
					showWarningMessage={bankAccWarningMsg}
					submitting={submitting}
				></AddBankAccount>
			)}
			{addPaymentMethod1 && (
				<AddPaymentMethod
					show={addPaymentMethod1}
					onHide={addPaymentMethodClose}
					handleSubmit={handleOtherAdd}
					submitting={submitting}
				></AddPaymentMethod>
			)}
		</>
	);
}
