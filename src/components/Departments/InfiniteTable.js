import React from "react";
import { Loader } from "../../common/Loader/Loader";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { uiConstants } from "../../constants/ui";
import "../../common/InfiniteTable.css";
import RoleContext from "../../services/roleContext/roleContext";
import { isRestricted, showrestrictedPopup } from "../../common/restrictions";
import RestrictedMessage from "../../common/restrictions/RestrctedMessage";
import { LicenseCard } from "../Applications/AllApps/Contracts/ContractsTable";
import { Col, Row } from "react-bootstrap";
import addLicenseBtn from "../../assets/applications/addLicenseBtn.svg";
import { Link } from "react-router-dom";
import _ from "underscore";
import comingsoon from "../../assets/agents/comingsoon.svg";
//This file is deprecated. Use OldInfiniteTable component.

class InfiniteTableComp extends React.Component {
	static contextType = RoleContext;
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			pageSize: this.props.perPage || 10,
			pageNo: 0,
			prevY: 0,
			loading: false,
			loadedOnce: false,
			complete: false,
			checked: [],
			interColumnsStateObject: this.props.interColumnsStateObject || {},
			selectAll: false,
			onScroll: false,
			searching: false,
			isViewer: false,
			selectedRows: {},
		};
		this.responseApiDataKey = {
			ModifiedContract: "modifiedContract",
			Result: "results",
			LicenseContract: "licenseContracts",
			Data: "data",
			Users: "users",
		};
		this.loadingRef = React.createRef();
		this.fetchData = this.fetchData.bind(this);
		this.handleObserver = this.handleObserver.bind(this);
		this.handleCheckedAll = this.handleCheckedAll.bind(this);
		this.handleChecked = this.handleChecked.bind(this);
		this.refresh = this.refresh.bind(this);
		this.handleRowClick = this.handleRowClick.bind(this);
		this.setInterColumnsStateObject =
			this.setInterColumnsStateObject.bind(this);
	}

	setInterColumnsStateObject(interColumnsStateObject) {
		this.setState({
			...this.state,
			interColumnsStateObject,
		});
	}

	setupIntersectionObserver() {
		// load more on page scroll using IntersectionObserver
		const options = {
			root: null,
			rootMargin: "20px",
			threshold: 0.5,
		};
		// create observer
		this.observer = new IntersectionObserver(
			this.handleObserver.bind(this),
			options
		);

		// observe the `loadingRef`
		if (!this.props.isRestricted)
			this.observer.observe(this.loadingRef.current);
	}

	refresh(forceRefresh) {
		this.setState(
			{
				data: [],
				pageSize: this.props.perPage || 10,
				pageNo: 0,
				prevY: 0,
				loading: false,
				complete: false,
				checked: [],
				selectAll: false,
				selectedRows: [],
				searching: !!this.props.searchQuery,
			},
			() => {
				if (forceRefresh) {
					this.setState(
						{
							searching: true,
							data: [],
						},
						() => {
							this.fetchData();
						}
					);
				}
				if (this.props.handleCheckedChange) {
					this.props.handleCheckedChange([]);
				}
				this.props.handleCheckedRows &&
					this.props.handleCheckedRows({});
				if (this.props?.searchQuery?.length > 1) {
					this.setState(
						{
							searching: true,
						},
						() => {
							this.fetchData();
						}
					);
				} else if (this.props.data.length === 0) {
					if (this.props.fetchDatafunctionViaRedux == null) {
						this.fetchData();
					} else {
						this.setState(
							{
								loadedOnce: true,
								loading: true,
							},
							this.props.dispatchFetchData(0, this.loadingRef)
						);
					}
				} else {
					this.setState({
						pageNo: this.props.pageNo,
					});
				}
			}
		);
		this.setupIntersectionObserver();
	}
	componentDidMount() {
		this.refresh();
		if (!this.props.isRestricted) {
			this.props.setRefreshFn(this.refresh);
			this.setupIntersectionObserver();
			this.setState({
				isViewer: this.context?.isViewer,
			});
		}
	}

	componentWillUnmount() {
		if (this.observer) this.observer.disconnect();
	}

	async fetchData() {
		if (!this.state.loading) {
			this.setState({ loading: true }, () => {
				if (!this.props.showEmptyScreen) {
					if (this.props.setCount) this.props.setCount(0);
					try {
						this.props
							.fetchData(this.state.pageNo, this.state.pageSize)
							.then((resp) => {
								if (resp?.error) {
									this.setState({
										loading: false,
										complete: true,
									});
								}
								if (
									this.props.apiDataKey ===
									this.responseApiDataKey?.ModifiedContract
								) {
									if (
										resp[this.props.apiDataKey]?.contracts
											.length > 0
									) {
										this.setState({
											loading: false,
											data: [
												...this.state.data,
												...resp[this.props.apiDataKey]
													.contracts,
											],
											complete: true,
										});
									} else {
										this.setState({
											complete: true,
										});
									}
								} else if (
									this.props.apiDataKey ==
									this.responseApiDataKey?.LicenseContract
								) {
									if (
										resp.data &&
										resp.data.results &&
										resp.data.results[
											this.props.apiDataKey
										] &&
										resp.data.results[this.props.apiDataKey]
											.length > 0
									) {
										this.setState({
											data: [
												...resp.data.results[
													this.props.apiDataKey
												],
											],
										});
									}
									if (
										resp &&
										resp[this.props.apiDataKey] &&
										resp[this.props.apiDataKey].length > 0
									) {
										this.setState({
											data: [
												...resp[this.props.apiDataKey],
											],
										});
										this.props.setTableData({
											data: [
												...resp[this.props.apiDataKey],
											],
										});
									}
									this.setState({
										loading: false,
										complete: true,
										pageNo: 0,
										searching: false,
									});
									if (this.props.resetKey) {
										this.props.resetKey();
									}
								} else if (
									this.props.apiDataKey ==
									this.responseApiDataKey?.Result
								) {
									if (
										resp[this.props.apiDataKey] &&
										resp[this.props.apiDataKey].length > 0
									) {
										this.setState({
											data: [
												...resp[this.props.apiDataKey],
											],
										});
									}
									this.setState({
										loading: false,
										complete: true,
										pageNo: 0,
										searching: false,
									});
									if (this.props.resetKey) {
										this.props.resetKey();
									}
								} else if (
									this.props.apiDataKey ==
									this.responseApiDataKey?.Data
								) {
									if (
										resp[this.props.apiDataKey] &&
										resp[this.props.apiDataKey]?.length >
											0 &&
										resp[this.props.apiDataKey]?.length ===
											this.state.pageSize
									) {
										this.setState({
											loading: false,
											data: [
												...this.state.data,
												...resp[this.props.apiDataKey],
											],
											complete: true,
											searching: false,
										});
										if (this.props.setCount && resp.meta) {
											this.props.setCount(
												resp.meta.total
											);
										}
									} else {
										this.setState({
											loading: false,
											complete: true,
											data: [
												...this.state.data,
												...resp[this.props.apiDataKey],
											],
											searching: false,
										});
										if (this.props.setCount && resp.meta) {
											this.props.setCount(
												resp.meta.total
											);
										}
									}
									if (this.props.resetKey) {
										this.props.resetKey();
									}
								} else if (
									this.props.apiDataKey ==
									this.responseApiDataKey?.Users
								) {
									if (
										resp[this.props.apiDataKey] &&
										resp[this.props.apiDataKey]?.length >
											0 &&
										resp[this.props.apiDataKey]?.length ===
											this.state.pageSize
									) {
										this.setState({
											loading: false,
											data: [
												...this.state.data,
												...resp[this.props.apiDataKey],
											],
											complete: true,
											searching: false,
										});
										this.props.setAllUsersData &&
											this.props.setAllUsersData([
												...this.state.data,
											]);
										this.props.setSingleAgentData &&
											resp.atleast_1_agent &&
											this.props.setSingleAgentData(
												resp.atleast_1_agent
											);
									} else {
										this.setState({
											loading: false,
											complete: true,
											data: [
												...this.state.data,
												...resp[this.props.apiDataKey],
											],
											searching: false,
										});
										this.props.setAllUsersData &&
											this.props.setAllUsersData([
												...this.state.data,
											]);
										this.props.setSingleAgentData &&
											resp.atleast_1_agent &&
											this.props.setSingleAgentData(
												resp.atleast_1_agent
											);
									}
									if (this.props.resetKey) {
										this.props.resetKey();
									}
								} else if (
									resp[this.props.apiDataKey] &&
									resp[this.props.apiDataKey]?.length > 0 &&
									resp[this.props.apiDataKey]?.length ===
										this.state.pageSize
								) {
									this.setState({
										loading: false,
										data: [
											...this.state.data,
											...resp[this.props.apiDataKey],
										],
										complete: true,
										searching: false,
									});
								} else {
									this.setState({
										loading: false,
										complete: true,
										data: [...this.state.data, ...resp],
										searching: false,
									});
								}
								this.setState((prevState) => ({
									pageNo: prevState.pageNo + 1,
								}));
							})
							.catch((err) => {
								console.error("Error fetching list data", err);
								if (
									err?.message !==
									"Operation cancelled in favor of a new request"
								) {
									this.setState({
										loading: false,
										complete: true,
									});
								}
							});
					} catch (error) {
						console.log(error, "error in infiniteTable");
						this.setState({
							complete: true,
							loading: false,
							searching: false,
						});
					}
				} else {
					this.setState({ complete: true, loading: false });
				}
			});
		}
	}

	handleCheckedAll() {
		if (this.state.checked.length > 0) {
			this.setState({
				checked: [],
				selectedRows: {},
				selectAll: false,
			});
			if (this.props.handleCheckedChange) {
				this.props.handleCheckedChange([]);
			}
			this.props.handleCheckedRows && this.props.handleCheckedRows({});
		} else {
			const ids = [];
			const rows = {};
			(this.props.searchQuery ||
			this.props.fetchDatafunctionViaRedux == null
				? this.state.data
				: this.props.data
			).forEach((el) => {
				ids.push(el[this.props.keyField]);
				rows[el[this.props.keyField]] = el;
			});
			this.setState({
				checked: ids,
				selectedRows: rows,
				selectAll: true,
			});
			if (this.props.handleCheckedChange) {
				this.props.handleCheckedChange(ids);
			}
			this.props.handleCheckedRows && this.props.handleCheckedRows(rows);
		}
	}

	handleChecked(id, row) {
		const data =
			this.props.fetchDatafunctionViaRedux == null
				? this.state.data
				: this.props.data;

		if (!this.state.checked.includes(id)) {
			const checkedCopy = [...this.state.checked];
			const selectedRowsTemp = { ...this.state.selectedRows };
			checkedCopy.push(id);
			selectedRowsTemp[id] = row;
			if (this.props.handleCheckedChange) {
				this.props.handleCheckedChange(checkedCopy);
			}
			this.props.handleCheckedRows &&
				this.props.handleCheckedRows(selectedRowsTemp);
			this.setState({
				checked: checkedCopy,
				selectAll: !!checkedCopy.length,
				selectedRows: selectedRowsTemp,
			});
		} else {
			let checkedCopy = [...this.state.checked];
			let selectedRowsTemp = { ...this.state.selectedRows };
			checkedCopy = checkedCopy.filter((el) => el !== id);
			selectedRowsTemp = _.omit(selectedRowsTemp, id);
			if (this.props.handleCheckedChange) {
				this.props.handleCheckedChange(checkedCopy);
			}
			this.props.handleCheckedRows &&
				this.props.handleCheckedRows(selectedRowsTemp);
			this.setState({
				checked: checkedCopy,
				selectAll: !!checkedCopy.length,
				selectedRows: selectedRowsTemp,
			});
		}
	}

	handleObserver(entities, observer) {
		const y = entities[0].boundingClientRect.y;
		const { intersectionRatio } = entities[0];
		if (this.props.componentWithoutRedux && intersectionRatio > 0) {
			if (this.state.data.length < 10 && this.state.pageNo > 0) {
				this.setState({ complete: true, loading: false });
			} else {
				this.setState({ complete: false }, () => this.fetchData());
			}
		}
		if (
			intersectionRatio > 0 &&
			this.props.data.length &&
			this.props.isMoreDataAvailable
		) {
			if (this.props.data.length < 10) {
				this.setState({ complete: true, loading: false });
			}
			if (this.props.searchQuery?.length == 0) {
				this.props.fetchDatafunctionViaRedux == null
					? this.fetchData()
					: this.props.dispatchFetchData(
							this.props.pageNo + 1,
							this.loadingRef
					  );
				this.setState({
					onScroll: true,
				});
			}
		}
	}

	componentDidUpdate(prevProps) {
		if (prevProps.data !== this.props.data && this.state.onScroll) {
			this.setState({
				pageNo: this.state.pageNo + 1,
			});
			this.state.selectAll &&
				this.setState({ checked: [], onScroll: false }, () => {
					this.handleCheckedAll();
				});
		}
		if (this.props.isMoreDataAvailable == false && !this.state.complete) {
			this.setState({
				complete: true,
				loading: false,
			});
		}
		if (
			(prevProps?.data?.length === 0 && this.props?.data?.length != 0) ||
			prevProps.apiDataKey != this.props.apiDataKey
		) {
			this.setState({
				selectAll: false,
				checked: [],
				complete: !!this.props.searchQuery,
			});
		}
	}

	handleRowClick(e, el) {
		e.stopPropagation();
		e.preventDefault();
		this.props.handleRowClick &&
			this.props.handleRowClick(
				el,
				this.state.interColumnsStateObject,
				this.setInterColumnsStateObject
			);
	}

	render() {
		const { complete, checked } = this.state;
		var data;
		if (this.props?.searchQuery?.length > 1) {
			data = this.state.data;
		} else {
			data = this.props.fetchDatafunctionViaRedux
				? this.props.data
				: this.state.data;
		}

		const { loadingColumns, loadingData, keyField } = this.props;
		if (this.props.isRestricted) {
			return <RestrictedMessage entity={this.props.entity} />;
		}
		return (
			<>
				<table className="table table-hover mb-0">
					<thead>
						<tr className="table__header">
							{!this.state.isViewer &&
								!this.props.disableCheckColumn && (
									<th
										className="selection-cell-header"
										data-row-selection="true"
									>
										<input
											type="checkbox"
											ref={(input) => {
												if (input) {
													if (checked.length === 0)
														input.indeterminate = false;
													else {
														input.indeterminate =
															checked.length !==
															data.length;
													}
												}
											}}
											checked={
												data.length === 0
													? false
													: this.state.selectAll
											}
											onClick={() => {
												this.handleCheckedAll();
											}}
										/>
									</th>
								)}
							{this.props.columns.map((el, key) => (
								<th
									key={el.text}
									style={el.headerStyle && el.headerStyle}
								>
									<div className="d-flex flex-column">
										<div
											className={
												el.headerImg &&
												"agent_user_table_header"
											}
										>
											{el.headerImg && el.headerImg()}
											{el.text}
										</div>
										<div className="d-flex flex-row justify-content-center mt-1">
											{el.comingSoon && (
												<img
													src={comingsoon}
													width={68}
													height={8}
												></img>
											)}
										</div>
									</div>
								</th>
							))}
						</tr>
					</thead>
					<tbody id="scrollRoot">
						{data && data.length > 0
							? data.map((el, key) => {
									const shouldDisableClick = isRestricted(
										el.isAccessible,
										el.type
									);

									return (
										<>
											<tr
												key={key}
												className={`table__row ${
													shouldDisableClick
														? "table__row__disabled"
														: ""
												} ${
													this.props.handleRowClick
														? "cursor-pointer"
														: ""
												}`}
												onClickCapture={(e) => {
													if (shouldDisableClick) {
														showrestrictedPopup(
															this.props.type
														);
														e.stopPropagation();
														e.preventDefault();
													}
												}}
												onClick={(e) => {
													if (
														e.target.id !=
														"preventRowClick"
													) {
														this.handleRowClick(
															e,
															el
														);
													}
												}}
											>
												{!this.state.isViewer &&
													!this.props
														.disableCheckColumn && (
														<td className="selection-cell">
															<input
																type="checkbox"
																id="preventRowClick"
																checked={checked.includes(
																	el[keyField]
																)}
																onClick={() =>
																	this.handleChecked(
																		el[
																			keyField
																		],
																		el
																	)
																}
															/>
														</td>
													)}
												{this.props.columns.map(
													(column, index) => (
														<td
															key={index}
															style={
																column.columnStyle &&
																column.columnStyle
															}
															onMouseOver={() => {
																column.onmouseover &&
																	column.onmouseover(
																		el[
																			column
																				?.dataField
																		],
																		el,
																		this
																			.state
																			.interColumnsStateObject,
																		this
																			.setInterColumnsStateObject
																	);
															}}
														>
															<div>
																{column.formatter
																	? column.formatter(
																			el[
																				column
																					?.dataField
																			],
																			el,
																			this
																				.state
																				.interColumnsStateObject,
																			this
																				.setInterColumnsStateObject
																	  )
																	: el[
																			column
																				?.dataField
																	  ]}
															</div>
														</td>
													)
												)}
											</tr>
											<tr className="license__row__container">
												{(this.props
													.isAppContractTable ||
													this.props
														.isAllContractTable) &&
													this.props.activeId.includes(
														el.contract_id
													) && (
														<>
															<td></td>
															<td colSpan="8">
																<div className="license__row">
																	{el.licenses.map(
																		(
																			license,
																			index
																		) =>
																			index <
																				3 && (
																				<LicenseCard
																					license={
																						license
																					}
																				/>
																			)
																	)}
																	{el.licenses
																		.length >
																		3 && (
																		<div className="licenseRow_end mr-2">
																			+{" "}
																			{el
																				.licenses
																				.length -
																				3}{" "}
																			more
																		</div>
																	)}
																	<Link
																		to={`/licenses/contracts/${el.contract_id}?edit?returnTo=${el.contract_linked_app.app_id}`}
																	>
																		<img
																			src={
																				addLicenseBtn
																			}
																		/>
																	</Link>
																</div>
															</td>
														</>
													)}
											</tr>
										</>
									);
							  })
							: loadingData &&
							  loadingData.length > 0 &&
							  (!complete ||
									this.props.loadingOnRefresh ||
									this.state.searching)
							? loadingData.map((el, key) => (
									<tr key={key} className="table__row">
										{!this.state.isViewer && (
											<td className="selection-cell">
												<input
													type="checkbox"
													checked={checked.includes(
														el[keyField]
													)}
													onClick={() =>
														this.handleChecked(
															el[keyField],
															el
														)
													}
												/>
											</td>
										)}
										{this.props.loadingColumns.map(
											(column, index) => (
												<td key={index}>
													{column.formatter
														? column.formatter(
																el[
																	column
																		.dataField
																],
																el,
																this.state
																	.interColumnsStateObject,
																this
																	.setInterColumnsStateObject
														  )
														: el[column.dataField]}
												</td>
											)
										)}
									</tr>
							  ))
							: null}
					</tbody>
				</table>
				{data.length === 0 &&
					complete &&
					!(this.props.loadingOnRefresh || this.state.searching) && (
						<div style={{ display: "flex", height: "50vh" }}>
							{this.props.emptyState}
						</div>
					)}
				<div ref={this.loadingRef}>
					{!complete && (
						<div>
							<Loader width={60} height={60} />
						</div>
					)}
				</div>
			</>
		);
	}
}

