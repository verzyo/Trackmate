export const DAY_NAMES = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
] as const;

export const dayNumberToName = (day: number): string => {
	return DAY_NAMES[day - 1] ?? `Day ${day}`;
};
