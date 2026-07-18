import { nextui } from '@nextui-org/react'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#EAF0F8',
          100: '#CBDBEF',
          200: '#9AB6DE',
          300: '#6890CC',
          400: '#3D6BB4',
          500: '#234E92',
          600: '#163B76',
          700: '#102C59',
          800: '#0A1E3D',
          900: '#050F1F',
          DEFAULT: '#163B76',
        },
        secondary: {
          50: '#FFF3E8',
          100: '#FFE1C2',
          200: '#FFC385',
          300: '#FFA347',
          400: '#FB8B26',
          500: '#F4791A',
          600: '#D9630F',
          700: '#B04D0C',
          800: '#833A09',
          900: '#572706',
          DEFAULT: '#F4791A',
        },
      },
    },
  },
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            primary: {
              50: '#EAF0F8',
              100: '#CBDBEF',
              200: '#9AB6DE',
              300: '#6890CC',
              400: '#3D6BB4',
              500: '#234E92',
              600: '#163B76',
              700: '#102C59',
              800: '#0A1E3D',
              900: '#050F1F',
              DEFAULT: '#163B76',
              foreground: '#FFFFFF',
            },
            secondary: {
              50: '#FFF3E8',
              100: '#FFE1C2',
              200: '#FFC385',
              300: '#FFA347',
              400: '#FB8B26',
              500: '#F4791A',
              600: '#D9630F',
              700: '#B04D0C',
              800: '#833A09',
              900: '#572706',
              DEFAULT: '#F4791A',
              foreground: '#FFFFFF',
            },
          },
        },
        dark: {
          colors: {
            primary: {
              50: '#050F1F',
              100: '#0A1E3D',
              200: '#102C59',
              300: '#163B76',
              400: '#234E92',
              500: '#3D6BB4',
              600: '#6890CC',
              700: '#9AB6DE',
              800: '#CBDBEF',
              900: '#EAF0F8',
              DEFAULT: '#3D6BB4',
              foreground: '#050F1F',
            },
            secondary: {
              50: '#572706',
              100: '#833A09',
              200: '#B04D0C',
              300: '#D9630F',
              400: '#F4791A',
              500: '#FB8B26',
              600: '#FFA347',
              700: '#FFC385',
              800: '#FFE1C2',
              900: '#FFF3E8',
              DEFAULT: '#FB8B26',
              foreground: '#050F1F',
            },
          },
        },
      },
    }),
  ],
}
