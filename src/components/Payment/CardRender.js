import React, {
	Component,
	useState,
	useEffect,
	useRef,
	useContext,
} from "react";
import "./CardRender.css";
import Amex from "assets/transactions/Amex.svg";
import MasterCard from "./MasterCard.svg";
import defaultLogo from "./defaultLogo.svg";
import Visa from "./Visa.svg";
import useOutsideClick from "../../common/OutsideClick/OutsideClick";
import vector2 from "./vector2.svg";
import vector2other from "./vector2other.svg";
import vector3other from "./vector3other.svg";
import vector3 from "./vector3.svg";
import vectora1 from "./vectora1.svg";
import vectora2 from "./vectora2.svg";
import {
	editPaymentMethod,
	deletePaymentMethod,
} from "../../services/api/transactions";
import {
	fetchPaymentMethods,
	resetTransactionsState,
} from "../../actions/transactions-action";
import { useDispatch, useSelector } from "react-redux";
import vectorb1 from "./vectorb1.svg";
import vectorb2 from "./vectorb2.svg";
import vectorc1 from "./vectorc1.svg";
import vectorc2 from "./vectorc2.svg";
import logs from "./logs.svg";
import { EditBank } from "./EditBank";
import { EditCard } from "./EditCard";
import { DeleteCard } from "./DeleteCard";
import { EditOther } from "./EditOther";
import RoleContext from "../../services/roleContext/roleContext";
import { clearAllV2DataCache } from "modules/v2InfiniteTable/redux/v2infinite-action";
import { v2EntitiesTransactions } from "constants";
import { TriggerIssue } from "utils/sentry";

function refreshTables(dispatch) {
	dispatch(fetchPaymentMethods());
	dispatch(clearAllV2DataCache(v2EntitiesTransactions.recognized));
	dispatch(clearAllV2DataCache(v2EntitiesTransactions.unrecognized));
}

