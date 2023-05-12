import React, { useContext, useState } from "react";
import { AddTransactionModal } from "../Modals/AddTransactionModal";
import empty from "../../Applications/AllApps/Transactions/empty.svg";
import add from "../../../assets/addwhite.svg";
import { addTransaction } from "../../../services/api/transactions";
import { useDispatch } from "react-redux";
import { fetchRecognisedTransactions } from "../../../actions/transactions-action";
import { propTypes } from "react-bootstrap/esm/Image";
import RoleContext from "../../../services/roleContext/roleContext";

export function Empty(props) {
	const [addModalOpen, setAddModalOpen] = useState(false);
	const dispatch = useDispatch();
	const handleAdd = (transaction) => {
		addTransaction(transaction).then(() => {
			props.refresh();
			setAddModalOpen(false);
		});
	};
	const { isViewer } = useContext(RoleContext);

	return (
		<div
			className="d-flex flex-column justify-content-center align-items-center"
			style={{ margin: "auto" }}
		>
			<img src={empty} width={200} />
			<div className="empty-header">No transactions added</div>
            {
				!isViewer &&
				<>
					<div className="empty-lower">
						You can add transactions via a csv or
						an integration like Quickbooks
					</div>
					<button
						className="empty-page-button mt-2"
						onClick={() => setAddModalOpen(true)}
					>
						<img className="mr-2" src={add} />
						Add Transactions
					</button>
					<AddTransactionModal
						handleClose={() => setAddModalOpen(false)}
						isOpen={addModalOpen}
						handleSubmit={handleAdd}
					/>
				</>
			}
		</div>
	);
}
