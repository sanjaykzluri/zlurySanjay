import InfiniteScroll from "react-infinite-scroll-component";
import { EmptySearch } from "common/EmptySearch";
import { LoaderPage } from "common/Loader/LoaderPage";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import TemplateCard from "../TemplateCard/TemplateCard";
import { Loader } from "common/Loader/Loader";
import { checkSpecialCharacters } from "services/api/search";

export default function Templates(props) {
	const { data, hasMoreData, handleLoadMore, isLoadingData, refreshTable } =
		props;
	const templates = useSelector((state) => state.workflows.templates);
	const templatesCards =
		data &&
		data.map((template, index) => (
			<TemplateCard
				key={index}
				template={template}
				refreshTable={refreshTable}
			/>
		));

	return (
		<>
			<div
				style={{
					height: "calc(100vh - 33vh)",
					overflowY: "auto",
				}}
				id="scrollableDiv"
				className="hide-scrollbar"
			>
				{templatesCards && templatesCards.length > 0 ? (
					<InfiniteScroll
						dataLength={data.length}
						next={() => {
							handleLoadMore();
						}}
						hasMore={hasMoreData}
						loader={<Loader width={60} height={60} />}
						scrollableTarget="scrollableDiv"
						scrollThreshold="200px"
					>
						<div className="d-flex flex-wrap">{templatesCards}</div>
					</InfiniteScroll>
				) : (!isLoadingData && data && data.length === 0) ||
				  checkSpecialCharacters(props.searchQuery, true) ? (
					<div style={{ display: "flex", height: "50vh" }}>
						{props.emptyState}
					</div>
				) : (
					<LoaderPage />
				)}
			</div>
		</>
	);
}
