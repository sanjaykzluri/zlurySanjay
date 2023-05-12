import React, { useRef, useState } from "react";
import Amex from "assets/transactions/Amex.svg";
import visa from "assets/transactions/visa.svg";
import bank from "assets/transactions/bank.svg";
import card from "assets/transactions/card.svg";
import master from "assets/transactions/mastercard.svg";
import useOutsideClick from "common/OutsideClick/OutsideClick";
import otherpayment from "assets/transactions/otherpayment.svg";
import LongTextTooltip from "modules/shared/components/LongTextTooltip/LongTextTooltip";

export default function AppPaymentMethodsCell({ paymentMethods }) {
	const ref = useRef();
	const [showAll, setShowAll] = useState(false);

	const getPaymentMethodImage = (paymentMethod) => {
		var type = paymentMethod.type;
		var detailsType = paymentMethod.details?.type;

		if (type === "credit_card") {
			if (detailsType === "visa") return visa;
			else if (detailsType === "mastercard") return master;
			else if (detailsType === "american_express") return Amex;
			else return card;
		} else if (type === "bank") {
			return bank;
		} else if (type === "other") {
			return otherpayment;
		}
	};

	const renderPaymentMethod = (paymentMethod) => {
		return (
			<div className="app_table_payment_method_card">
				<div className="custom__dropdown__payment__dropdown__option__d1">
					<img
						src={getPaymentMethodImage(paymentMethod)}
						style={{
							maxHeight: 15,
							marginRight: "8px",
						}}
						className="mr-2"
					/>
					<LongTextTooltip
						text={paymentMethod.name}
						maxWidth="130px"
						style={{ fontSize: "13px" }}
					/>
				</div>
				<div className="custom__dropdown__payment__dropdown__option__d2">
					{paymentMethod?.details?.number
						? "•••• •••• " + paymentMethod?.details?.number
						: null}
				</div>
			</div>
		);
	};

	useOutsideClick(ref, () => {
		if (showAll) setShowAll(false);
	});

	return (
		<>
			<div className="d-flex">
				{renderPaymentMethod(paymentMethods[0])}

				{paymentMethods.length > 1 && (
					<div style={{ position: "relative" }}>
						<div
							className={`d-flex flex-center cursor-pointer`}
							style={{
								width: "25px",
								background: "rgba(235, 235, 235, 0.6)",
								borderRadius: " 4px",
								marginLeft: "10px",
								height: "100%",
							}}
							onClick={(e) => {
								e.stopPropagation();
								e.preventDefault();
								setShowAll(true);
							}}
						>
							<span
								style={{
									fontSize: 8,
									color: "#717171",
								}}
							>
								+ {paymentMethods.length - 1}
							</span>
						</div>
						{showAll && (
							<>
								<div
									className="app_table_payment_method_popup"
									ref={(el) => {
										if (el) {
											ref.current = el;
										}
									}}
									style={
										paymentMethods.length > 4
											? {
													paddingBottom: "7px",
											  }
											: { cursor: "default" }
									}
								>
									<div
										className="d-flex flex-column"
										style={{
											maxHeight: "210px",
											width: "100%",
											overflowY: "auto",
											overflowX: "none",
										}}
									>
										{paymentMethods
											.slice(1)
											.map((el, index) => (
												<React.Fragment key={index}>
													{renderPaymentMethod(el)}
													{index !==
														paymentMethods.length -
															2 && (
														<hr
															style={{
																margin: "0px",
															}}
														/>
													)}
												</React.Fragment>
											))}
									</div>
								</div>
							</>
						)}
					</div>
				)}
			</div>
		</>
	);
}
