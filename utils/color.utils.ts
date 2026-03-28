export function hexToRgba(hex: string, alpha: number): string {
	const sanitized = hex.replace("#", "");
	const r = parseInt(sanitized.slice(0, 2), 16);
	const g = parseInt(sanitized.slice(2, 4), 16);
	const b = parseInt(sanitized.slice(4, 6), 16);
	return `rgba(${r},${g},${b},${alpha})`;
}
