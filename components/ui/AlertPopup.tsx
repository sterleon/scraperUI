import { AlertCircle, CheckCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { AlertDialogueMsg } from '@/app/types';

interface Props {
	alertDialogueMsg: AlertDialogueMsg;
}

const AlertPopup = ({ alertDialogueMsg }: Props) => {
	return (
		<>
			{alertDialogueMsg.type === 'success' ? (
				<Alert className='border-green-600 bg-muted/10'>
					<CheckCheck className='h-4 w-4 stroke-green-600' />
					<AlertTitle className='text-green-600'>Done</AlertTitle>
					<AlertDescription className='text-green-600'>
						{alertDialogueMsg.msg}
					</AlertDescription>
				</Alert>
			) : (
				<Alert variant='destructive'>
					<AlertCircle className='h-4 w-4' />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{alertDialogueMsg.msg}</AlertDescription>
				</Alert>
			)}
		</>
	);
};

export default AlertPopup;
