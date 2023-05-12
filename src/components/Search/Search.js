import React from "react";
import BeginSearch from "./BeginSearch";
import NoResults from "./NoResults";
import SearchResults from "./SearchResults";
import "./Search.css";
import { checkSpecialCharacters } from "../../services/api/search";
import { globalSearchEntityAndAPI } from "../HeaderTitleAndGlobalSearch/HeaderGlobalSearchConstants";
import { IntegrationCard } from "../../modules/integrations/components/IntegrationCard/IntegrationCard";
import { Integration } from "../../modules/integrations/model/model";
import { useHistory } from "react-router-dom";

export default function Search({ results, searchkey, entity }) {
	const history = useHistory();

	const { applications, users, department, integrations } = results;

	const totalresults = checkSpecialCharacters(searchkey)
		? 0
		: entity === globalSearchEntityAndAPI[0].text
		? applications.length
		: entity === globalSearchEntityAndAPI[1].text
		? users.length
		: entity === globalSearchEntityAndAPI[2].text
		? department.length
		: integrations.length;

	return (
		<div className="search__outermain">
			<div className="totalResults font-18">
				{totalresults} Results for {searchkey}
			</div>
			{entity === globalSearchEntityAndAPI[0].text && (
				<SearchResults
					data={applications}
					label="Applications"
					options={{
						secondaryTextKey: "category_name",
						urlTemplate: "/applications/{_id}#overview",
						statusKey: "status",
					}}
				/>
			)}
			{entity === globalSearchEntityAndAPI[1].text && (
				<SearchResults
					data={users}
					label="Users"
					options={{
						imageKey: "profile_img",
						urlTemplate: "/users/{_id}#overview",
						statusKey: "status",
					}}
				/>
			)}
			{entity === globalSearchEntityAndAPI[2].text && (
				<SearchResults
					data={department}
					label="Departments"
					options={{
						secondaryTextKey: "user_count",
						secondaryTextSuffix: "Users",
						urlTemplate: "/departments/{_id}#overviewdep",
					}}
				/>
			)}
			{entity === globalSearchEntityAndAPI[3].text && (
				<div className="search__wrapper">
					{integrations.map((integration, key) => (
						<IntegrationCard
							key={key}
							integration={new Integration(integration)}
							onSuccess={() => {
								history.push("/overview");
							}}
							onRequestSent={() => {}}
						/>
					))}
				</div>
			)}
			{searchkey === "" && <BeginSearch />}
			{totalresults === 0 && <NoResults searchkey={searchkey} />}
		</div>
	);
}
