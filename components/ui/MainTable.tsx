import { MoreHorizontal } from 'lucide-react';
import { Badge } from './badge';
import { Button } from './button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from './card';
import { Checkbox } from './checkbox';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from './dropdown-menu';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from './table';
import { Dispatch, SetStateAction } from 'react';
import { createClient } from '@/utils/supabase/client';
import { AlertDialogueMsg, Job } from '@/app/types';

interface Props {
	currentJobs: Job[];
	selectedJobs: Job[];
	setSelectedJobs: Dispatch<SetStateAction<Job[]>>;
	currentJobRange: {
		from: number;
		to: number;
	};
	numJobs: number | null;
	setAlertDialogueMsg: Dispatch<SetStateAction<AlertDialogueMsg>>;
	fetchJobs: (pageNum?: number) => Promise<void>;
	currentPageNum: number;
	getCurrentFormattedDate: () => string;
}

const MainTable = ({
	currentJobs,
	selectedJobs,
	setSelectedJobs,
	currentJobRange,
	numJobs,
	setAlertDialogueMsg,
	fetchJobs,
	currentPageNum,
	getCurrentFormattedDate,
}: Props) => {
	const supabase = createClient();
	const formatDate = (dateString: string): string => {
		const date = new Date(dateString);

		const day = date.getUTCDate();
		const month = date.getUTCMonth() + 1;
		const year = date.getUTCFullYear();

		return `${month}-${day}-${year}` === '1-1-1970'
			? '-'
			: `${month}-${day}-${year}`;
	};

	const markSingleApplied = async (job: Job, apply: boolean) => {
		if (job.applied === apply) {
			setAlertDialogueMsg(
				apply
					? {
							type: 'error',
							msg: 'Job already applied',
						}
					: {
							type: 'error',
							msg: 'Job already active',
						}
			);
			return;
		}

		const { data, error } = await supabase
			.from('jobs')
			.update({
				applied: apply,
				updated_at: apply ? getCurrentFormattedDate() : null,
			})
			.eq('id', job.id)
			.select();

		if (error) {
			console.error('Error updating job:', error);
			return;
		}

		if (data) {
			fetchJobs(currentPageNum);
			setAlertDialogueMsg(
				apply
					? {
							type: 'success',
							msg: 'Job marked applied',
						}
					: {
							type: 'success',
							msg: 'Job marked active',
						}
			);
		}
	};

	const deleteSingle = async (job: Job) => {
		const { error } = await supabase.from('jobs').delete().eq('id', job.id);
		if (!error) {
			fetchJobs(currentPageNum);
			setAlertDialogueMsg({
				type: 'success',
				msg: 'Job deleted',
			});
		} else console.log(error);
	};
	return (
		<Card x-chunk='dashboard-06-chunk-0'>
			<CardHeader>
				<CardTitle>Jobs</CardTitle>
				<CardDescription>Manage your jobs here</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Title</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className='hidden md:table-cell'>Company</TableHead>
							<TableHead className='hidden md:table-cell'>Location</TableHead>
							<TableHead className='hidden md:table-cell'>Added</TableHead>
							<TableHead className='hidden md:table-cell'>Applied</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{currentJobs.map((job) => {
							return (
								<TableRow key={job.id}>
									<TableCell>
										<div className='flex items-center gap-2'>
											<Checkbox
												onCheckedChange={(checked) => {
													setSelectedJobs((prev) =>
														checked
															? [...prev, job]
															: selectedJobs.filter(
																	(selectedJob) => selectedJob.id !== job.id
																)
													);
												}}
											/>
											<a
												className='hover:underline'
												href={job.url}
												target='_blank'
											>
												{job.title}
											</a>
										</div>
									</TableCell>
									<TableCell>
										{job.applied ? (
											<Badge
												variant='outline'
												className='bg-green-500'
											>
												Applied
											</Badge>
										) : (
											<Badge
												variant='outline'
												className='bg-blue-500'
											>
												Active
											</Badge>
										)}
									</TableCell>
									<TableCell className='hidden md:table-cell'>
										{job.company}
									</TableCell>
									<TableCell className='hidden md:table-cell'>
										{job.location}
									</TableCell>
									<TableCell className='hidden md:table-cell'>
										{formatDate(job.created_at)}
									</TableCell>
									<TableCell className='hidden md:table-cell'>
										{formatDate(job.updated_at)}
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													aria-haspopup='true'
													size='icon'
													variant='ghost'
												>
													<MoreHorizontal className='h-4 w-4' />
													<span className='sr-only'>Toggle menu</span>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align='end'>
												<DropdownMenuLabel>Actions</DropdownMenuLabel>
												<DropdownMenuItem
													className='cursor-pointer'
													onClick={() => {
														markSingleApplied(job, true);
													}}
												>
													Mark Applied
												</DropdownMenuItem>
												<DropdownMenuItem
													className='cursor-pointer'
													onClick={() => {
														markSingleApplied(job, false);
													}}
												>
													Mark Active
												</DropdownMenuItem>
												<DropdownMenuItem
													className='cursor-pointer'
													onClick={() => {
														deleteSingle(job);
													}}
												>
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</CardContent>
			<CardFooter>
				<div className='text-xs text-muted-foreground'>
					Showing{' '}
					<strong>
						{currentJobRange.from}-{currentJobRange.to}
					</strong>{' '}
					of <strong>{numJobs}</strong> jobs
				</div>
			</CardFooter>
		</Card>
	);
};

export default MainTable;
