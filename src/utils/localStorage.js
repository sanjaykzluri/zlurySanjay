import { store } from "./store";
const reduxLocalStorageSyncMap = {
	userInfo: "userInfo",
	gettingStartedStatuses: "gettingStartedStatuses",
	employee: "employee",
};

export function updateLocalStorage() {
	const state = store.getState();
	Object.entries(reduxLocalStorageSyncMap).forEach(
		([reduxKey, localStorageKey]) => {
			if (state[reduxKey]) {
				setValueToLocalStorage(
					localStorageKey,
					JSON.stringify(state[reduxKey])
				);
			}
		}
	);
}
export function loadState() {
	const state = {};
	Object.entries(reduxLocalStorageSyncMap).forEach(
		([reduxKey, localStorageKey]) => {
			state[reduxKey] = getValueFromLocalStorage(localStorageKey);
		}
	);
	return state;
}

export function getValueFromLocalStorage(key) {
	try {
		let value = localStorage.getItem(key);
		if (value) {
			try {
				return JSON.parse(value);
			} catch (err) {
				return value;
			}
		}
	} catch (err) {
		console.log(err);
	}
}

export function setValueToLocalStorage(key, value) {
	try {
		localStorage.setItem(key, value);
	} catch (err) {
		console.log(err);
	}
}

export function removeFromLocalStorage(key) {
	try {
		localStorage.removeItem(key);
	} catch (err) {
		console.log(err);
	}
}

export function clearStorage() {
	const keys = [
		"token",
		"user",
		"userInfo",
		"gettingStartedStatuses",
		"orgId",
		"startMonth",
		"isUserBlocked",
		"employee",
		"partner",
		"partnerName",
		"connection",
	];
	try {
		keys.forEach((key) => {
			localStorage.removeItem(key);
		});
		sessionStorage.clear();
	} catch (err) {
		console.log(err);
	}
}
