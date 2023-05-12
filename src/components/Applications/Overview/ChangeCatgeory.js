import React, {
	useState,
	useEffect,
	useCallback,
	useRef,
	useContext,
} from "react";
import { Spinner } from "react-bootstrap";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import edit from "./edit.svg";
import cancel from "./cancel.svg";
import completeiconimg from "./completeicon.svg";
import acceptbutton from "./acceptbutton.svg";
import { searchAppCategories } from "../../../services/api/search";
import { patchApplication } from "../../../services/api/applications";
import { Loader } from "../../../common/Loader/Loader";
import "./Overview.css";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { debounce } from "../../../utils/common";
import PlusCircle from "../../../assets/icons/plus-circle.svg";
import subcategoryarrow from "../../../assets/applications/subcategoryarrow.svg";
import { useOutsideClickListener } from "../../../utils/clickListenerHook";
import RoleContext from "../../../services/roleContext/roleContext";

function SuggestionBar(props) {
	return (
		<>
			<div className="quick-edit-menu shadow d-block">
				{props.loading ? (
					<>
						<div className="quick-edit-menu-item">
							<Loader height={60} width={60}></Loader>
						</div>
					</>
				) : (
					<>
						{props.options.length > 0 ? (
							props.options.map((option, index) => (
								<>
									<div
										className="quick-edit-menu-item border-bottom"
										onClick={() => {
											props.handleSelect(option);
											props.onHide();
										}}
									>
										{option.name}
									</div>
								</>
							))
						) : (
							<div
								className="quick-edit-menu-item justify-content-center text-secondary"
								style={{ fontSize: 12 }}
							>
								<i>No results found</i>
							</div>
						)}
					</>
				)}
			</div>
		</>
	);
}

