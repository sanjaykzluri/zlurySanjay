import React, { useEffect, useState } from "react";
import { setStepperWidth, updateStepperData } from "common/Stepper/redux";
import { useDispatch, useSelector } from "react-redux";
import BasePriceAndCurrency from "./ContractStepsComponents/BasePriceAndCurrency";
import LicenseDetailsHeaders from "./ContractStepsComponents/LicenseDetailsHeaders";
import LicenseDetailsInfoSection from "./ContractStepsComponents/LicenseDetailsInfoSection";
import LicenseDetailsAddLicense from "./ContractStepsComponents/LicenseDetailsAddLicense";
import ContractSetupFeeAndDisc from "./ContractStepsComponents/ContractSetupFeeAndDisc";
import { Button } from "UIComponents/Button/Button";
import { screenEntity } from "modules/licenses/constants/LicenseConstants";
import { validateLicenses } from "modules/licenses/utils/LicensesUtils";

export default function LicenseDetails({ updateStep, entity }) {
	const dispatch = useDispatch();
	const { data } = useSelector((state) => state.stepper);
	const [licenseArray, setLicenseArray] = useState(data?.licenses || []);
	const [deletedLicenses, setDeletedLicenses] = useState([]);
	const [warning, setWarning] = useState(false);

	useEffect(() => {
		dispatch(
			setStepperWidth(entity === screenEntity.CONTRACT ? 1180 : 1065)
		);
	}, []);

	useEffect(() => {
		if (data?.renewed_contract_id) {
			setLicenseArray([...data?.licenses]);
		}
	}, [data?.renewed_contract_id]);

	const updateData = (data) => {
		dispatch(updateStepperData(data));
	};

	const onDeleteLicense = (index) => {
		let tempLicenseArray = [...licenseArray];
		if (window.location.pathname?.includes("edit")) {
			let tempDeletedLicenses = [...deletedLicenses];
			tempDeletedLicenses.push(licenseArray[index]);
			setDeletedLicenses(tempDeletedLicenses);
		}
		tempLicenseArray.splice(index, 1);
		setLicenseArray(tempLicenseArray);
		updateData({
			licenses: tempLicenseArray,
		});
	};

	const onSaveLicense = (license) => {
		let temp = [...licenseArray];
		temp.push(license);
		setLicenseArray([...temp]);
		updateData({
			licenses: [...temp],
		});
	};

	useEffect(() => {
		let tempArray = [...licenseArray];

		for (const license of tempArray) {
			for (const group of license.groups) {
				if (!!group.start_date && !!group.end_date) {
					if (
						new Date(data?.end_date) < new Date(group.end_date) ||
						new Date(data?.start_date) > new Date(group.end_date)
					) {
						group.end_date = data?.end_date;
					}
					if (
						new Date(data?.start_date) >
							new Date(group.start_date) ||
						new Date(data?.end_date) < new Date(group.start_date)
					) {
						group.start_date = data?.start_date;
					}
				} else {
					if (!group.start_date) {
						group.start_date = data?.start_date;
					} else {
						if (
							new Date(data?.start_date) >
							new Date(group.start_date)
						) {
							group.start_date = data?.start_date;
						}
					}
					if (!group.end_date) {
						group.end_date = data?.end_date;
					} else {
						if (
							new Date(data?.end_date) < new Date(group.end_date)
						) {
							group.end_date = data?.end_date;
						}
					}
				}
			}
		}
		setLicenseArray([...tempArray]);
		updateData({
			licenses: [...tempArray],
		});
	}, [data?.start_date, data?.end_date]);

	return (
		<>
			<BasePriceAndCurrency
				data={data}
				updateData={updateData}
				entity={entity}
			/>
			<LicenseDetailsHeaders entity={entity} />
			<LicenseDetailsInfoSection
				key={licenseArray}
				data={data}
				licenses={licenseArray}
				setLicenseArray={setLicenseArray}
				onDeleteLicense={(index) => onDeleteLicense(index)}
				entity={entity}
				updateData={updateData}
			/>
			<LicenseDetailsAddLicense
				data={data}
				licenses={licenseArray}
				updateData={updateData}
				entity={entity}
				onSaveLicense={(license) => onSaveLicense(license)}
			/>
			<hr style={{ margin: "5px 0px" }} />
			<ContractSetupFeeAndDisc
				data={data}
				updateData={updateData}
				entity={entity}
			/>
			{!!warning && (
				<div className="warningMessage w-100 mt-2 p-1 d-flex justify-content-center">
					{warning}
				</div>
			)}
			<Button
				onClick={() => {
					if (validateLicenses(data?.licenses, entity, data)) {
						setWarning(
							validateLicenses(data?.licenses, entity, data)
						);
						setTimeout(() => setWarning(false), 10000);
						return;
					}
					updateData({
						licenses: licenseArray,
						base_price: data?.has_base_price
							? Number.parseFloat(data?.base_price) || 0
							: null,
					});
					updateStep();
					if (window.location.pathname?.includes("edit")) {
						updateData({ deletedLicenses: deletedLicenses });
					}
				}}
				style={{ width: "132px", height: "38px", marginTop: "10px" }}
			>
				Next
			</Button>
		</>
	);
}
