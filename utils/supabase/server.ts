import { createServerClient } from '@supabase/ssr';
import { cookies, type UnsafeUnwrappedCookies } from 'next/headers';

export const createClient = async () => {
	// Await the cookies to resolve the promise
	const cookieStore = (await cookies()) as unknown as UnsafeUnwrappedCookies;

	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					try {
						cookiesToSet.forEach(({ name, value, options }) => {
							cookieStore.set(name, value, options);
						});
					} catch (error) {
						// Ignore if called from a Server Component
					}
				},
			},
		}
	);
};