function OtheyPay(props) {
	const orgId = useSelector((state) => state.userInfo.org_id);
	const orgName = useSelector((state) => state.userInfo.org_name);
	const dispatch = useDispatch();
	const ref = useRef();
	const [editopen, seteditopen] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [deleteCardOpen, setDeleteCardOpen] = useState(false);
	const [editCardOpen, setEditCardOpen] = useState(false);
	const { isViewer } = useContext(RoleContext);
	const handleCardChange = (payment, id) => {
		setSubmitting(true);
		if (id) {
			editPaymentMethod(id, payment)
				.then(() => {
					refreshTables(dispatch);
					setSubmitting(false);
				})
				.catch((err) => {
					setSubmitting(false);
					TriggerIssue("Error in editing payment method", err);
				});
		}
	};
	const handleDelete = () => {
		setDeleteCardOpen(true);
		seteditopen(false);
	};
	const deletePayment = (id) => {
		if (id) {
			deletePaymentMethod(id).then(() => {
				dispatch(resetTransactionsState());
				refreshTables(dispatch);
			});
		}
		setDeleteCardOpen(false);
	};
	useOutsideClick(ref, () => {
		if (editopen) seteditopen(false);
	});

	function handleEdit() {
		setEditCardOpen(true);
		seteditopen(false);
	}
	const clickedOnEditDeleteButton = () => {
		seteditopen(!editopen);
		window.analytics.track(
			"Clicked on Edit/Delete Payment Dropdown Button",
			{
				currentCategory: "Transactions",
				currentPageName: "Payment-Methods",
				orgId: orgId || "",
				orgName: orgName || "",
			}
		);
	};
	return (
		<>
			<div
				className="other__payment__body mb-4"
				style={{ marginRight: "22px" }}
			>
				<img src={vector2other} className="vector2__pay__other"></img>
				<img src={vector3other} className="vector3__pay__other"></img>
				<img
					src={props.logo || defaultLogo}
					width="45"
					className="mr-2"
				></img>
				<div className="other__payment__d1">{props.name}</div>
				{!isViewer && (
					<>
						<button
							type="submit"
							className="bankacc__edit"
							onClick={clickedOnEditDeleteButton}
						>
							<img src={logs}></img>
						</button>
						{editopen ? (
							<div
								className="edit__option__payment menu"
								ref={(el) => {
									if (el) {
										ref.current = el;
									}
								}}
							>
								<button
									className="edit__option__payment__button"
									onClick={() => handleEdit()}
								>
									Edit Payment
								</button>
								<hr style={{ margin: "0px 18px" }}></hr>
								<button
									className="edit__option__payment__button"
									onClick={() => handleDelete(props.id)}
								>
									Delete Payment
								</button>
							</div>
						) : null}
					</>
				)}
				{
					<EditOther
						card={props}
						show={editCardOpen}
						onHide={() => setEditCardOpen(false)}
						submitInProgress={submitting}
						handleSubmit={handleCardChange}
					/>
				}
				<DeleteCard
					card={props}
					show={deleteCardOpen}
					onHide={() => setDeleteCardOpen(false)}
					onDelete={() => deletePayment(props.id)}
				/>
			</div>
		</>
	);
}
function BankAcc(props) {
	const ref = useRef();
	const cl = ["bankacc__body1", "bankacc__body2", "bankacc__body3"];
	const [clname, setclname] = useState("");
	const [deleteCardOpen, setDeleteCardOpen] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const { isViewer } = useContext(RoleContext);
	useEffect(() => {
		setclname(cl[Math.floor(Math.random() * cl.length)]);
	}, []);

	const vn = [
		[vectora1, vectora2],
		[vectorb1, vectorb2],
		[vectorc1, vectorc2],
	];

	const dispatch = useDispatch();

	const [editopen, seteditopen] = useState(false);
	const [editCardOpen, setEditCardOpen] = useState(false);
	const handleCardChange = (payment, id) => {
		setSubmitting(true);
		if (id) {
			editPaymentMethod(id, payment)
				.then(() => {
					refreshTables(dispatch);
					setSubmitting(false);
				})
				.catch((err) => {
					setSubmitting(false);
					TriggerIssue("Error in editing bank account", err);
				});
		}
	};

	const handleDelete = () => {
		setDeleteCardOpen(true);
		seteditopen(false);
	};

	const deletePayment = (id) => {
		if (id) {
			deletePaymentMethod(id).then(() => {
				dispatch(resetTransactionsState());
				refreshTables(dispatch);
			});
		}
		setDeleteCardOpen(false);
	};
	useOutsideClick(ref, () => {
		if (editopen) seteditopen(false);
	});

	function handleEdit() {
		setEditCardOpen(true);
		seteditopen(false);
	}

	return (
		<div className={clname} style={{ marginRight: "22px" }}>
			<img
				src={
					clname === "bankacc__body1"
						? vectora1
						: clname === "bankacc__body2"
						? vectorb1
						: vectorc1
				}
				className={
					clname === "bankacc__body1"
						? "vectora1cn"
						: clname === "bankacc__body2"
						? "vectorb1cn"
						: "vectorc1cn"
				}
			></img>
			<img
				src={
					clname === "bankacc__body1"
						? vectora2
						: clname === "bankacc__body2"
						? vectorb2
						: vectorc2
				}
				className={
					clname === "bankacc__body1"
						? "vectora2cn"
						: clname === "bankacc__body2"
						? "vectorb2cn"
						: "vectorc2cn"
				}
			></img>
			<div className="bankacc__body__d1">
				<div className="bankacc__bankname">{props.bankname}</div>
				<div className="bankacc__benefname">
					<div className="bankacc__benefname1">Beneficiary Name</div>
					<div className="bankacc__benefname2">{props.benefname}</div>
				</div>
				<div className="bankacc__bankaccno">
					<div className="bankacc__bankaccno1">Bank Account No.</div>
					<div className="bankacc__bankaccno2">{props.number}</div>
				</div>
			</div>
			{!isViewer && (
				<>
					<button
						type="submit"
						className="bankacc__edit"
						onClick={() => seteditopen(!editopen)}
					>
						<img src={logs}></img>
					</button>
					{editopen ? (
						<div
							className="edit__option__payment menu"
							ref={(el) => {
								if (el) {
									ref.current = el;
								}
							}}
						>
							<button
								className="edit__option__payment__button"
								onClick={() => handleEdit()}
							>
								Edit Account
							</button>
							<hr
								style={{ margin: "0px 18px", borderTop: "0px" }}
							></hr>
							<button
								className="edit__option__payment__button"
								onClick={() => handleDelete(props.id)}
							>
								Delete Account
							</button>
						</div>
					) : null}
				</>
			)}
			{
				<EditBank
					card={props}
					show={editCardOpen}
					onHide={() => setEditCardOpen(false)}
					submitInProgress={submitting}
					handleSubmit={handleCardChange}
				/>
			}
			<DeleteCard
				card={props}
				show={deleteCardOpen}
				onHide={() => setDeleteCardOpen(false)}
				onDelete={() => deletePayment(props.id)}
			/>
		</div>
	);
}
function CreditCard(props) {
	const dispatch = useDispatch();
	const ref = useRef();
	const [editopen, seteditopen] = useState(false);
	const [editCardOpen, setEditCardOpen] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [deleteCardOpen, setDeleteCardOpen] = useState(false);
	const { isViewer } = useContext(RoleContext);
	const handleCardChange = (payment, id) => {
		setSubmitting(true);
		if (id) {
			editPaymentMethod(id, payment)
				.then(() => {
					setSubmitting(false);
					refreshTables(dispatch);
				})
				.catch((err) => {
					setSubmitting(false);
					TriggerIssue("Error in editing card", err);
				});
		}
	};
	const handleDelete = () => {
		setDeleteCardOpen(true);
		seteditopen(false);
	};
	const deletePayment = (id) => {
		if (id) {
			deletePaymentMethod(id).then(() => {
				dispatch(resetTransactionsState());
				refreshTables(dispatch);
			});
		}
		setDeleteCardOpen(false);
	};
	useOutsideClick(ref, () => {
		if (editopen) seteditopen(false);
	});

	function handleEdit() {
		setEditCardOpen(true);
		seteditopen(false);
	}

	return (
		<div
			className={
				props.masorvi === "visa"
					? "credit-card__body__vis"
					: "credit-card__body__mas"
			}
			style={{ marginRight: "22px" }}
		>
			<img
				src={vector2}
				className={
					props.masorvi === "visa"
						? "vector2__pay__vis"
						: "vector2__pay__mas"
				}
			></img>
			<img
				src={vector3}
				className={
					props.masorvi === "visa"
						? "vector3__pay__vis"
						: "vector3__pay__mas"
				}
			></img>
			<div className="credit-card__left">
				<div className="credit-card__bankname">{props.bankname}</div>
				<div className="credit-card__number">{props.number}</div>
			</div>
			<div className="credit-card__right">
				<div className="credit-card__logo">
					<img
						src={
							props.masorvi === "visa"
								? Visa
								: props.masorvi === "mastercard"
								? MasterCard
								: Amex
						}
						alt="MasterCard"
					></img>
				</div>
			</div>
			{!isViewer && (
				<>
					<button
						type="submit"
						className="bankacc__edit"
						onClick={() => seteditopen(!editopen)}
					>
						<img src={logs}></img>
					</button>
					{editopen ? (
						<div
							className="edit__option__payment menu"
							ref={(el) => {
								if (el) {
									ref.current = el;
								}
							}}
						>
							<button
								className="edit__option__payment__button"
								onClick={() => handleEdit()}
							>
								Edit Card
							</button>
							<hr style={{ margin: "0px 18px" }}></hr>
							<button
								className="edit__option__payment__button"
								onClick={() => handleDelete(props.id)}
							>
								Delete Card
							</button>
						</div>
					) : null}
				</>
			)}

			<EditCard
				card={props}
				show={editCardOpen}
				onHide={() => setEditCardOpen(false)}
				submitInProgress={submitting}
				handleSubmit={handleCardChange}
			/>
			<DeleteCard
				card={props}
				show={deleteCardOpen}
				onHide={() => setDeleteCardOpen(false)}
				onDelete={() => deletePayment(props.id)}
			/>
		</div>
	);
}

export default class CardRender extends Component {
	render() {
		const cardTypeToLogo = {
			MASTERCARD: MasterCard,
			VISA: Visa,
		};
		let card;
		if (this.props.type === "credit") {
			card = (
				<CreditCard
					id={this.props.id}
					colour={this.props.col}
					bankname={this.props.bankname}
					number={this.props.number}
					expiry_year={this.props.expiry_month}
					expiry_month={this.props.expiry_year}
					uid={this.props.uid}
					masorvi={this.props.masorvi}
					currency={this.props.currency}
				/>
			);
		} else if (this.props.type === "bank") {
			card = (
				<BankAcc
					id={this.props.id}
					colour={this.props.col}
					bankname={this.props.bankname}
					number={this.props.number}
					uid={this.props.uid}
					benefname={this.props.benefname}
					currency={this.props.currency}
				/>
			);
		} else if (this.props.type === "other") {
			card = (
				<OtheyPay
					id={this.props.id}
					name={this.props.method}
					logo={this.props.logo}
					currency={this.props.currency}
				></OtheyPay>
			);
		}
		return <>{card}</>;
	}
}
