import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { push } from "connected-react-router/immutable";
import { SelectOld } from "../UIComponents/SelectOld/Select";
import arrowdropdown from "../assets/arrowdropdown.svg";
import { VIEWS_ACTION_TYPE } from "../reducers/views.reducer";
import { SCREEN_TAG_MAP } from "../constants/views";
import { CustomViewModal } from "./CustomViewModal";
import spendViewIcon from "../assets/spend_view_icon.svg";
import securityViewIcon from "../assets/security_view_icon.svg";
import usageViewIcon from "../assets/usage_view_icon.svg";
import defaultViewIcon from "../assets/default_view_icon.svg";
import renewalViewIcon from "../assets/renewal_view_icon.svg";
import _ from "underscore";

import {
	deleteCustomView,
	fetchViewsList,
	saveAsDefaultView,
	saveCustomViewService,
} from "../services/api/views";
import { TriggerIssue } from "../utils/sentry";
import { filtersRequestBodyGenerator } from "./infiniteTableUtil";
import { viewsnewConstants } from "modules/views/constants/viewsnewConstants";
import DefaultViewModal from "components/Applications/AllApps/DefaultViewModal";
import { escapeURL } from "utils/common";
import { checkSpecialCharacters } from "services/api/search";

const TableView = ({ screenTagKey, setSearchQuery, responseMetaData }) => {
	const [viewList, setViewList] = useState([]);
	const [defaultView, setDefaultView] = useState();
	const [activeView, setActiveView] = useState();
	const [screentag, setScreentag] = useState(1);
	const [showViews, setShowViews] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedView, setSelectedView] = useState(false);
	const [showCustomViewModal, setShowCustomViewModal] = useState(false);
	const [customViewSaved, setCustomViewSaved] = useState(false);
	const [showDefaultViewModal, setShowDefaultViewModal] = useState(false);
	const [failedToSaveDefault, setFailedToSaveDefault] = useState(false);

	const dispatch = useDispatch();
	const router = useSelector((state) => state.router);
	const viewsData = useSelector(
		(state) => state.viewsnew?.[SCREEN_TAG_MAP[screenTagKey]] || {}
	);
	const { hash, pathname, query } = router.location;

	useEffect(() => {
		if (!query.viewId) {
			if (!_.isEmpty(query.metaData)) {
				let customView = {
					label: "Custom View",
					name: "Custom View",
					layout_option: viewsData.layout_option,
				};
				setActiveView(customView);
			} else {
				setActiveView(defaultView);
			}
		}
	}, [query]);

	const path = pathname.split("/");
	let pathName = path[1];
	let itemId = path[2];

	const screenTagConditionsMap = {
		user_app: pathName === "users" && hash === "#applications",
		app_user: pathName === "applications" && hash === "#users",
	};

	async function loadList(customView = "", isDefaultView = false) {
		try {
			let screenTag = screenTagKey;

			if (
				screenTagConditionsMap["user_app"] ||
				screenTagConditionsMap["app_user"] ||
				screenTagKey
			) {
				setShowViews(true);
			}

			if (screenTagConditionsMap["app_user"]) {
				screenTag = "app_user";
			} else if (screenTagConditionsMap["user_app"]) {
				screenTag = "user_app";
			}

			let viewId;
			let viewListObj = {};

			setScreentag(SCREEN_TAG_MAP[screenTag]);

			let viewsList = await fetchViewsList(
				SCREEN_TAG_MAP[screenTag],
				screenTagConditionsMap["app_user"] ? itemId : undefined
			);
			setIsLoading(false);
			showCustomViewModal && setShowCustomViewModal(false);
			if (query.viewId) {
				viewId = query.viewId;
			}

			viewsList = viewsList.data.map((view) => {
				viewListObj[view._id] = view;
				if (customView) {
					setActiveView(customView);
				} else if (view.is_default) {
					!isDefaultView && setDefaultView(view);
					if (_.isEmpty(query.metaData)) {
						!isDefaultView && setActiveView(view);
					}
				} else if (viewId === view._id) {
					setActiveView(view);
				}
				view.label = view.name;
				view.value = view.name;
				return view;
			});

			setViewList(viewsList);
			dispatch({
				type: VIEWS_ACTION_TYPE.SET_VIEWS,
				payload: viewListObj,
			});
		} catch (error) {
			TriggerIssue("Error in fetching views", error);
		}
	}

	useEffect(() => {
		if (
			screenTagConditionsMap["user_app"] ||
			screenTagConditionsMap["app_user"] ||
			screenTagKey
		) {
			loadList();
		}
	}, []);

	function handleSelect(view) {
		let reqObj = {};
		let viewId = view._id;
		reqObj = filtersRequestBodyGenerator(query);
		if (viewId) {
			reqObj = {
				sort_by: view.sort?.length ? [view.sort[0]] : [],
				filter_by: view.filters,
				columns: view.columns,
			};
		}
		setActiveView(view);

		dispatch({
			type: viewsnewConstants.SET_LAYOUT_OPTION,
			payload: {
				screenTagKey: SCREEN_TAG_MAP[screenTagKey],
				layout_option:
					view?.layout_option === "paginated"
						? "paginated"
						: "infinite_scroll",
			},
		});
		let meta = encodeURIComponent(JSON.stringify(reqObj));
		let url = viewId
			? `?metaData=${meta}&viewId=${viewId}${hash}`
			: query?.searchQuery
			? `?metaData=${meta}&searchQuery=${query?.searchQuery}${hash}`
			: `?metaData=${meta}${hash}`;
		dispatch(push(url));
	}

	async function saveCustomView(name, description) {
		try {
			if (isLoading) return;
			setIsLoading(true);
			let filtersObj = {
				sort_by: responseMetaData.sort_by,
				filter_by: responseMetaData.filter_by,
				columns: responseMetaData.columns,
			};

			let reqBody = {
				name: name,
				description: description,
				screen_tag: screentag,
				is_default: false,
				...filtersObj,
				layout_option:
					viewsData.layout_option === "paginated"
						? "paginated"
						: "infinite_scroll",
			};

			let data = await saveCustomViewService(reqBody);
			setCustomViewSaved(true);
			data.data.label = data.data.name;
			loadList(data.data);
			handleSelect(data.data);
		} catch (error) {
			TriggerIssue("Error in saving custom view", error);
		}
	}

	function handleSetAll(e, option) {
		e.stopPropagation();
		setSelectedView(option);
		setShowDefaultViewModal(true);
	}

	async function handleDefaultViewAction(e, option, appId) {
		try {
			e.stopPropagation();
			setIsLoading(true);
			setSelectedView(option._id);
			let data = await saveAsDefaultView(option._id, screentag, appId);
			setDefaultView(option);
			loadList(false, true);
			setShowDefaultViewModal(false);
			setFailedToSaveDefault(false);
		} catch (error) {
			setFailedToSaveDefault(true);
			TriggerIssue("Error in setting Default view", error);
		}
	}

	async function handleDeleteView(e, option) {
		try {
			setIsLoading(true);
			setSelectedView(option._id);
			e.stopPropagation();
			let data = await deleteCustomView(option._id);
			setActiveView("");
			setDefaultView("");
			loadList();
			let systemViews = viewList.filter((view) => !view.is_custom);
			if (option.is_default || option._id === activeView._id) {
				systemViews.length &&
					handleSelect(viewList[systemViews.length - 1]);
			}
		} catch (error) {
			TriggerIssue("Error in deleting custom view", error);
		}
	}

	return (
		<div>
			{showViews && (
				<SelectOld
					style={{ minWidth: "160px" }}
					className="text-capitalize mr-3 mt-auto mb-auto"
					label="label"
					placeholder={activeView?.name || defaultView?.name}
					options={viewList}
					dropdownOnClick={true}
					onSelect={(view) => handleSelect(view)}
					value={activeView}
					defaultValue={defaultView}
					showIcons={true}
					arrowdropdown={arrowdropdown}
					optionListClass={"autho__dd__cont__list__view menu"}
					isView={true}
					setShowCustomViewModal={setShowCustomViewModal}
					setCustomViewSaved={setCustomViewSaved}
					handleDefaultViewAction={handleDefaultViewAction}
					handleDeleteView={handleDeleteView}
					groupBy={"is_custom"}
					inputPlaceholderClassName={"truncate_10vw"}
					isLoading={isLoading}
					selectedItem={selectedView}
					selectedItemName={activeView?.name || defaultView?.name}
					handleSetAll={handleSetAll}
					isMultiSelect={screenTagConditionsMap["app_user"]}
					itemId={itemId}
				/>
			)}
			{showCustomViewModal && (
				<CustomViewModal
					show={showCustomViewModal}
					setShowCustomViewModal={setShowCustomViewModal}
					handleSubmit={saveCustomView}
					isLoading={isLoading}
					customViewSaved={customViewSaved}
				/>
			)}
			{showDefaultViewModal && (
				<DefaultViewModal
					handleDefaultViewAction={handleDefaultViewAction}
					selectedView={selectedView}
					onHide={() => setShowDefaultViewModal(false)}
					isLoading={isLoading}
					failedToSaveDefault={failedToSaveDefault}
				/>
			)}
		</div>
	);
};

export default TableView;

export const viewIconsMap = {
	"Main View": defaultViewIcon,
	"Usage View": usageViewIcon,
	"Renewal View": renewalViewIcon,
	"Security View": securityViewIcon,
	"Spend View": spendViewIcon,
};
