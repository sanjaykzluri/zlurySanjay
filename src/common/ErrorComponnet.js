import React from "react";
import PropTypes from "prop-types";
import NoResultsFoundSVG from "../assets/search__outer2.svg";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../UIComponents/Button/Button";
import { push } from "connected-react-router";

export function ErrorComponent({ onReset }) {
	const dispatch = useDispatch();
	const router = useSelector((state) => state.router);
	const { hash } = router.location;
	return (
		<div
			style={{ height: "75%", margin: "auto" }}
			className="d-flex flex-column justify-content-center align-items-center"
		>
			<img className="pl-3 mb-2" src={NoResultsFoundSVG} width={200} />
			<div className="empty-header">
				Could not find anything with the applied filters
			</div>
			<div className="empty-lower">Try a different filter</div>
			<Button
				onClick={() => {
					dispatch(push(hash || router.location.pathname));
					onReset && onReset();
				}}
				className="mt-3"
			>
				Reset Filters
			</Button>
		</div>
	);
}
