/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				neutral: {
					100: "#F5F3FF",
					200: "#DFDDE9",
					300: "#C9C7D2",
					400: "#87868F",
					500: "#717078",
					600: "#45444B",
					700: "#2F2F35",
					800: "#19191E",
					900: "#030308",
				},
				primary: {
					100: "#F2F2FF",
					200: "#DDDDEA",
					300: "#C7C8D5",
					400: "#888996",
					500: "#727481",
					600: "#484A57",
					700: "#333542",
					800: "#1D202D",
					900: "#080B1B"
				}
			},
			fontSize: {
        // Base sizes: 1.125 scale
        'xs-base': '0.812rem',
        'sm-base': '0.875rem',
        'base-base': '1rem',
        'lg-base': '1.125rem',
        'xl-base': '1.25rem',
        '2xl-base': '1.438rem',
        '3xl-base': '1.625rem',
        '4xl-base': '1.812rem',
        '5xl-base': '2rem',
        // Medium screen sizes: 1.25 scale
        'xs-md': '0.625rem',
        'sm-md': '0.812rem',
        'base-md': '1rem',
        'lg-md': '1.25rem',
        'xl-md': '1.562rem',
        '2xl-md': '1.938rem',
        '3xl-md': '2.438rem',
        '4xl-md': '3.062rem',
        '5xl-md': '3.812rem',
        // Large screen sizes: 1.33 scale
        'xs-lg': '0.562rem',
        'sm-lg': '0.75rem',
        'base-lg': '1rem',
        'lg-lg': '1.312rem',
        'xl-lg': '1.75rem',
        '2xl-lg': '2.375rem',
        '3xl-lg': '3.188rem',
        '4xl-lg': '4.188rem',
        '5xl-lg': '5.625rem',
      },
		},
	},
	plugins: [],
}
