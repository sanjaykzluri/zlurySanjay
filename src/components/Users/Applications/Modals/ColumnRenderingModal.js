import React, { useEffect, useState, useRef, useCallback } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import close from "../../../../assets/close.svg";
import columnSort from "../../../../assets/column-sort.svg";
import {
	sortableContainer,
	sortableElement,
	sortableHandle,
} from "react-sortable-hoc";
import arrayMove from "array-move";
import { push } from "connected-react-router";
import { useDispatch, useSelector } from "react-redux";
import { filtersRequestBodyGenerator } from "../../../../common/infiniteTableUtil";
import { patchView } from "services/api/views";
import paginatedsvg from "assets/paginated.svg";
import infinitescroll from "assets/infinitescroll.svg";
import {
	fetchViewsData,
	UpdateViewsData,
} from "modules/views/redux/viewsnew-action";
import { SCREEN_TAG_MAP } from "constants/views";
import { viewsnewConstants } from "modules/views/constants/viewsnewConstants";
import { trackActionSegment } from "modules/shared/utils/segment";
import { propertyMapperReversal } from "modules/v2InfiniteTable/utils/v2infiniteTableUtil";

const fixedColumns = [
	"application",
	"user",
	"department",
	"contract",
	"vendor",
	"transaction_description",
	"name", //transaction uploads name
	"license",
	"whats_next",
	"notifications",
];

const customFieldsEnabledEntities = [
	"applications",
	"users",
	"departments",
	"vendors",
	"contracts",
];
const DragHandle = sortableHandle(() => (
	<div style={{ padding: "5px", cursor: "pointer" }}>
		<img src={columnSort} />
	</div>
));

const SortableContainer = sortableContainer(({ children }) => {
	return <ul style={{ padding: 0 }}>{children}</ul>;
});

