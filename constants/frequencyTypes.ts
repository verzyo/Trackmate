export const FREQUENCY_TYPES = {
	INTERVAL: "interval",
	WEEKLY: "weekly",
} as const;

export type FrequencyType =
	(typeof FREQUENCY_TYPES)[keyof typeof FREQUENCY_TYPES];
