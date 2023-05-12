export const sortApplicationsFunction = (data) => {
	let tempArray = data.results;
	let arrayWithIntegrationId = tempArray.filter(
		(el) => el.app_integration_id !== null
	);
	let arrayWithoutIntegrationId = tempArray.filter(
		(el) => el.app_integration_id === null
	);
	let newArray = arrayWithIntegrationId.concat(arrayWithoutIntegrationId);
	return newArray;
};

export const updateTriggerTitle = (title, application) => {
	if (title) {
		title = title.replace(
			/<b>@application_name@<\/b>/g,
			application?.app_name ? application.app_name : ""
		);
		title = title.replace(
			/<b>@org_application_name@<\/b>/g,
			application?.app_name ? application.app_name : ""
		);
	}
	return title;
};
