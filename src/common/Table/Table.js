import React, { useContext } from "react";
import PropTypes from "prop-types";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import "./Table.scss";
import smiley from "../../assets/table/smiley.svg";
import add from "../../assets/table/add.svg";
import cellEditFactory, { Type } from "react-bootstrap-table2-editor";
import RoleContext from "../../services/roleContext/roleContext";
const NoDataIndication = () => (
	<div
		style={{
			display: "flex",
			flexDirection: "column",
			justifyContent: "center",
			alignItems: "center",
			minHeight: "500px",
		}}
	>
		{/* <div className="spinner-border text-primary" role="status">
      <span className="sr-only">Loading...</span>
    </div> */}

		{/* <div>
			<img src={smiley} className="users__image1"></img>
		</div>
		<div className="users__nodata__text">
			You haven’t added any users yet
		</div>
		<div>
			<button className="users__nodata__button">
				<img src={add}></img>
				<span id="users__table__text">Add Users</span>
			</button>
		</div> */}
	</div>
);

function sortCaret(order) {
	if (!order) {
		return <i className="fa fa-fw fa-sort text-muted" />;
	}
	if (order) {
		return <i className={`fa fa-fw text-muted fa-sort-${order}`} />;
	}
}

export const Table = (props) => {
	const { isViewer } = useContext(RoleContext);

	let {
		id,
		hover,
		data,
		columns,
		onTableChange,
		filter,
		rowEvents,
		selectRow,
		remote,
		options,
		rowStyle,
		emptyStateClassName
	} = props;
	return isViewer ? (
		<BootstrapTable
			id={id}
			hover={hover}
			remote={
				remote === false
					? false
					: { filter: true, pagination: true, sort: true }
			}
			headerClasses={props.headerCSSClasses || "table__header"}
			bootstrap4
			keyField={props.keyField ? props.keyField : "id"}
			data={data || []}
			columns={columns}
			rowClasses="table__row"
			rowEvents={rowEvents}
			rowStyle={rowStyle}
			onTableChange={onTableChange}
			sort={{ sortCaret, order: "asc" }}
			bordered={false}
			filter={filter}
			pagination={
				remote === false
					? null
					: paginationFactory({
						...options,
						hidePageListOnlyOnePage: true, // Hide pagination bar if there's only one page
					})
			}
			noDataIndication={() => props.emptyState || <NoDataIndication />}
		/>
	) : (
		<BootstrapTable
			id={id}
			hover={hover}
			remote={
				remote === false
					? false
					: { filter: true, pagination: true, sort: true }
			}
			headerClasses={props.headerCSSClasses || "table__header"}
			bootstrap4
			keyField={props.keyField ? props.keyField : "id"}
			data={data || []}
			columns={columns}
			rowClasses="table__row"
			rowEvents={rowEvents}
			rowStyle={rowStyle}
			onTableChange={onTableChange}
			sort={{ sortCaret, order: "asc" }}
			bordered={false}
			filter={filter}
			pagination={
				remote === false
					? null
					: paginationFactory({
						...options,
						hidePageListOnlyOnePage: true, // Hide pagination bar if there's only one page
					})
			}
			selectRow={selectRow}
			noDataIndication={() => props.emptyState || <NoDataIndication />}
		/>
	);
};

Table.propTypes = {
	hover: PropTypes.bool,
	data: PropTypes.array,
	columns: PropTypes.array,
	onTableChange: PropTypes.func,
	filter: PropTypes.object,
	rowEvents: PropTypes.func,
	selectRow: PropTypes.object,
	rowStyle: PropTypes.object,
	remote: PropTypes.bool,
	options: PropTypes.object,
	keyField: PropTypes.string,
};
