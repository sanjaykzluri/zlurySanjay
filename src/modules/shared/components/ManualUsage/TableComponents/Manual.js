import React, {
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { Spinner } from "react-bootstrap";
import { mapValueToKeyState } from "../../../../../utils/mapValueToKeyState";
import { useLocation } from "react-router-dom";
import {
	convertArrayToBindSelect,
	convertObjToBindSelect,
} from "../../../../../utils/convertDataToBindSelect";
import { Popover } from "../../../../../UIComponents/Popover/Popover";
import { Button } from "../../../../../UIComponents/Button/Button";
import "./Sources.css";
import ManualLogo from "../../../../../assets/icons/manual-logo.svg";
import inactivecheck from "../../../../../assets/applications/inactivecheck.svg";
import check from "../../../../../assets/applications/check.svg";
import lastSynced from "../../../../../assets/lastSynced.svg";
import { MANUAL_USAGE_INTERVAL_ } from "../../../constants/ManualUsageConstants";
import { ErrorModal } from "../ErrorModal/ErrorModal";
import { Form } from "react-bootstrap";
import RoleContext from "../../../../../services/roleContext/roleContext";
import { getManualUsage } from "../../../../../services/api/sourcesApi";
import moment from "moment";
import { Loader } from "../../../../../common/Loader/Loader";
import _ from "underscore";
import { TriggerIssue } from "../../../../../utils/sentry";
import { ApiResponseNotification } from "../../ApiResponseNotification/ApiResponseNotification";
import { apiResponseTypes } from "../../ApiResponseNotification/ApiResponseNotificationConstants";

const Manual = (props) => {
	const location = useLocation();
	const showManualButtonRef = useRef();
	const [showManual, setShowManual] = useState(false);
	const [interval, setInterval] = useState(MANUAL_USAGE_INTERVAL_.week);
	const [frequency, setFrequency] = useState(0);
	const [submitting, setSubmitting] = useState(false);
	const [sourceDetails, setSourceDetails] = useState();
	const [showError, setShowError] = useState(false);
	const [error, setError] = useState(null);
	const { isViewer } = useContext(RoleContext);
	const [lastUpdated, setLastUpdated] = useState({
		timestamp: null,
		user: "",
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const tempFunc = () => {
			if (props.open_manual) {
				setShowManual(true);
			}
		};
		tempFunc();
	}, [props.open_manual]);

	useEffect(() => {
		if (showManual && !props.interColumnsStateObject.addManualUsage) {
			try {
				getManualUsage(props.userAppId).then((res) => {
					if (
						res &&
						Object.keys(res).length > 0 &&
						typeof res === "object"
					) {
						if (res?.error)
							throw new Error("Error when fetching manual usage");
						setSourceDetails(res);
						const tempLastUpdated = lastUpdated;
						setFrequency(res?.repeat_frequency || 2);
						setInterval(
							res?.repeat_interval || MANUAL_USAGE_INTERVAL_.week
						);
						tempLastUpdated.user = res?.created_by_user_name || "";
						tempLastUpdated.timestamp =
							res?.source_last_activity_date || null;
						setLastUpdated(tempLastUpdated);
						setLoading(false);
					}
				});
			} catch (error) {
				console.log(error);
			}
		} else if (showManual && props.interColumnsStateObject.addManualUsage) {
			setLoading(false);
		}
	}, [showManual]);

	const onSave = async (e) => {
		try {
			let res;
			setSubmitting(true);
			if (props.isUser) {
				res = await props
					.onSave(props.userId, props.userAppId, frequency, interval)
					.then((res) => {
						if (res?.status) {
							props.refresh();
						}
					});
			} else {
				const appId = location.pathname.split("/")[2];
				res = await props
					.onSave(appId, props.userAppId, frequency, interval)
					.then((res) => {
						if (res?.status) {
							props.refresh();
						}
					});
			}
			setSubmitting(false);
			setShowManual(false);
			props.setOpenManualFalse && props.setOpenManualFalse();
			if (res && res.status === "success") {
				props.interColumnsStateObject.setRefreshTableDueToUsage(true);
			}
		} catch (err) {
			setSubmitting(false);
			setShowManual(false);
			if (
				(typeof err.response?.data?.errors === "string" ||
					typeof err.response?.data?.errors?.[0]?.msg === "string") &&
				(err.response?.data?.errors?.includes("user is inactive") ||
					err.response?.data?.errors?.[0]?.msg?.includes(
						"user is inactive"
					))
			) {
				setError("You cannot set manual usage for inactive user.");
				setShowError(true);
			} else if (
				(typeof err.response?.data?.errors === "string" ||
					typeof err.response?.data?.errors?.[0]?.msg === "string") &&
				(err.response?.data?.errors?.includes(
					"application is inactive"
				) ||
					err.response?.data?.errors?.[0]?.msg?.includes(
						"application is inactive"
					))
			) {
				setError(
					"You cannot set manual usage for inactive application."
				);
				setShowError(true);
			} else {
				ApiResponseNotification({
					responseType: apiResponseTypes.ERROR,
					title: "Error while setting manual usage",
					errorObj: err,
				});
			}
		}
	};

	function handleOnClose() {
		setShowManual(false);
		props.setOpenManualFalse && props.setOpenManualFalse();
		setInterval(MANUAL_USAGE_INTERVAL_.week);
		setFrequency(1);
		setLoading(true);
	}

	return (
		<div
			className={props.classes}
			style={{ position: "relative" }}
			onClick={(e) => e.stopPropagation()}
		>
			<div
				ref={showManualButtonRef}
				onClick={(e) => {
					e.stopPropagation();
					if (!isViewer) {
						setShowManual((val) => !val);
					}
				}}
				style={{ margin: 4 }}
				className="cursor-pointer"
			>
				<img src={ManualLogo} width={19} />
			</div>
			{showManual && (
				<Popover
					style={props.style}
					className={props.manualPopoverClassName}
					align="center"
					show={showManual}
					refs={[showManualButtonRef]}
					onClose={() => handleOnClose()}
				>
					<div className="d-flex">
						<p
							className="z__header-secondary flex-fill m-auto"
							style={{ fontSize: 12, fontWeight: 400 }}
						>
							Manual Usage
						</p>
						<div className="d-flex flex-column">
							{_.isBoolean(sourceDetails?.is_primary) &&
								!loading && (
									<div className="ml-auto bold-600 grey-1 font-11 mt-auto mb-auto">
										{sourceDetails?.is_primary ? (
											<>Primary Source</>
										) : (
											<>Alternate Source</>
										)}
									</div>
								)}
							{!loading && sourceDetails?.source_status && (
								<div className="center ml-auto mt-1 mb-auto d-flex flex-row">
									{sourceDetails?.source_status ===
									"inactive" ? (
										<>
											<img src={inactivecheck}></img>
											<div className="grey-1 bold-normal font-9 text-right ml-1">
												Not in Use
											</div>
										</>
									) : (
										<>
											<img src={check} alt="" />
											<div className="grey-1 bold-normal font-9 text-right ml-1">
												In use
											</div>
										</>
									)}
								</div>
							)}
						</div>
					</div>
					<hr style={{ marginTop: 11 }} />
					{!loading ? (
						<div className="row d-flex flex-column grow">
							<div
								className="d-flex flex-nowrap align-items-start"
								style={{ paddingLeft: 12 }}
							>
								<div
									className="z__manual__operator cursor-pointer"
									onClick={() => {
										if (frequency > 1)
											setFrequency(frequency - 1);
									}}
								>
									-
								</div>
								<div className="z__manual__number">
									{frequency}
								</div>
								<div
									className="z__manual__operator cursor-pointer"
									onClick={() => {
										setFrequency(frequency + 1);
									}}
								>
									+
								</div>
								<p
									className="z__block-header text-left"
									style={{
										lineHeight: "27px",
										marginLeft: 7,
										marginRight: 12,
									}}
								>
									every
								</p>
								<Form.Control
									as="select"
									className="cursor-pointer"
									value={interval}
									onChange={(e) => {
										let { value } = e.target;
										mapValueToKeyState(setInterval, value);
									}}
									size="sm"
									style={{
										marginRight: "10px",
										marginBottom: "5px",
										height: "28px",
									}}
								>
									<option value={MANUAL_USAGE_INTERVAL_.day}>
										day
									</option>
									<option value={MANUAL_USAGE_INTERVAL_.week}>
										week
									</option>
									<option
										value={MANUAL_USAGE_INTERVAL_.month}
									>
										month
									</option>
									<option value={MANUAL_USAGE_INTERVAL_.year}>
										year
									</option>
								</Form.Control>
							</div>
							<div className="col-md-12 mt-3 mb-3 mr text-right">
								<Button
									onClick={() => {
										setShowManual(false);
										props.setOpenManualFalse &&
											props.setOpenManualFalse();
										setInterval(
											MANUAL_USAGE_INTERVAL_.week
										);
										setFrequency(1);
										setLoading(true);
									}}
									type="link"
								>
									Cancel
								</Button>
								{submitting ? (
									<Button disabled={true}>
										Save
										<Spinner
											animation="border"
											role="status"
											variant="light"
											size="sm"
											className="ml-2"
											style={{ borderWidth: 2 }}
										>
											<span className="sr-only">
												Loading...
											</span>
										</Spinner>
									</Button>
								) : (
									<Button onClick={onSave}> Save </Button>
								)}
							</div>
							{lastUpdated.timestamp && (
								<div
									className="p-2 d-flex justify-content-center rounded-bottom"
									style={{ backgroundColor: "#EBEBEB" }}
								>
									<img
										src={lastSynced}
										style={{ width: "12px" }}
										className="mr-2 mt-auto mb-auto"
									></img>
									<div
										className="grey-1"
										style={{ fontSize: "8px" }}
									>
										{lastUpdated.timestamp ? (
											<div>
												last updated on{" "}
												{moment(
													lastUpdated.timestamp
												).format("DD MMM YYYY")}{" "}
												by {lastUpdated.user}
											</div>
										) : (
											<div>
												last updated by{" "}
												{lastUpdated.user}
											</div>
										)}
									</div>
								</div>
							)}
						</div>
					) : (
						<Loader width={60} height={60} />
					)}
				</Popover>
			)}
			{showError && (
				<ErrorModal
					isOpen={showError}
					handleClose={() => {
						setShowError(false);
						setError(null);
						setShowManual(false);
						props.setOpenManualFalse && props.setOpenManualFalse();
					}}
					errorMessage={error}
				/>
			)}
		</div>
	);
};

export default Manual;