export function ColumnRenderingModal({
	onHide,
	submitting,
	handleSubmit,
	columnsMapper,
	usedColumns,
	metaData,
	setListOfColumns,
	listOfColumns,
	pageLayoutPresent,
	active_view,
	v2Entity,
	screenTagKey,
}) {
	const [checked, setChecked] = useState([]);
	const dispatch = useDispatch();
	const viewsData = useSelector(
		(state) => state.viewsnew?.[SCREEN_TAG_MAP[screenTagKey]] || {}
	);
	const [paginated, setPaginated] = useState(
		viewsData.layout_option === "paginated"
	);
	useEffect(() => {
		let columnIds = [];
		usedColumns.forEach((element) => {
			columnIds.push(element.group_name);
		});
		setChecked(columnIds);
		trackActionSegment("Clicked on Column Button", {
			currentCategory: v2Entity,
		});
	}, []);

	function onSortEnd({ oldIndex, newIndex }) {
		const newList = arrayMove(listOfColumns, oldIndex, newIndex);
		setListOfColumns(newList);
	}

	const SortableItem = sortableElement(({ value }) => (
		<>
			<div
				style={{
					width: "auto",
					height: "49px",
					background: "#F5F5F5",
					border: "0.5px solid #DDDDDD",
					borderRadius: "4px",
					marginLeft: "10px",
					marginRight: "10px",
					marginBottom: "4px",
					marginTop: "4px",
					padding: "6px",
					zIndex: "9999",
				}}
				className="flex"
			>
				<DragHandle />
				<div style={{ padding: "5px" }}>
					<input
						type="checkbox"
						checked={checked.find(
							(item) => item === value.group_name
						)}
						onChange={() => handleChecked(value)}
					/>
				</div>

				<div style={{ padding: "5px" }}>
					{columnsMapper[value.group_name]?.text ||
						value?.group_name ||
						value}
				</div>
			</div>
		</>
	));

	const FixedItem = ({ value }) => (
		<>
			<div
				style={{
					width: "auto",
					height: "49px",
					background: "#F5F5F5",
					border: "0.5px solid #DDDDDD",
					borderRadius: "4px",
					marginLeft: "10px",
					marginRight: "10px",
					marginBottom: "4px",
					marginTop: "4px",
					padding: "6px",
					zIndex: "9999",
				}}
				className="flex"
			>
				<div style={{ padding: "5px", cursor: "pointer" }}>
					<img src={columnSort} />
				</div>
				<div style={{ padding: "5px" }}>
					<input type="checkbox" checked={true} disabled />
				</div>

				<div style={{ padding: "5px", color: "#6c757d" }}>
					{columnsMapper[value.group_name]?.text ||
						value?.group_name ||
						value}
				</div>
			</div>
		</>
	);

	function handleColumns() {
		dispatch({
			type: viewsnewConstants.SET_LAYOUT_OPTION,
			payload: {
				screenTagKey: SCREEN_TAG_MAP[screenTagKey],
				layout_option: paginated ? "paginated" : "infinite_scroll",
			},
		});
		const finalObj = [];
		listOfColumns.forEach((column) => {
			if (checked.indexOf(column.group_name) > -1) {
				finalObj.push(column);
			}
		});

		dispatch(async function (dispatch, getState) {
			try {
				const { router } = getState();
				const { hash, query } = router.location;
				let viewId;
				let reqObj = {};
				if (query.viewId) {
					viewId = query.viewId;
				}
				reqObj.columns = finalObj;
				reqObj.filter_by = propertyMapperReversal(metaData?.filter_by);
				reqObj.sort_by = metaData?.sort_by;
				let url;
				let meta = encodeURIComponent(JSON.stringify(reqObj));
				url = viewId
					? `?metaData=${meta}&viewId=${viewId}${hash}`
					: `?metaData=${meta}${hash}`;
				dispatch(push(url));
				const patchObj = {
					patches: [
						{
							op: "replace",
							field: "layout_option",
							value: paginated ? "paginated" : "infinite_scroll",
						},
					],
				};

				if (viewId || active_view) {
					patchView(viewId || active_view?._id, patchObj);
				}
			} catch (err) {
				console.log(err);
			}
			handleSubmit();
		});
		trackActionSegment("Clicked on Apply button in Columns Modal.", {
			currentCategory: v2Entity,
		});
	}

	function handleChecked(element) {
		let id = element.group_name;
		if (!checked.includes(id)) {
			const checkedCopy = [...checked];
			checkedCopy.push(id);
			setChecked(checkedCopy);
		} else {
			let checkedCopy = [...checked];
			checkedCopy = checkedCopy.filter((el) => el !== id);
			setChecked(checkedCopy);
		}
	}

	return (
		<>
			<div className="addContractModal__TOP h-100">
				<div className="d-flex flex-row align-items-center py-4">
					<div className="m-auto">
						<span className="contracts__heading">Columns</span>
					</div>
					<img
						alt="Close"
						onClick={onHide}
						src={close}
						className="cursor-pointer mr-4"
					/>
				</div>
				<div style={{ padding: 0 }} className=" border-bottom">
					<Form className="w-10">
						<Form.Group
							style={{ fontSize: 14 }}
							className="my-2"
						></Form.Group>
					</Form>
				</div>
				{pageLayoutPresent && (
					<>
						<div
							className="d-flex flex-column"
							style={{ margin: "23px 10px 12px" }}
						>
							<div className="font-14 bold-600">
								Select Page Layout
							</div>
							<div
								className="d-flex flex-row align-items-center w-100"
								style={{
									height: "34px",
									border: "1px solid #DDDDDD",
									borderRadius: " 4px",
									marginTop: "12px",
								}}
							>
								<div
									className="w-50 d-flex align-items-center justify-content-center font-14 grey-1 cursor-pointer h-100"
									style={{
										backgroundColor: paginated
											? "#EBEBEB"
											: "#FFFFFF",
									}}
									onClick={() => setPaginated(true)}
								>
									<img
										src={paginatedsvg}
										className="mr-2"
									></img>
									Paginated
								</div>
								<div
									className="w-50 d-flex align-items-center justify-content-center font-14 grey-1 cursor-pointer h-100"
									style={{
										backgroundColor: !paginated
											? "#EBEBEB"
											: "#FFFFFF",
									}}
									onClick={() => setPaginated(false)}
								>
									<img
										src={infinitescroll}
										className="mr-2"
									></img>
									Infinite Scroll
								</div>
							</div>
						</div>
					</>
				)}
				<div
					style={{
						padding: "20px 0px",
						height: "calc(100% - 259px)",
						overflowY: "auto",
					}}
				>
					<SortableContainer
						lockAxis={"y"}
						useDragHandle={true}
						onSortEnd={onSortEnd}
					>
						{listOfColumns?.length &&
							listOfColumns.map((value, index) => {
								return (
									<>
										{fixedColumns.indexOf(
											value.group_name
										) > -1 &&
											(Array.isArray(value.field_ids) &&
											value.field_ids.includes(
												"custom_fields"
											)
												? customFieldsEnabledEntities.find(
														(el) => el === v2Entity
												  )
												: columnsMapper[
														value.group_name
												  ]?.text) && (
												<FixedItem
													key={`item-${Object.keys(
														value
													)}`}
													index={index}
													value={value}
												/>
											)}
										{fixedColumns.indexOf(
											value.group_name
										) < 0 &&
											(Array.isArray(value.field_ids) &&
											value.field_ids.includes(
												"custom_fields"
											)
												? customFieldsEnabledEntities.find(
														(el) => el === v2Entity
												  )
												: columnsMapper[
														value.group_name
												  ]?.text) && (
												<SortableItem
													key={`item-${Object.keys(
														value
													)}`}
													index={index}
													value={value}
												/>
											)}
									</>
								);
							})}
					</SortableContainer>
				</div>

				<div
					className="fixed-bottom text-right border-top bg-white py-4"
					style={{
						left: "calc(100% - 528px)",
						zIndex: 200,
					}}
				>
					<Button
						variant="link"
						size="sm"
						className="mr-2"
						onClick={() => {
							onHide();
							trackActionSegment("Cancel Button Clicked", {
								currentCategory: v2Entity,
								currentPage: "Columns Selection Modal",
							});
						}}
					>
						Cancel
					</Button>
					<Button
						size="sm"
						disabled={submitting}
						onClick={() => handleColumns()}
						style={{ marginRight: "40px" }}
					>
						Apply
						{submitting && (
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
						)}
					</Button>
				</div>
			</div>
		</>
	);
}
