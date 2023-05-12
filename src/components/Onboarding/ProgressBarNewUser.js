import React from "react";
import PropTypes from "prop-types";
import "./Onboarding.css";
import styled from "styled-components";
const Contanier = styled.div`
	progress[value] {
		width: ${(props) => props.width};

		color: #2266e2;
	}
`;
const ProgressBarNewUser = (props) => {
	const { value, max, width } = props;
	return (
		<Contanier width={width}>
			<div className="d-flex flex-column align-items-center ">
				<progress value={value} max={max} className="mr-2" />
			</div>
		</Contanier>
	);
};
ProgressBarNewUser.propTypes = {
	value: PropTypes.number.isRequired,
	max: PropTypes.number,
	width: PropTypes.string,
};
ProgressBarNewUser.defaultProps = {
	max: 100,
	width: "175px",
};
export default ProgressBarNewUser;
