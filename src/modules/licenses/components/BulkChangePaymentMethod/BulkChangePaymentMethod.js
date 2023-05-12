import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPaymentMethods } from "../../../../actions/transactions-action";
import { useOutsideClickListener } from "../../../../utils/clickListenerHook";
import search from "../../../../assets/search.svg";
import arrowdropdown from "../../../../assets/arrowdropdown.svg";
import { Popover } from "../../../../UIComponents/Popover/Popover";
import { Fragment } from "react";
import { getImageForPaymentMethodDropdown } from "../../../../components/Transactions/Recognised/Dropdown";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { TriggerIssue } from "../../../../utils/sentry";
import { Loader } from "../../../../common/Loader/Loader";
import { getImageForPaymentMethodTable } from "../../../../components/Transactions/Recognised/Recognised";
import edit from "../../../../components/Applications/Overview/edit.svg";
import { toast } from "react-toastify";
import DefaultNotificationCard from "common/Notification/PusherNotificationCards/DefaultNotificationCard";

export default function BulkChangePaymentMethod({
	entity_ids,
	api_call,
	is_success,
	refresh,
	is_table_cell = false,
	popover_class = "bulk-unassign-license-popover",
	payment_method,
	checkAll,
	metaData,
	exceptionData,
	type,
	bulk_button_class,
}) {
	const paymentOptionsRef = useRef();
	const [loading, setLoading] = useState(false);
	const [showPaymentOptions, setShowPaymentOptions] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [paymentMethodList, setPaymentMethodList] = useState([]);
	const [showEditButton, setShowEditButton] = useState(false);

	const { paymentMethods } = useSelector((state) => state.transactions);

	const dispatch = useDispatch();

	const requestPaymentMethods = () => {
		if (!paymentMethods.loaded || paymentMethods.err) {
			dispatch(fetchPaymentMethods());
		}
	};

	useOutsideClickListener(paymentOptionsRef, () => {
		setShowPaymentOptions(false);
	});

	useEffect(() => {
		if (paymentMethods.loaded && !paymentMethods.err) {
			setPaymentMethodList([
				...paymentMethods.data.payment_ccs,
				...paymentMethods.data.payment_banks,
				...paymentMethods.data.payment_others,
			]);
		}
	}, [paymentMethods.loaded]);

	const handleOpenPaymentListPopover = () => {
		setShowPaymentOptions(true);
		requestPaymentMethods();
	};

	const handleSearchQuery = (event) => {
		let value = event.target.value?.trimStart();
		setSearchQuery(value);
	};

	const handlePaymentSelect = (id) => {
		setLoading(true);
		let api_ids;
		if (checkAll) {
			api_ids = exceptionData;
		} else {
			api_ids = entity_ids;
		}
		api_call(api_ids, id, checkAll, metaData?.filter_by, type)
			.then((res) => {
				if (is_success(res)) {
					setLoading(false);
					setShowPaymentOptions(false);
					toast(
						<DefaultNotificationCard
							notification={{
								title: "Payment Methods Updated",
								description:
									"All records have been updated successfully. The changes might take some time to reflect.",
							}}
						/>
					);
					refresh && refresh();
				}
			})
			.catch((err) => {
				TriggerIssue("Bulk update payment method error", err);
				setLoading(false);
			});
	};

	const paymentMethodCards = paymentMethodList.map(
		(method) =>
			(
				method.cc_card_name ||
				method.bank_name ||
				method.payment_method_name
			)
				?.toLowerCase()
				.includes(searchQuery?.toLowerCase()) && (
				<div
					className="custom__dropdown__payment__dropdown__option cursor-pointer"
					onClick={() =>
						handlePaymentSelect(method.payment_method_id)
					}
				>
					<div className="custom__dropdown__payment__dropdown__option__d1">
						<img
							src={getImageForPaymentMethodDropdown(method)}
							style={{
								maxHeight: 15,
								marginRight: "8px",
							}}
							className="mr-2"
						/>
						<OverlayTrigger
							placement="top"
							overlay={
								<Tooltip>
									{method.cc_card_name ||
										method.bank_name ||
										method.payment_method_name}
								</Tooltip>
							}
						>
							<div className="truncate_10vw">
								{method.cc_card_name ||
									method.bank_name ||
									method.payment_method_name}
							</div>
						</OverlayTrigger>
					</div>
					<div className="custom__dropdown__payment__dropdown__option__d2">
						{method.bank_masked_account_digits ||
						method.cc_masked_digits
							? "•••• •••• " +
							  (method.bank_masked_account_digits ||
									method.cc_masked_digits)
							: null}
					</div>
				</div>
			)
	);

	return (
		<Fragment>
			<div ref={paymentOptionsRef} className="position-relative">
				{is_table_cell ? (
					<>
						{payment_method?.payment_method_id ? (
							<div
								className="d-flex align-items-center"
								onMouseEnter={() => setShowEditButton(true)}
								onMouseLeave={() => setShowEditButton(false)}
							>
								<img
									src={getImageForPaymentMethodTable(
										payment_method
									)}
									style={{
										maxHeight: "15px",
										marginRight: "8px",
										minWidth: "20.63px",
									}}
								/>
								<div
									style={{
										margin: "0px 8px",
										paddingTop: "2px",
									}}
								>
									{payment_method?.payment_method_name}
								</div>
								{showEditButton && (
									<img
										src={edit}
										width={15}
										className="cursor-pointer"
										onClick={handleOpenPaymentListPopover}
									/>
								)}
							</div>
						) : (
							<div
								className="custom__dropdown__payment cursor-pointer"
								onClick={handleOpenPaymentListPopover}
							>
								Add Payment Method
								<img src={arrowdropdown} className="ml-2" />
							</div>
						)}
					</>
				) : (
					<div
						className={
							bulk_button_class
								? bulk_button_class
								: "appsad pt-1 pb-1 pl-2 pr-2 cursor-pointer"
						}
						style={
							bulk_button_class
								? {}
								: {
										border: "1px solid #ddddddcc",
										width: "max-content",
								  }
						}
						onClick={handleOpenPaymentListPopover}
					>
						Change Payment Method
						<img src={arrowdropdown} className="ml-2" />
					</div>
				)}
				<Popover
					refs={[paymentOptionsRef]}
					show={showPaymentOptions}
					align="center"
					className={popover_class}
					style={{ left: "0px !important" }}
				>
					<div className="d-flex flex-column m-0">
						<div
							className="border rounded d-flex"
							style={{ marginBottom: "8px" }}
						>
							<img
								src={search}
								aria-hidden="true"
								className="m-2"
							/>
							<input
								type="text"
								value={searchQuery}
								className="w-100 border-0"
								placeholder="Search"
								onChange={handleSearchQuery}
							/>
						</div>
						{paymentMethods.loading || loading ? (
							<Loader width={60} height={60} />
						) : paymentMethodList.length > 0 ? (
							<div
								className="d-flex flex-column"
								style={{
									overflowY: "auto",
									maxHeight: "250px",
								}}
							>
								{paymentMethodCards}
								<div
									className="custom__dropdown__payment__dropdown__option cursor-pointer font-12"
									onClick={() => handlePaymentSelect(null)}
									hidden={
										is_table_cell &&
										!payment_method?.payment_method_id
									}
								>
									Remove payment method
								</div>
							</div>
						) : (
							<div
								style={{
									textAlign: "center",
									fontSize: "14px",
									margintop: "5px",
									color: "#717171",
								}}
							>
								No Payment Methods
							</div>
						)}
					</div>
				</Popover>
			</div>
		</Fragment>
	);
}
