import { createClient } from '@/utils/supabase/server';
import { data } from 'autoprefixer';
import { InfoIcon } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
	const supabase = createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return redirect('/sign-in');
	}

	let { data: jobs, error } = await supabase.from('jobs').select('*');

	if (!error) {
		console.log(jobs);
	} else {
		console.log(error);
	}

	return (
		<div className='bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center'>
			<InfoIcon
				size='16'
				strokeWidth={2}
			/>
			This is a protected page that you can only see as an authenticated user
		</div>
	);
}
