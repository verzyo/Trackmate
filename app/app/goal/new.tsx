import DateTimePicker, {
	type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	Alert,
	Button,
	Platform,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";
import { Screen } from "@/components/layout/Screen";
import { useCreateGoal } from "@/hooks/goal/useCreateGoal";
import type { CreateGoalParams } from "@/lib/api/goal.api";

type GoalForm = {
	title: string;
	description: string;
	interval_days: string;
	weekly_days: string;
};

export default function NewGoalModal() {
	const [frequencyType, setFrequencyType] = useState<"interval" | "weekly">(
		"interval",
	);
	const [anchorDate, setAnchorDate] = useState(new Date());
	const [showDatePicker, setShowDatePicker] = useState(false);

	const createGoalMutation = useCreateGoal();

	const {
		control,
		handleSubmit,
		formState: { isSubmitting },
	} = useForm<GoalForm>({
		defaultValues: {
			title: "",
			description: "",
			interval_days: "1",
			weekly_days: "1",
		},
	});

	const onChangeDate = (_event: DateTimePickerEvent, selectedDate?: Date) => {
		if (Platform.OS === "android") {
			setShowDatePicker(false);
		}

		const currentDate = selectedDate || anchorDate;
		setAnchorDate(currentDate);
	};

	const onSubmit = async (data: GoalForm) => {
		try {
			const activeInterval =
				frequencyType === "interval" ? parseInt(data.interval_days, 10) : null;
			let activeWeekly: number[] | null = null;

			if (frequencyType === "weekly") {
				activeWeekly = data.weekly_days
					.split(",")
					.map((d) => parseInt(d.trim(), 10))
					.filter((d) => !Number.isNaN(d));
			}

			const params: CreateGoalParams = {
				title: data.title,
				description: data.description,
				frequency_type: frequencyType,
				interval_days: activeInterval,
				weekly_days: activeWeekly,
				anchor_date: anchorDate.toISOString(),
			};

			await createGoalMutation.mutateAsync(params);
			router.back();
		} catch (error) {
			let errorMessage =
				error instanceof Error ? error.message : "Failed to create goal";

			if (errorMessage.includes("title_not_empty")) {
				errorMessage = "Goal title cannot be empty.";
			}

			if (Platform.OS === "web") {
				alert(errorMessage);
			} else {
				Alert.alert("Error", errorMessage);
			}
		}
	};

	const isLoading = isSubmitting || createGoalMutation.isPending;

	return (
		<Screen className="px-6 py-4">
			<ScrollView contentContainerClassName="flex-grow items-center justify-center gap-4">
				<Text>Title*</Text>
				<Controller
					control={control}
					name="title"
					render={({ field: { onChange, value } }) => (
						<TextInput
							value={value}
							onChangeText={onChange}
							placeholder="e.g. Morning Run"
							className="text-center"
						/>
					)}
				/>

				<Text>Description</Text>
				<Controller
					control={control}
					name="description"
					render={({ field: { onChange, value } }) => (
						<TextInput
							value={value}
							onChangeText={onChange}
							placeholder="Optional details"
							className="text-center"
						/>
					)}
				/>

				<Text className="mt-4">Frequency Type*</Text>
				<View className="flex-row gap-4 mb-2">
					<Button
						title="Interval"
						color={frequencyType === "interval" ? "#007AFF" : "gray"}
						onPress={() => setFrequencyType("interval")}
					/>
					<Button
						title="Weekly"
						color={frequencyType === "weekly" ? "#007AFF" : "gray"}
						onPress={() => setFrequencyType("weekly")}
					/>
				</View>

				{frequencyType === "interval" && (
					<>
						<Text>Every X Days*</Text>
						<Controller
							control={control}
							name="interval_days"
							render={({ field: { onChange, value } }) => (
								<TextInput
									value={value}
									onChangeText={onChange}
									keyboardType="number-pad"
									placeholder="e.g. 1 for everyday"
									className="text-center"
								/>
							)}
						/>
					</>
				)}

				{frequencyType === "weekly" && (
					<>
						<Text>Days of the Week (1=Mon, 7=Sun)*</Text>
						<Controller
							control={control}
							name="weekly_days"
							render={({ field: { onChange, value } }) => (
								<TextInput
									value={value}
									onChangeText={onChange}
									placeholder="e.g. 1, 3, 5"
									className="text-center"
								/>
							)}
						/>
					</>
				)}

				<Text className="mt-4">Anchor Date*</Text>
				{Platform.OS === "web" ? (
					<View className="mb-4">
						<input
							type="date"
							value={anchorDate.toISOString().split("T")[0]}
							max={new Date().toISOString().split("T")[0]}
							onChange={(e) => {
								if (e.target.value) {
									const [year, month, day] = e.target.value
										.split("-")
										.map(Number);
									setAnchorDate(new Date(year, month - 1, day));
								}
							}}
							className="border-0 outline-none bg-transparent text-center"
						/>
					</View>
				) : (
					<Pressable
						onPress={() => setShowDatePicker(true)}
						className="p-3 mb-4"
					>
						<Text className="text-center text-blue-500">
							{anchorDate.toLocaleDateString()}
						</Text>
					</Pressable>
				)}

				{Platform.OS !== "web" && showDatePicker && (
					<DateTimePicker
						value={anchorDate}
						mode="date"
						display={"default"}
						maximumDate={new Date()}
						onChange={onChangeDate}
					/>
				)}

				<View className="mt-4">
					<Button
						title={isLoading ? "Creating..." : "Create Goal"}
						onPress={handleSubmit(onSubmit)}
						disabled={isLoading}
					/>
				</View>
			</ScrollView>
		</Screen>
	);
}
