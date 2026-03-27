import type { IconProps } from "phosphor-react-native";
import * as PhosphorIcons from "phosphor-react-native";
import type { ComponentType, ReactNode } from "react";

// biome-ignore lint/suspicious/noExplicitAny: phosphor module has mixed exports (icons + IconContext)
const Icons = PhosphorIcons as any as Record<string, ComponentType>;

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
