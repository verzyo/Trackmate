import { zodResolver } from "@hookform/resolvers/zod";
import type { RefObject } from "react";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import type { ScrollView, TextInput } from "react-native";
import { GOAL_APPEARANCE_COLORS } from "@/components/goal/GoalAppearancePicker";
import {
	ATTACHMENT_TYPES,
	type AttachmentType,
} from "@/constants/attachmentTypes";
import {
	FREQUENCY_TYPES,
	type FrequencyType,
} from "@/constants/frequencyTypes";
import { type GoalForm, GoalFormSchema } from "@/schemas/goal.schema";

export interface UseGoalFormOptions {
	scrollViewRef: RefObject<ScrollView | null>;
	defaultValues?: Partial<GoalForm>;
}

export interface UseGoalFormReturn {
	control: ReturnType<typeof useForm<GoalForm>>["control"];
	handleSubmit: ReturnType<typeof useForm<GoalForm>>["handleSubmit"];
	setValue: ReturnType<typeof useForm<GoalForm>>["setValue"];
	watch: ReturnType<typeof useForm<GoalForm>>["watch"];
	reset: ReturnType<typeof useForm<GoalForm>>["reset"];
	formState: {
		errors: ReturnType<typeof useForm<GoalForm>>["formState"]["errors"];
	};
	freqType: FrequencyType;
	intervalInputValue: string;
	intervalValue: number;
	scheduledDays: number[];
	watchedAttachmentType: AttachmentType;
	selectedColor: string;
	selectedIcon: string;
	toggleDay: (val: number) => void;
	handleInviteInputFocus: (_input: TextInput | null) => void;
	onIntervalChange: (text: string) => void;
	onIntervalBlur: () => void;
	onIncrementInterval: () => void;
	onDecrementInterval: () => void;
}

export function useGoalForm(options: UseGoalFormOptions): UseGoalFormReturn {
	const { scrollViewRef, defaultValues } = options;

	const randomColor = useMemo(
		() =>
			GOAL_APPEARANCE_COLORS[
				Math.floor(Math.random() * GOAL_APPEARANCE_COLORS.length)
			],
		[],
	);

	const baseDefaultValues: GoalForm = {
		title: "",
		description: "",
		frequency_type: FREQUENCY_TYPES.INTERVAL,
		interval_days: "1",
		weekly_days: [1],
		attachment_type: ATTACHMENT_TYPES.NONE,
		require_attachment: false,
		color: randomColor,
		icon: "Target",
	};

	const {
		control,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors },
	} = useForm<GoalForm>({
		resolver: zodResolver(GoalFormSchema),
		defaultValues: { ...baseDefaultValues, ...defaultValues },
	});

	const freqType = watch("frequency_type") as FrequencyType;
	const intervalInputValue = watch("interval_days") ?? "1";
	const intervalValue = useMemo(
		() => parseInt(intervalInputValue || "1", 10),
		[intervalInputValue],
	);
	const scheduledDays = watch("weekly_days") || [];
	const watchedAttachmentType = watch("attachment_type") as AttachmentType;
	const selectedColor = watch("color") || GOAL_APPEARANCE_COLORS[0];
	const selectedIcon = watch("icon") || "Target";

	const toggleDay = useCallback(
		(val: number) => {
			const current = watch("weekly_days") || [];
			const next = current.includes(val)
				? current.filter((d) => d !== val)
				: [...current, val];
			setValue("weekly_days", next, { shouldValidate: true });
		},
		[setValue, watch],
	);

	const handleInviteInputFocus = useCallback(
		(_input: TextInput | null) => {
			requestAnimationFrame(() => {
				scrollViewRef.current?.scrollToEnd({ animated: true });
			});
		},
		[scrollViewRef],
	);

	const onIntervalChange = useCallback(
		(text: string) => {
			const sanitized = text.replace(/\D/g, "");
			setValue(
				"interval_days",
				sanitized === "" ? "" : String(Math.max(1, Number(sanitized))),
			);
		},
		[setValue],
	);

	const onIntervalBlur = useCallback(() => {
		if (!intervalInputValue || intervalValue < 1) {
			setValue("interval_days", "1");
		}
	}, [intervalInputValue, intervalValue, setValue]);

	const onIncrementInterval = useCallback(() => {
		setValue("interval_days", (intervalValue + 1).toString());
	}, [intervalValue, setValue]);

	const onDecrementInterval = useCallback(() => {
		setValue("interval_days", Math.max(1, intervalValue - 1).toString());
	}, [intervalValue, setValue]);

	return {
		control,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors },
		freqType,
		intervalInputValue,
		intervalValue,
		scheduledDays,
		watchedAttachmentType,
		selectedColor,
		selectedIcon,
		toggleDay,
		handleInviteInputFocus,
		onIntervalChange,
		onIntervalBlur,
		onIncrementInterval,
		onDecrementInterval,
	};
}
