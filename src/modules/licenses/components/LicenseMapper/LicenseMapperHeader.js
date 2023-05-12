import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import backarrow from "../../../../assets/licenses/backarrow.svg";
import rightarrow from "../../../../assets/licenses/rightarrow.svg";
import { useHistory } from "react-router-dom";
import { Modal } from "UIComponents/Modal/Modal";
import LongTextTooltip from "modules/shared/components/LongTextTooltip/LongTextTooltip";
import { useSelector } from "react-redux";
import _ from "underscore";

export default function LicenseMapperHeader({
	contractInfo,
	firstStep,
	contractId,
	hasIntegration,
	setFirstStep,
	fetchUnmappedLicensesData,
}) {
	const history = useHistory();
	const [showExitConfirmation, setShowExitConfirmation] = useState(false);
	const { data, initialData } = useSelector((state) => state.licenseMapper);

	useEffect(() => {
		return () => {
			setShowExitConfirmation(true);
		};
	}, []);

	const exitConfirmationRequired = () => {
		return !_.isEqual(data, initialData);
	};

	return (
		<>
			<Card className="plan__header__wrapper">
				<div
					className="d-flex align-items-center"
					style={{ width: "60%" }}
				>
					<div className="ml-2">
						<img
							className="cursor-pointer"
							width={16}
							src={backarrow}
							onClick={() => {
								if (firstStep) {
									history.push(
										`/licenses/${contractInfo?.type}s/${contractId}#overview`
									);
								} else {
									if (exitConfirmationRequired()) {
										setShowExitConfirmation(true);
									} else {
										history.push(
											`/licenses/${contractInfo?.type}s/${contractId}#overview`
										);
									}
								}
							}}
						/>
					</div>
					<div className="ml-2">
						<LongTextTooltip
							text={contractInfo?.name}
							maxWidth="500px"
							placement="bottom"
						/>
					</div>
					<div className="ml-2">
						<img width={6} src={rightarrow} />
					</div>
					<div className="ml-2" style={{ minWidth: "180px" }}>
						Map Licenses
					</div>
				</div>
			</Card>
			{showExitConfirmation && (
				<Modal
					show={showExitConfirmation}
					onClose={() => setShowExitConfirmation(false)}
					size="md"
					footer={true}
					ok={"Yes"}
					onOk={() => {
						if (hasIntegration) {
							setFirstStep(true);
							fetchUnmappedLicensesData();
						} else {
							history.push(
								`/licenses/${contractInfo?.type}s/${contractId}#overview`
							);
						}
						setShowExitConfirmation(false);
					}}
					title={"Exit the license mapper?"}
				>
					<div className="font-14 w-100 d-flex justify-content-center">
						Any unsaved changes will be lost. Are you sure you want
						to continue?
					</div>
				</Modal>
			)}
		</>
	);
}
