import React, { useState, useRef, useContext } from "react";
import { Spinner, Dropdown } from "react-bootstrap";
import { Button } from "UIComponents/Button/Button";
import EllipsisSVG from "assets/icons/ellipsis-v.svg";
import { Popover } from "UIComponents/Popover/Popover";
import RoleContext from "services/roleContext/roleContext";
import { runSpendTrigger } from "services/api/transactions";
import NewDatePicker from "UIComponents/DatePicker/NewDatePicker";
import { useOutsideClickListener } from "utils/clickListenerHook";
import { ProgressBarLoader } from "common/Loader/ProgressBarLoader";
import { ApiResponseNotification } from "modules/shared/components/ApiResponseNotification/ApiResponseNotification";
import { apiResponseTypes } from "modules/shared/components/ApiResponseNotification/ApiResponseNotificationConstants";

const ellipsis = React.forwardRef(({ onClick }, ref) => (
	<a
		className="cursor-pointer"
		ref={ref}
		onClick={(e) => {
			e.preventDefault();
			onClick(e);
		}}
	>
		<img src={EllipsisSVG} width="20" />
	</a>
));

export default function SpendTrigger({
	appId,
	loading,
	onApiSuccess,
	appTriggerStatus,
	orgTriggerStatus,
}) {
	const triggerRef = useRef();
	const [showPopover, setShowPopover] = useState(false);
	const [startDate, setStartDate] = useState();
	const [running, setRunning] = useState(false);
	const { isViewer } = useContext(RoleContext);

	const triggerIsRunning = () => {
		return appId
			? ["triggered", "processing"].includes(appTriggerStatus) ||
					["triggered", "processing"].includes(orgTriggerStatus)
			: ["triggered", "processing"].includes(orgTriggerStatus);
	};

	const callSpendTriggerAPI = () => {
		setRunning(true);
		runSpendTrigger(startDate.toISOString().split("T")[0], appId)
			.then(() => {
				ApiResponseNotification({
					responseType: apiResponseTypes.SUCCESS,
					title: "Spend calculation triggered successfully!",
				});
				setRunning(false);
				setShowPopover(false);
				onApiSuccess && onApiSuccess();
			})
			.catch((error) => {
				ApiResponseNotification({
					responseType: apiResponseTypes.ERROR,
					title: "Error in sending request for calculating spends",
					errorObj: error,
				});
				setRunning(false);
			});
	};

	useOutsideClickListener(triggerRef, () => {
		setShowPopover(false);
	});

	const spendTriggerOption = () => (
		<div className="position-relative">
			{triggerIsRunning() ? (
				<div className="calculating_spends">
					<div>
						<ProgressBarLoader height={20} width={20} />
					</div>
					<div>Calculating Spends</div>
				</div>
			) : (
				<div
					className="border-1 cursor-pointer padding_8 border-radius-4 font-12"
					style={{ height: "34px", width: "138px" }}
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						setShowPopover(true);
					}}
					ref={triggerRef}
				>
					Recalculate Spends
					<Popover
						refs={[triggerRef]}
						show={showPopover}
						align="center"
						className="spend_trigger_popover"
					>
						<NewDatePicker
							key={`${startDate}`}
							placeholder="Start Date"
							onChange={(date) => setStartDate(date)}
							calendarClassName="rangefilter-calendar"
							calendarContainerClassName="spend_trigger_calendar_container"
							value={startDate}
							style={{ height: "34px" }}
							maxDate={new Date()}
						/>
						<Button
							disabled={!startDate || running}
							onClick={callSpendTriggerAPI}
							style={{ height: "34px" }}
						>
							{running ? (
								<Spinner
									animation="border"
									role="status"
									variant="light"
									size="sm"
									style={{ borderWidth: 2 }}
								/>
							) : (
								"Run"
							)}
						</Button>
					</Popover>
				</div>
			)}
		</div>
	);

	return (
		<>
			{!isViewer && (
				<Dropdown className="pt-1" key={loading}>
					<Dropdown.Toggle className="mb-1" as={ellipsis} />
					<Dropdown.Menu bsPrefix="spend_trigger_dropdown_menu">
						{spendTriggerOption()}
					</Dropdown.Menu>
				</Dropdown>
			)}
		</>
	);
}
