import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../UIComponents/Button/Button";
import GettingStartedModal from "./GettingStartedModal";
import PendingIcon from "./pending-status.svg";
import { hideGettingStartedModal, showGettingStartedModal } from "./redux";

export default function GettingStartedButton(props) {
    const gettingStartedStatuses = useSelector(state => state?.gettingStartedStatuses);
	const showModal = useSelector(state => state?.showGettingStartedModal);
    const remainingCount =gettingStartedStatuses && Object.keys(gettingStartedStatuses).reduce((count, key) => {
        if(!gettingStartedStatuses[key]) return count+1
        return count
    }, 0);
	const dispatch = useDispatch();
	return (
        <>
		{remainingCount !== 0 && <Button type="normal" className="getting__started__progress__button">
			<div className="position-relative mr-2">
				<img src={PendingIcon} />
                <div className="getting__started__remaining-count">{remainingCount}</div>
			</div>
			<div onClick={() => dispatch(showGettingStartedModal())}>Getting Started</div>
		</Button>}
        <GettingStartedModal
				show={showModal}
				onClose={() => dispatch(hideGettingStartedModal())}
			/>
        </>
	);
}
