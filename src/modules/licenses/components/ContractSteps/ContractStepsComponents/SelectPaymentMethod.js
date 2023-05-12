import React, { useEffect } from "react";
import { Form } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { fetchPaymentMethods } from "../../../../../actions/transactions-action";
import { Loader } from "../../../../../common/Loader/Loader";

export default function SelectPaymentMethod({
	value,
	onPaymentSelect,
	className,
	labelClassName,
}) {
	const { paymentMethods } = useSelector((state) => state.transactions);
	const dispatch = useDispatch();

	const requestPaymentMethods = () => {
		if (!paymentMethods.loaded) {
			dispatch(fetchPaymentMethods());
		}
	};

	useEffect(() => {
		requestPaymentMethods();
	}, []);

	const getOptionGroupLabel = (key) => {
		key = key.split("_")[1];
		switch (key) {
			case "ccs":
				return "Credit Cards";
			case "banks":
				return "Bank Accounts";
			case "others":
			default:
				return "Others";
		}
	};

	const getOptionGroupNameKey = (key) => {
		key = key.split("_")[1];
		switch (key) {
			case "ccs":
				return "cc_card_name";
			case "banks":
				return "bank_name";
			case "others":
			default:
				return "payment_method_name";
		}
	};

	const paymentOptionsGroups = () =>
		paymentMethods &&
		paymentMethods.loaded &&
		paymentMethods.data &&
		Object.keys(paymentMethods.data).map(
			(key, grpIndex) =>
				paymentMethods.data[key].length && (
					<optgroup label={getOptionGroupLabel(key)} key={grpIndex}>
						{paymentMethods.data[key].map((method, index) => (
							<option
								value={method.payment_method_id}
								key={index}
							>
								{method[getOptionGroupNameKey(key)]}
							</option>
						))}
					</optgroup>
				)
		);

	return (
		<div className={className || "d-flex flex-column"}>
			<div className={labelClassName || "font-14 bold-600 mb-1"}>
				Payment Method
			</div>
			<Form.Control
				className="cursor-pointer"
				as="select"
				disabled={!paymentMethods.loaded}
				onChange={(e) => onPaymentSelect(e.target.value)}
				value={value}
			>
				<option value={null} selected disabled>
					Select Payment Method
				</option>
				{paymentOptionsGroups()}
			</Form.Control>
		</div>
	);
}
