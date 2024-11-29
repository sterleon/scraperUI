import { Button } from './button';
import DeleteAlert from './DeleteAlert';

interface Props {
	deleteSelected: () => Promise<void>;
	markSelectedJobsApplied: (apply: boolean) => Promise<void>;
}

const SelectedJobsControls = ({
	deleteSelected,
	markSelectedJobsApplied,
}: Props) => {
	return (
		<div className='flex gap-1'>
			<DeleteAlert deleteSelected={deleteSelected} />

			<Button
				variant='outline'
				className='hover:bg-green-600'
				onClick={() => {
					markSelectedJobsApplied(true);
				}}
			>
				Mark Applied
			</Button>
			<Button
				variant='outline'
				className='hover:bg-blue-600'
				onClick={() => {
					markSelectedJobsApplied(false);
				}}
			>
				Mark Active
			</Button>
		</div>
	);
};

export default SelectedJobsControls;
