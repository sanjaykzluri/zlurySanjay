import React, { useEffect, useState } from "react";
import { Modal, Spinner } from "react-bootstrap";
import { getAdmins } from "services/api/settings";
import { TriggerIssue } from "utils/sentry";
import cross from "../../../assets/reports/cross.svg";
import { AsyncTypeahead } from "../../../common/Typeahead/AsyncTypeahead";
import {
	markUserForOnbaordOffboard,
	getTimezones,
} from "../../../services/api/users";
import { Button } from "../../../UIComponents/Button/Button";
import { capitalizeFirstLetter } from "../../../utils/common";
import inactive from "assets/agents/inactive.svg";
import moment from "moment-timezone";
import {
	addTimeToDate,
	dateResetTimeZone,
	timeGenerator,
} from "utils/DateUtility";
import { Select } from "UIComponents/Select/Select";
import { DatePicker } from "UIComponents/DatePicker/DatePicker";
import "./markForOnOffboarding.css";

export default function MarkForOnboardingOffboardingModal({
	isOpen,
	checked,
	markedType,
	checkAll,
	filter_by,
	checkAllExceptionData,
	handleClose,
	fullRowArray,
	fullRowMessage,
	setFullRowArray,
	setFullRowmessage,
	fetchUserTabCount,
	handleRefresh,
	totalUserCount,
	isUsersTable = false,
}) {
	const count = checkAll
		? totalUserCount - checkAllExceptionData?.length
		: checked?.length;
	const [selectedOwner, setSelectedOwner] = useState();
	const [reqDate, setReqDate] = useState();
	const [submitInProgress, setSubmitInProgress] = useState(false);
	const [error, setError] = useState();
	const [timsezones, setTimezones] = useState();
	const [dateAndTimezone, setDateAndTimezone] = useState();

	useEffect(() => {
		if (timsezones) {
			const localTimeZone = moment.tz.guess();
			const defaultTimezone = timsezones?.filter((timezone) =>
				timezone?.utc?.includes(localTimeZone)
			);
			let defaultValues = [
				{
					name: "timezone",
					value: defaultTimezone?.[0],
				},
				{
					name: "time",
					value:
						markedType === "onboarding" ? "06:00 AM" : "06:00 PM",
				},
			];
			defaultValues?.map((item) =>
				handleDateAndTimezone({
					target: { name: item.name, value: item.value },
				})
			);
		}
	}, [timsezones]);

	useEffect(() => {
		if (!timsezones) {
			getTimezones()
				.then((res) => {
					if (Array.isArray(res)) {
						setTimezones(res);
					} else {
						setTimezones([]);
					}
				})
				.catch((err) => {
					setTimezones([]);
					TriggerIssue("Error in get Timezones", err);
				});
		}
	}, [timsezones]);

	const handleSubmit = async () => {
		try {
			setSubmitInProgress(true);
			let reqBody = {
				user_ids: checked,
				date: reqDate,
				assigned_to: selectedOwner?._id,
				type: markedType,
				display_values: dateAndTimezone,
			};

			if (checkAll) {
				reqBody.set_all = true;
				reqBody.filter_by = filter_by;
				reqBody.user_ids = checkAllExceptionData;
			}
			const res = await markUserForOnbaordOffboard(reqBody);
			if (res.status === "success") {
				setSubmitInProgress(false);
				handleClose();
				if (!isUsersTable) {
					let tempArray = [...fullRowArray];
					let tempMessage = [...fullRowMessage];

					checked.forEach((el) => {
						let index = tempMessage.findIndex(
							(row) => row.id === el
						);
						if (index > -1) {
							tempMessage.splice([index], 1);
						}
						tempMessage.push({
							id: el,
							message: `has been marked for ${markedType}`,
							type: markedType,
						});
						let index2 = tempArray.findIndex((row) => row === el);
						if (index2 > -1) {
							tempArray.splice([index2], 1);
						}
						tempArray.push(el);
					});
					setFullRowArray && setFullRowArray(tempArray);
					setFullRowmessage && setFullRowmessage(tempMessage);
				}
				fetchUserTabCount && fetchUserTabCount();
				handleRefresh && handleRefresh();
			}
		} catch (err) {
			setSubmitInProgress(false);
			setError(err?.response?.data?.errors || err.message);
			TriggerIssue(`Error marking users for ${markedType}`, err);
		}
	};

	const handleDateAndTimezone = (e) => {
		const { name, value } = e.target;
		setDateAndTimezone((prev = {}) => {
			if (
				(name === "time" || prev?.time) &&
				(name === "timezone" || prev?.timezone) &&
				(name === "date" || prev?.date)
			) {
				const t = name === "time" ? value : prev?.time;
				const d = name === "date" ? value : prev?.date;
				const tz =
					name === "timezone" ? value?.utc : prev?.timezone?.utc;
				let splittedTime = t?.split(" ");
				let u = splittedTime[1];
				const newDate = addTimeToDate(t, u, d);
				const selectedTimeZone = tz?.[0];
				const localTimeZone = moment.tz.guess();
				moment.tz.setDefault(selectedTimeZone);
				const effectiveDate = moment(newDate)
					.tz(selectedTimeZone, true)
					.toJSON();
				setReqDate(effectiveDate);
				moment.tz.setDefault(localTimeZone);
			}
			return { ...prev, [name]: value };
		});
	};

	const runTimeUI = (
		<>
			<div className="d-flex align-items-center">
				<DatePicker
					key={`${dateAndTimezone}`}
					placeholder={`${capitalizeFirstLetter(markedType)} Date`}
					onChange={(date) => {
						handleDateAndTimezone({
							target: {
								name: "date",
								value: dateResetTimeZone(date),
							},
						});
					}}
					calendarClassName="rangefilter-calendar"
					calendarContainerClassName="schedule-date-calendar"
					value={dateAndTimezone?.date || null}
					style={{ background: "white" }}
					minDate={new Date()}
				/>
				<Select
					selectorClassStyle={{
						textTransform: "none !important",
						minWidth: "130px",
					}}
					optionsContainerClassName="mark-for-on-off-boarding-time-picker"
					className="flex-fill black-1 w-auto ml-2 my-1"
					options={timeGenerator(30)}
					fieldNames={{
						label: "time",
					}}
					placeholder="Time"
					value={
						dateAndTimezone?.time
							? {
									time: dateAndTimezone?.time,
									value: dateAndTimezone?.time,
							  }
							: null
					}
					onChange={(obj) => {
						handleDateAndTimezone({
							target: {
								name: "time",
								value: obj?.value,
							},
						});
					}}
				/>
			</div>
		</>
	);

	return (
		<>
			<Modal
				show={isOpen}
				onHide={handleClose}
				centered
				contentClassName="adduser__accessedby__modal"
			>
				{!error ? (
					<div
						className="adduser__accessedby__cont"
						style={{ height: "fit-content" }}
					>
						<div
							className="adduser__accessedby__cont__topmost"
							style={{
								backgroundColor: "rgba(235, 235, 235, 0.5)",
							}}
						>
							<div className="adduser__accessedby__cont__topmost__heading">
								{`Mark ${count} user${
									count === 1 ? "" : "s"
								} for ${capitalizeFirstLetter(markedType)}`}
							</div>
							<img
								alt=""
								src={cross}
								height={12}
								width={12}
								onClick={() => handleClose()}
								className="adduser__accessedby__cont__closebutton"
							/>
						</div>
						<div
							className="d-flex flex-column"
							style={{ marginTop: "17px" }}
						>
							<div className="quick_review_suggestion_box mb-4">
								<div className="d-flex align-items-center">
									<div className="d-flex flex-column w-100 ">
										<AsyncTypeahead
											label={`Assign ${capitalizeFirstLetter(
												markedType
											)} to`}
											placeholder="Search User"
											fetchFn={getAdmins}
											onSelect={(selection) => {
												setSelectedOwner(selection);
											}}
											requiredValidation={false}
											keyFields={{
												id: "_id",
												image: "profile_img",
												value: "name",
												email: "email",
											}}
											allowFewSpecialCharacters={true}
											labelClassName="font-14 bold-600"
											onChange={() => setSelectedOwner()}
											style={{ marginBottom: "7px" }}
										/>
									</div>
								</div>
							</div>
							<div className="quick_review_suggestion_box">
								<div className="d-flex align-items-center">
									<div className="font-14 bold-600">{`Set ${capitalizeFirstLetter(
										markedType
									).slice(0, -3)} Date`}</div>
								</div>
								<div
									className="d-flex flex-column"
									style={{ marginTop: "8px" }}
								>
									<Select
										key={Math.random()}
										filter
										search
										selectorClassStyle={{
											textTransform: "none !important",
										}}
										isOptionsLoading={!timsezones}
										className="flex-fill black-1 w-auto my-1"
										options={timsezones}
										fieldNames={{
											label: "text",
										}}
										placeholder="Timezone"
										value={
											dateAndTimezone?.timezone
												? [dateAndTimezone?.timezone]
												: null
										}
										onChange={(obj) => {
											handleDateAndTimezone({
												target: {
													name: "timezone",
													value: obj,
												},
											});
										}}
									/>
									{runTimeUI}
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="d-flex flex-column align-items-center mt-5">
						<img
							alt=""
							src={inactive}
							height="54px"
							width="54px"
							style={{ marginBottom: "10px" }}
						/>
						<h5>Server Error!</h5>
						<p>We couldn't complete your request.</p>
					</div>
				)}
				<Modal.Footer>
					<Button type="link" onClick={() => handleClose()}>
						Cancel
					</Button>
					<Button
						onClick={() => (error ? setError() : handleSubmit())}
						disabled={!reqDate || !selectedOwner?._id}
					>
						{submitInProgress ? (
							<Spinner
								animation="border"
								role="status"
								variant="light"
								size="sm"
								className="ml-2"
								style={{ borderWidth: 2 }}
							>
								<span className="sr-only">Loading...</span>
							</Spinner>
						) : error ? (
							"Try Again"
						) : (
							"Save"
						)}
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
}
