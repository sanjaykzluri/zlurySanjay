import React from "react";
import Search from "../components/Search/Search";

export default function SearchContainer({ results, searchkey }) {
	return <Search results={results} searchkey={searchkey} />;
}