export function ChangeCategory(props) {
	const [categoryId, setCategoryId] = useState("");
	const [categoryName, setCategoryName] = useState("");
	const [editText, setEditText] = useState("");
	const [editing, setEditing] = useState(false);
	const [showCategorySuggestions, setShowCategorySuggestions] = useState(
		false
	);
	const [categorySuggestions, setCategorySuggestions] = useState([]);
	const [loading, setloading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [readyToSave, setReadyToSave] = useState(false);
	const [selection, setSelection] = useState();
	const location = useLocation();
	const editFieldRef = useRef();
	const { isViewer } = useContext(RoleContext);

	useEffect(() => {
		setCategoryId(props.categoryId);
		setCategoryName(props.categoryName);
	}, []);

	useOutsideClickListener(editFieldRef, () => {
		setEditing(false);
		onEditClose();
	});

	const onEditClose = () => {
		setEditText("");
		setShowCategorySuggestions(false);
		setCategorySuggestions([]);
		setReadyToSave(false);
	};

	const handleCategoryEdit = (value) => {
		setEditText(value);
		if (value.length > 0) {
			setShowCategorySuggestions(true);
		} else {
			setShowCategorySuggestions(false);
			setCategorySuggestions([]);
		}
		generateCategorySuggestions(value);
	};

	const generateCategorySuggestions = useCallback(
		debounce((query) => {
			if (query && query.length >= 1) {
				searchAppCategories(query).then((res) => {
					setCategorySuggestions(res.results);
					setloading(false);
				});
			}
		}, 200),
		[]
	);

	const handleCategorySelect = (category) => {
		setSelection(category);
		setEditText(category.name);
		setReadyToSave(true);
	};

	const handleCategorySave = () => {
		let appId = props.idFromTable || location.pathname.split("/")[2];
		let patchObj = {};
		if (props.operation === "replace") {
			patchObj = {
				patches: [
					{
						op: (props.operation && props.operation) || "replace",
						field:
							(props.field_name && props.field_name) ||
							"category",
						value: (props.subCategoryPresent && selection._id) || [
							{
								category_id: selection._id,
							},
						],
						old_value: props.subCategoryPresent && props.categoryId,
					},
				],
			};
		} else {
			patchObj = {
				patches: [
					{
						op: (props.operation && props.operation) || "replace",
						field:
							(props.field_name && props.field_name) ||
							"category",
						value: (props.subCategoryPresent && selection._id) || [
							{
								category_id: selection._id,
							},
						],
					},
				],
			};
		}
		setCategoryId(selection._id);
		setCategoryName(selection.name);

		setSubmitting(true);

		patchApplication(appId, patchObj)
			.then((res) => {
				if (res.errors) {
					console.error(
						"Error updating application category:",
						res.errors
					);
				}

				setSubmitting(false);
				setSubmitted(true);
				props.handleRefresh && props.handleRefresh();
				setTimeout(() => {
					setSubmitted(false);
					setReadyToSave(false);
					setEditing(false);
				}, 300);
			})
			.catch((err) => {
				console.error("Error updating application category:", err);
				setSubmitting(false);
			});
	};
	const stopBubblingEvent = (e) => {
		e.stopPropagation();
		e.preventDefault();
	};
	return (
		<>
			<div
				className="overview__middle__topconttext2"
				onClick={(e) => stopBubblingEvent(e)}
			>
				<span>
					{!editing ? (
						<div
							className={`overview__middle__topconttext2__hover ${
								props.isNotActive ? "o-6" : ""
							}`}
						>
							<div className="d-flex align-items-center">
								{categoryName && categoryName.length > 0 ? (
									<>
										<OverlayTrigger
											placement="top"
											overlay={
												<Tooltip>
													{categoryName || ""}
												</Tooltip>
											}
										>
											<div
												className="subcategory__truncate"
												style={{
													fontSize: "10px",
												}}
											>
												{categoryName || ""}
											</div>
										</OverlayTrigger>
										{!isViewer && (
											<button
												className="apps__ov__editbutton"
												onClick={() => {
													setEditText(categoryName);
													setEditing(true);
												}}
											>
												<img src={edit} alt=""></img>
											</button>
										)}
									</>
								) : !isViewer ? (
									<div
										onClick={() => setEditing(true)}
										className="cursor-pointer"
										style={{ color: "#717171" }}
									>
										<img
											src={PlusCircle}
											width="24"
											className="mr-2"
										/>
										<span>Add Category</span>
									</div>
								) : (
									<div
										className="cursor-pointer"
										style={{ color: "#717171" }}
									>
										<span>No Category</span>
									</div>
								)}
							</div>
						</div>
					) : (
						<div
							ref={editFieldRef}
							className="overview__middle__topconttext2__EditCategory"
						>
							<input
								type="text"
								className="overview__middle__topconttext2__EditCategory__input"
								style={{ flexGrow: 1 }}
								value={editText}
								placeholder="Enter Category"
								onChange={(e) =>
									handleCategoryEdit(e.target.value)
								}
							/>
							{showCategorySuggestions && (
								<SuggestionBar
									options={categorySuggestions}
									loading={loading}
									onHide={() =>
										setShowCategorySuggestions(false)
									}
									handleSelect={handleCategorySelect}
								/>
							)}
							{submitting && (
								<div className="d-flex align-items-center mr-2">
									<Spinner
										animation="border"
										variant="light"
										bsPrefix="my-custom-spinner"
										className="my-custom-spinner"
									/>
								</div>
							)}
							{submitted && (
								<div className="d-flex align-items-center mr-2">
									<img src={completeiconimg} />
								</div>
							)}
							{!submitting && !submitted && (
								<>
									<button
										onClick={() => {
											setEditing(false);
											setShowCategorySuggestions(false);
										}}
										className="overview__middle__topconttext2__EditCategory__button1 mr-1"
									>
										<img src={cancel} />
									</button>
									{readyToSave && (
										<button
											className="overview__middle__topconttext2__EditCategory__button2 mr-1"
											onClick={handleCategorySave}
										>
											<img src={acceptbutton}></img>
										</button>
									)}
								</>
							)}
						</div>
					)}
				</span>
			</div>
		</>
	);
}

ChangeCategory.propTypes = {
	categoryId: PropTypes.string.isRequired,
	categoryName: PropTypes.string.isRequired,
	idFromTable: PropTypes.any,
};

ChangeCategory.defaultProps = {
	categoryId: "",
	categoryName: "",
};
