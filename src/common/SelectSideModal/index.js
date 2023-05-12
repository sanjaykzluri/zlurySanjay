import React, { useEffect, useState, useRef, useCallback } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import close from "../../assets/close.svg";
import columnSort from "../../assets/column-sort.svg";
import {
	sortableContainer,
	sortableElement,
	sortableHandle,
} from "react-sortable-hoc";
import arrayMove from "array-move";
import { push } from "connected-react-router";
import { APPLICATION_TABS } from "../../constants";
import { updateApplicationDefaultTabs } from "../../services/api/applications";
import { useDispatch } from "react-redux";
import { userTabs } from "../../constants/users";

const DragHandle = sortableHandle(() => (
	<div style={{ padding: "5px", cursor: "pointer" }}>
		<img src={columnSort} />
	</div>
));

const SortableContainer = sortableContainer(({ children }) => {
	return <ul style={{ padding: 0 }}>{children}</ul>;
});

export function SelectSideModal({
	onHide,
	submitting,
	handleSubmit,
	options,
	label,
	handleSetDeafultTab,
}) {
	const [selectOptions, setSelectOptions] = useState([]);
	const dispatch = useDispatch();

	useEffect(() => {
		setSelectOptions(options);
	}, []);

	function onSortEnd({ oldIndex, newIndex }) {
		const newList = arrayMove(selectOptions, oldIndex, newIndex);
		setSelectOptions(newList);
	}

	const SortableItem = sortableElement(
		({ value, isChecked, handleChecked, isDefault }) => (
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
							checked={isChecked}
							onChange={() => handleChecked(value)}
							disabled={isDefault}
						/>
					</div>

					<div style={{ padding: "5px" }}>
						{APPLICATION_TABS[value] || userTabs[value]}
					</div>

					{isDefault ? (
						<div
							style={{ padding: "5px" }}
							className="ml-auto font-11 grey-1 o-7 d-flex flex-column justify-content-center"
						>
							Default
						</div>
					) : (
						<div
							style={{ padding: "5px" }}
							className="ml-auto font-11 primary-color d-flex flex-column justify-content-center cursor-pointer"
							onClick={() =>
								updateApplicationDefaultTabs(value).then(
									(res) => {
										if (res?.success) {
											const updateDefaultOption = (
												option
											) => {
												if (option.name === value) {
													return {
														...option,
														...{
															isDefault: true,
															isActive: true,
														},
													};
												}
												return {
													...option,
													...{ isDefault: false },
												};
											};
											const updatedOptions =
												options.map(
													updateDefaultOption
												);
											const updatedSelectedOptions =
												selectOptions.map(
													updateDefaultOption
												);
											setSelectOptions(
												updatedSelectedOptions
											);
											handleSetDeafultTab(updatedOptions);
										}
									}
								)
							}
						>
							Set as Default
						</div>
					)}
				</div>
			</>
		)
	);

	function handleCheck(value) {
		const updatedOptions = selectOptions.map((option) => {
			if (option.name === value) {
				return { ...option, ...{ isActive: !option.isActive } };
			}
			return { ...option };
		});
		setSelectOptions(updatedOptions);
	}

	return (
		<>
			<div className="modal-backdrop show"></div>
			<div className="addContractModal__TOP h-100">
				<div className="d-flex flex-row align-items-center py-4">
					<div className="m-auto">
						<span className="contracts__heading">{label}</span>
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

				<div
					style={{
						padding: "20px 0px",
						height: "calc(100% - 160px)",
						overflowY: "auto",
					}}
				>
					<SortableContainer
						lockAxis={"y"}
						useDragHandle={true}
						onSortEnd={onSortEnd}
					>
						{selectOptions?.length &&
							selectOptions.map((option, index) => {
								return (
									<>
										<SortableItem
											key={option.name}
											index={index}
											value={option.name}
											isChecked={option.isActive}
											handleChecked={handleCheck}
											isDefault={option.isDefault}
											handleSetDeafultTab={
												handleSetDeafultTab
											}
										/>
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
						onClick={onHide}
					>
						Cancel
					</Button>
					<Button
						size="sm"
						disabled={submitting}
						onClick={() => handleSubmit(selectOptions)}
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
