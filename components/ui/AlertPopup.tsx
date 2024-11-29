import { CheckCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './alert';

interface Props {
	alertDialogMsg: string;
}

const AlertPopup = ({ alertDialogMsg }: Props) => {
	return (
		<Alert className='border-green-600 bg-muted/10'>
			<CheckCheck className='h-4 w-4 stroke-green-600' />
			<AlertTitle className='text-green-600'>Done</AlertTitle>
			<AlertDescription className='text-green-600'>
				{alertDialogMsg}
			</AlertDescription>
		</Alert>
	);
};

export default AlertPopup;
