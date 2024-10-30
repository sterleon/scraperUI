import HeaderAuth from '@/components/header-auth';
import { ThemeProvider } from 'next-themes';
import './globals.css';
import { ThemeSwitcher } from '@/components/theme-switcher';

export const metadata = {
	metadataBase: new URL('http://localhost:3000'),
	title: 'Job Scraper',
	description: 'Dashboard for scraped jobs from LinkedIn',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html suppressHydrationWarning>
			<body>
				<ThemeProvider
					attribute='class'
					defaultTheme='system'
					enableSystem
					disableTransitionOnChange
				>
					<div className='flex justify-between p-4'>
						<ThemeSwitcher />
						<HeaderAuth />
					</div>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
