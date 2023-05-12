export const RENEWAL_INTERVAL = {
	Month: "monthly",
	Year: "yearly",
};

export const RENEWAL_FREQUENCY = [...Array(100).keys()].map((x) => ++x);

export const RENEWAL_FREQUENCY_DEFAULT = 1;

export const RENEWAL_REMINDER_BEFORE = [...Array(365).keys()].map((x) => ++x);

export const RENEWAL_REMINDER_BEFORE_DEFAULT = 2;

export const viewStyle = {
	LIST: "list",
	GRID: "segregated",
};

export const RENEWAL_TYPE = {
	APPLICATION: "application",
	CONTRACT: "contract",
	PAYMENT: "payment",
};
