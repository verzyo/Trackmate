/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			colors: {
				action: {
					primary: "var(--color-action-primary)",
					"primary-fg": "var(--color-action-primary-fg)",
					secondary: "var(--color-action-secondary)",
					"secondary-fg": "var(--color-action-secondary-fg)",
				},
				text: {
					strong: "var(--color-text-strong)",
					DEFAULT: "var(--color-text-default)",
					light: "var(--color-text-light)",
				},
				surface: {
					bg: "var(--color-surface-bg)",
					fg: "var(--color-surface-fg)",
				},
				state: {
					success: "var(--color-state-success)",
					danger: "var(--color-state-danger)",
					"muted-bg": "var(--color-state-muted-bg)",
					"muted-fg": "var(--color-state-muted-fg)",
				},
				label: {
					bg: "var(--color-label-bg)",
					fg: "var(--color-label-fg)",
				},
				border: {
					DEFAULT: "var(--color-border)",
				},
			},
		},
	},
	plugins: [],
};
