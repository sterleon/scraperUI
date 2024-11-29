import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './alert';

interface Props {
	alertErrorDialogMsg: string;
}

const AlertPopupError = ({ alertErrorDialogMsg }: Props) => {
	return (
		<Alert variant='destructive'>
			<AlertCircle className='h-4 w-4' />
			<AlertTitle>Error</AlertTitle>
			<AlertDescription>{alertErrorDialogMsg}</AlertDescription>
		</Alert>
	);
};

export default AlertPopupError;
