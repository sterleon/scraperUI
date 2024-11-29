import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './alert';

interface Props {
	alertDialogueMsg: string;
}

const AlertPopupError = ({ alertDialogueMsg }: Props) => {
	return (
		<Alert variant='destructive'>
			<AlertCircle className='h-4 w-4' />
			<AlertTitle>Error</AlertTitle>
			<AlertDescription>{alertDialogueMsg}</AlertDescription>
		</Alert>
	);
};

export default AlertPopupError;