InfiniteTableComp.propTypes = {
	fetchData: PropTypes.func.isRequired,
	columns: PropTypes.array.isRequired,
	loadingColumns: PropTypes.array,
	loadingData: PropTypes.array,
	apiDataKey: PropTypes.string.isRequired,
	perPage: PropTypes.number,
	handleCheckedChange: PropTypes.func,
	keyField: PropTypes.string.isRequired,
	emptyState: PropTypes.element,
};

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
		setRefreshFn: (fn) => {
			dispatch({
				type: uiConstants.SET_REFRESH_TABLE_FN,
				payload: {
					refreshTable: fn,
					renderedFrom: ownProps.renderedFrom,
				},
			});
		},
		dispatchFetchData: (pageNo, ref) => {
			dispatch(ownProps.fetchDatafunctionViaRedux(pageNo, ref));
		},
	};
};

const mapStateToProps = (state, ownProps) => {
	if (ownProps.dataFunctionInStore) {
		return {
			data: ownProps.dataFunctionInStore(state)?.data || [],
			isMoreDataAvailable:
				ownProps.dataFunctionInStore(state)?.isMoreDataAvailable,
			pageNo: ownProps.dataFunctionInStore(state)?.pageNo,
			loadingOnRefresh: ownProps.dataFunctionInStore(state)?.loading,
			isRestricted: ownProps.dataFunctionInStore(state)?.isRestricted,
			entity: ownProps.dataFunctionInStore(state)?.entity,
		};
	} else {
		return {
			data: [],
		};
	}
};

export const InfiniteTable = connect(
	mapStateToProps,
	mapDispatchToProps
)(InfiniteTableComp);
