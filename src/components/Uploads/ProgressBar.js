import React from "react";
import PropTypes from "prop-types";
import "./Uploads.css";
import styled from "styled-components";
const Contanier = styled.div`
	progress[value] {
		width: ${(props) => props.width};
	}
`;
const ProgressBar = (props) => {
	const { value, max, width } = props;
	return (
		<Contanier width={width}>
			<div className="d-flex flex-column align-items-center ">
				<progress value={value} max={max} className="mr-2" />
				<div className="per__uploads__div2">
					<span className="per__uploads__text1">
						{(value / max) * 100}% uploaded
					</span>
					<span className="per__uploads__text2">
						{(value / max) * 100}%
					</span>
				</div>
			</div>
		</Contanier>
	);
};
ProgressBar.propTypes = {
	value: PropTypes.number.isRequired,
	max: PropTypes.number,
	width: PropTypes.string,
};
ProgressBar.defaultProps = {
	max: 100,
	width: "308px",
};
export default ProgressBar;
