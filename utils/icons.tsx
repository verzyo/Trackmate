import type { IconProps } from "phosphor-react-native";
import * as PhosphorIcons from "phosphor-react-native";
import type { ComponentType, ReactNode } from "react";

const Icons = PhosphorIcons as unknown as Record<
	string,
	ComponentType<IconProps>
>;

export function getIconComponent(iconName: string): ReactNode {
	const IconComp = Icons[iconName] || PhosphorIcons.Target;
	return <IconComp />;
}

export interface DynamicIconProps extends IconProps {
	name: string;
}

export function DynamicIcon({ name, color, size, weight }: DynamicIconProps) {
	const IconComponent = Icons[name] as ComponentType<IconProps> | undefined;
	if (!IconComponent) {
		return (
			<PhosphorIcons.TargetIcon color={color} size={size} weight={weight} />
		);
	}
	return <IconComponent color={color} size={size} weight={weight} />;
}
