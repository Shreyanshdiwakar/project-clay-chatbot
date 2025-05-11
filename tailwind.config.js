/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
    './src/**/*.{js,ts,jsx,tsx,mdx,css}',
  ],
  safelist: [
    'text-gray-100', 'text-gray-200', 'text-gray-300', 'text-gray-400', 'text-gray-500',
    'text-gray-600', 'text-gray-700', 'text-gray-800', 'text-gray-900',
    'bg-gray-100', 'bg-gray-200', 'bg-gray-300', 'bg-gray-400', 'bg-gray-500',
    'bg-gray-600', 'bg-gray-700', 'bg-gray-800', 'bg-gray-900',
    'border-gray-100', 'border-gray-200', 'border-gray-300', 'border-gray-400', 'border-gray-500',
    'border-gray-600', 'border-gray-700', 'border-gray-800', 'border-gray-900',
    
    'text-zinc-50', 'text-zinc-100', 'text-zinc-200', 'text-zinc-300', 'text-zinc-400', 'text-zinc-500',
    'text-zinc-600', 'text-zinc-700', 'text-zinc-800', 'text-zinc-900', 'text-zinc-950',
    'bg-zinc-50', 'bg-zinc-100', 'bg-zinc-200', 'bg-zinc-300', 'bg-zinc-400', 'bg-zinc-500',
    'bg-zinc-600', 'bg-zinc-700', 'bg-zinc-800', 'bg-zinc-900', 'bg-zinc-950',
    'border-zinc-50', 'border-zinc-100', 'border-zinc-200', 'border-zinc-300', 'border-zinc-400', 'border-zinc-500',
    'border-zinc-600', 'border-zinc-700', 'border-zinc-800', 'border-zinc-900', 'border-zinc-950',
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			'primary-light': 'var(--primary-light)',
  			'primary-dark': 'var(--primary-dark)',
  			'gray-light': 'var(--gray-light)',
  			'gray-medium': 'var(--gray-medium)',
  			success: 'var(--success)',
  			error: 'var(--error)',
  			zinc: {
  				'50': '#fafafa',
  				'100': '#f4f4f5',
  				'200': '#e4e4e7',
  				'300': '#d4d4d8',
  				'400': '#a1a1aa',
  				'500': '#71717a',
  				'600': '#52525b',
  				'700': '#3f3f46',
  				'800': '#27272a',
  				'900': '#18181b',
  				'950': '#09090b'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.5s ease-out forwards',
  			pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
  		},
  		keyframes: {
  			fadeIn: {
  				from: {
  					opacity: 0,
  					transform: 'translateY(4px)'
  				},
  				to: {
  					opacity: 1,
  					transform: 'translateY(0)'
  				}
  			},
  			pulse: {
  				'0%, 100%': {
  					opacity: 1
  				},
  				'50%': {
  					opacity: 0.5
  				}
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} 