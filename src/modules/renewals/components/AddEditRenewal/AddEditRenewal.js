import { DatePicker } from "../../../../UIComponents/DatePicker/DatePicker";
import { SelectOld } from "../../../../UIComponents/SelectOld/Select";
import React, { useState } from "react";
import { Button } from "../../../../UIComponents/Button/Button";
import { mapValueToKeyState } from "../../../../utils/mapValueToKeyState";
import {
	RENEWAL_INTERVAL,
	RENEWAL_FREQUENCY,
	RENEWAL_FREQUENCY_DEFAULT,
} from "../../constants/constant";
import {
	convertArrayToBindSelect,
	convertObjToBindSelect,
} from "../../../../utils/convertDataToBindSelect";
import { RenewalPost } from "../../model/model";
import deleteIcon from "../../../../assets/icons/delete.svg";
import exclamation from "../../../../assets/icons/exclamation.svg";

export function AddEditRenewal(props) {
	const [renewal, setRenewal] = useState({
		frequency: props.renewal
			? props.renewal.frequency
			: RENEWAL_FREQUENCY.filter(
					(res) => res === RENEWAL_FREQUENCY_DEFAULT
			  )[0],
		interval: props.renewal
			? props.renewal.interval
			: RENEWAL_INTERVAL.Month,
		date: props.renewal ? props.renewal.date : new Date(),
		id: props.renewal ? props.renewal.id : null,
		renewalID: props.renewal ? props.renewal.renewalID : null,
	});
	const [showWarning, setShowWarning] = useState(false);

	const isEdit = renewal.renewalID ? true : false;

	const onCancel = (e) => {
		props.onCancel();
	};

	const onSave = (e) => {
		if (isEdit) props.editRenewal(new RenewalPost(renewal));
		else props.addRenewal(new RenewalPost(renewal));
	};

	const frequencyOptions = convertArrayToBindSelect(RENEWAL_FREQUENCY);
	const intervalOptions = convertObjToBindSelect(RENEWAL_INTERVAL);

	return (
		<div>
			<h3 className="z__header-secondary">
				{" "}
				Renewal
				{props.renewal && !showWarning && (
					<img
						onClick={props.onRemove}
						src={deleteIcon}
						className="float-right pointer"
					/>
				)}
			</h3>
			<hr />
			{!showWarning && (
				<div className="row d-flex flex-column grow">
					<div className="col-md-12">
						<p className="z__block-header text-left">
							Renews Every
						</p>
						<div className="d-flex flex-nowrap align-items-start">
							<SelectOld
								value={frequencyOptions.find(
									(res) => res.value === renewal.frequency
								)}
								style={{ width: "80px" }}
								classNames="flex-fill"
								options={frequencyOptions}
								isSearchable={false}
								onSelect={(v) =>
									mapValueToKeyState(
										setRenewal,
										v.value,
										renewal,
										"frequency"
									)
								}
							/>
							<SelectOld
								value={intervalOptions.find(
									(res) => res.value === renewal.interval
								)}
								style={{ width: "120px" }}
								classNames="flex-fill"
								options={intervalOptions}
								isSearchable={false}
								onSelect={(v) =>
									mapValueToKeyState(
										setRenewal,
										v.value,
										renewal,
										"interval"
									)
								}
							/>
						</div>
					</div>
					<div className="col-md-12">
						<p className="z__block-header text-left">
							{" "}
							Upcoming Renewal Date
						</p>
						<DatePicker
							minDate={new Date()}
							value={renewal.date}
							onChange={(v) => {
								mapValueToKeyState(
									setRenewal,
									v,
									renewal,
									"date"
								);
							}}
							formatter={(d) =>
								`${d.getUTCDate()}/${
									d.getUTCMonth() + 1
								}/${d.getUTCFullYear()}`
							}
						/>
					</div>
					<div className="col-md-12 mt-4 mr text-right">
						<Button onClick={onCancel} type="link" className="mr-4">
							{" "}
							Cancel{" "}
						</Button>
						<Button
							onClick={() =>
								isEdit ? setShowWarning(true) : onSave()
							}
						>
							{" "}
							Save{" "}
						</Button>
					</div>
				</div>
			)}
			{showWarning && (
				<div>
					<div className="row">
						<div className="col-md-12 md-4  text-center">
							<img src={exclamation} width={40} />
							<p className="z__description-highlight mt-2">
								Changing the renewal will reset all the future
								renewal dates &amp; reminders.
							</p>
							<p className="z__description-secondary">
								Do you wish to continue?
							</p>
						</div>
					</div>
					<div className="col-md-12 mt-4 mr text-right">
						<Button onClick={onSave}> Continue </Button>
						<Button onClick={onCancel} type="link" className="mr-4">
							{" "}
							Cancel{" "}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
