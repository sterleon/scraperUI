import { signUpAction } from '@/app/actions';
import { FormMessage, Message } from '@/components/form-message';
import { SubmitButton } from '@/components/submit-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { SmtpMessage } from '../smtp-message';

export default function Signup({ searchParams }: { searchParams: Message }) {
	if ('message' in searchParams) {
		return (
			<div className='w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4'>
				<FormMessage message={searchParams} />
			</div>
		);
	}

	return (
		<div className='w-screen h-screen flex items-center justify-center'>
			<form className='flex flex-col mx-auto w-1/2'>
				<h1 className='text-2xl font-medium'>Sign up</h1>
				<div className='flex flex-col gap-2 [&>input]:mb-3 mt-8'>
					<Label htmlFor='email'>Email</Label>
					<Input
						name='email'
						placeholder='you@example.com'
						required
					/>
					<Label htmlFor='password'>Password</Label>
					<Input
						type='password'
						name='password'
						placeholder='Your password'
						minLength={6}
						required
					/>
					<SubmitButton
						formAction={signUpAction}
						pendingText='Signing up...'
					>
						Sign up
					</SubmitButton>
					<FormMessage message={searchParams} />
				</div>
			</form>
		</div>
	);
}
