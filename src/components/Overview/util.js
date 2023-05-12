export const monthIdNameMap = {
	1: "January",
	2: "February",
	3: "March",
	4: "April",
	5: "May",
	6: "June",
	7: "July",
	8: "August",
	9: "September",
	10: "October",
	11: "November",
	12: "December",
};

export function unpackSpendGraphData(res) {
	var response = {};
	response.spendLoading = false;
	const color = [
		"#2266E2",
		"#FF6767",
		"#5CAF53",
		"#FFB169",
		"#6967E0",
		"#717171",
	];

	const data = res?.spend_trend;
	let data2 = res?.spend_table_data;

	if (data2?.length > 1 && data && data?.length > 0) {
		data.map((spendItem) => {
			if (spendItem?.departments?.length > 0) {
				response.showSpendEmptyState = true;
			}
		});
	}

	if (data && data?.length > 0) {
		let datakeys = [];
		data.forEach((el) => {
			el.month_name = monthIdNameMap[el.month_id];
			el.departments.forEach((item) => {
				datakeys.push(item.department_name);
				el[item.department_name] = item.department_spend;
				el["Total"] = item.monthly_total;
			});
		});

		const uniq = [...new Set(datakeys)];
		uniq.sort((a, b) => (a > b ? 1 : -1));
		let obj = uniq.find((x) => x === "Total");
		let index = uniq.indexOf(obj);
		uniq.splice(index, 1);
		uniq.push(obj);
		let newuniq = new Array(uniq.length);
		for (var i = 0; i < uniq.length; i++) {
			newuniq[i] = [uniq[i], null];
		}

		for (var i = 0; i < newuniq.length; i++) {
			let obj3 = data2.find(
				(x) =>
					x.department_name.toLowerCase() ===
					newuniq[i][0]?.toLowerCase()
			);
			newuniq[i][2] = obj3?.total_spend;
		}
		newuniq.sort(function (a, b) {
			return b[2] - a[2];
		});
		if (newuniq.length > 6) {
			newuniq.length = 6;
		}

		let obj4 = newuniq.find((x) => x[0]?.toLowerCase() === "total");
		let index4 = newuniq.indexOf(obj4);
		newuniq.splice(index4, 1);
		newuniq.unshift(obj4);

		if (newuniq.length > 0 && newuniq[0] != undefined) {
			color.length = newuniq.length;
			for (var i = 0; i < newuniq.length; i++) {
				newuniq[i] = [
					newuniq[i][0],
					color[Math.abs(color.length - newuniq.length - i)],
					newuniq[i][2],
				];
			}
		}

		data2.sort((a, b) =>
			a.application_name > b.application_name ? 1 : -1
		);
		data2.sort(function (a, b) {
			return b.total_spend - a.total_spend;
		});
		let obj2 = data2.find((x) => x.department_name === "TOTAL");
		let index2 = data2.indexOf(obj2);
		data2.splice(index2, 1);
		data2.unshift(obj2);
		if (data2.length > 6) {
			data2.length = 6;
		}

		for (var j = 0; j < data2.length; j++) {
			data2[j].color = color[j];
		}

		response.spendDataKeys = newuniq;
		data.sort((a, b) => a.year_id - b.year_id || a.month_id - b.month_id);
		response.spendData = data;
		response.spendTable = data2;
	}
	return response;
}
export function unpackUsageGraphData(res) {
	var response = {};
	response.usageLoading = false;
	const data = res?.usage_trend;
	const data2 = res?.usage_table_data;
	const color = [
		"#2266E2",
		"#FF6767",
		"#5CAF53",
		"#FFB169",
		"#6967E0",
		"#717171",
	];

	if (data2?.length > 1 && data && data?.length > 0) {
		data.map((usageItem) => {
			if (usageItem.departments.length > 0) {
				response.showUsageEmptyState = true;
			}
		});
	}

	if (data && data?.length > 0) {
		let datakeys = [];
		data.forEach((el) => {
			el.month_name = monthIdNameMap[el.month_id];

			el.departments.forEach((item) => {
				datakeys.push(item.department_name);
				el[item.department_name] = item.department_usage;
				el["Total"] = item.monthly_avg;
			});
		});
		const uniq = [...new Set(datakeys)];
		uniq.sort((a, b) => (a > b ? 1 : -1));

		let newuniq = new Array(uniq.length);
		for (var i = 0; i < uniq.length; i++) {
			newuniq[i] = [uniq[i], null];
		}
		for (var i = 0; i < newuniq.length; i++) {
			let obj3 = data2.find(
				(x) =>
					x.department_name.toLowerCase() ===
					newuniq[i][0].toLowerCase()
			);
			newuniq[i][2] = obj3?.total_usage || obj3?.average_usage;
		}
		newuniq.sort(function (a, b) {
			return b[2] - a[2];
		});
		if (newuniq.length > 6) {
			newuniq.length = 6;
		}
		let obj4 = newuniq.find((x) => x[0].toLowerCase() === "total");
		let index4 = newuniq.indexOf(obj4);
		newuniq.splice(index4, 1);
		newuniq.unshift(obj4);

		newuniq.forEach((el, index) => {
			color.length = newuniq.length;
			if (el && el.length) {
				newuniq[index] = [
					newuniq[index][0],
					color[Math.abs(color.length - newuniq.length - index)],
					newuniq[index][2],
				];
			} else {
				newuniq.splice(index, 1);
			}
		});

		data2.sort((a, b) =>
			a.application_name > b.application_name ? 1 : -1
		);
		data2.sort(function (a, b) {
			return b.total_usage - a.total_usage;
		});
		let obj2 = data2.find((x) => x.department_name === "TOTAL");
		let index2 = data2.indexOf(obj2);
		data2.splice(index2, 1);
		data2.unshift(obj2);
		if (data2.length > 6) {
			data2.length = 6;
		}

		for (var j = 0; j < data2.length; j++) {
			data2[j].color = color[j];
		}

		response.usageDataKeys = newuniq;
		data.sort((a, b) => a.year_id - b.year_id || a.month_id - b.month_id);
		response.usageData = data;
		response.usageTable = data2;
	}
	return response;
}
