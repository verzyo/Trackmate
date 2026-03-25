export const toUTCDate = (date: Date): Date => {
	return new Date(
		Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
	);
};

export const getTodayUTC = (): Date => {
	const now = new Date();
	return new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
	);
};

export const isTodayUTC = (date: Date): boolean => {
	const today = getTodayUTC();
	const checkDate = new Date(
		Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
	);
	return today.getTime() === checkDate.getTime();
};

export const differenceInDaysUTC = (
	dateLeft: Date,
	dateRight: Date,
): number => {
	const utcLeft = Date.UTC(
		dateLeft.getUTCFullYear(),
		dateLeft.getUTCMonth(),
		dateLeft.getUTCDate(),
	);
	const utcRight = Date.UTC(
		dateRight.getUTCFullYear(),
		dateRight.getUTCMonth(),
		dateRight.getUTCDate(),
	);
	const diffMs = utcLeft - utcRight;
	return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

export const addDaysUTC = (date: Date, days: number): Date => {
	const result = new Date(
		Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
	);
	result.setUTCDate(result.getUTCDate() + days);
	return result;
};

export const getDayOfWeekUTC = (date: Date): number => {
	const day = date.getUTCDay();
	return day === 0 ? 7 : day;
};

export const formatToISODate = (date: Date): string => {
	return date.toISOString().split("T")[0];
};
