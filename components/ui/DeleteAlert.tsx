import {
	AlertDialogHeader,
	AlertDialogFooter,
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogCancel,
	AlertDialogAction,
} from './alert-dialog';
import { Button } from './button';

interface Props {
	deleteSelected: () => Promise<void>;
}

const DeleteAlert = ({ deleteSelected }: Props) => {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					variant='outline'
					className='hover:bg-red-600'
				>
					Delete Selected
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete the
						selected jobs.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => {
							deleteSelected();
						}}
					>
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default DeleteAlert;
