'use client';
import { createClient } from '@/utils/supabase/client';
import { redirect } from 'next/navigation';
import {
	AlertCircle,
	CheckCheck,
	ListFilter,
	MoreHorizontal,
	Search,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { JSX, useEffect, useRef, useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { Checkbox } from '@/components/ui/checkbox';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface Job {
	id: string;
	created_at: string;
	updated_at: string;
	title: string;
	company: string;
	url: string;
	is_local: boolean;
	applied: boolean;
	email: string;
	location: string;
}

type Query = PostgrestFilterBuilder<any, any, any[], 'jobs', unknown>;
type SortType = 'all' | 'active' | 'applied';
type FilterType = 'date' | 'local' | 'remote';

export default function Dashboard() {
	const supabase = createClient();
	const [currentJobs, setCurrentJobs] = useState<Job[]>([]);
	const [currentPageNum, setCurrentPageNum] = useState<number>(0);
	const [numPages, setNumPages] = useState<number>(0);
	const [pageNumbers, setPageNumbers] = useState<JSX.Element[]>();
	const [sortedBy, setSortedBy] = useState<SortType>('all');
	const [filteredBy, setFilteredBy] = useState<FilterType[]>([]);
	const [searchQuery, SetSearchQuery] = useState<string>('');
	const [selectedJobs, setSelectedJobs] = useState<Job[]>([]);
	const [alertDialog, setAlertDialog] = useState<string | null>(null);
	const [alertErrorDialog, setAlertErrorDialog] = useState<string | null>(null);
	const [numJobs, setNumJobs] = useState<number | null>(null);
	const [currentJobRange, setCurrentJobRange] = useState({
		from: 1,
		to: 10,
	});

	const searchRef = useRef<HTMLInputElement>(null);
	const pageLimit = 10;

	const getPageRange = (page?: number) => {
		const from = page ? page * pageLimit : 0;
		const to = page ? from + (pageLimit - 1) : pageLimit - 1;

		return { from, to };
	};

	const markSingleApplied = async (job: Job, apply: boolean) => {
		if ((job.applied && !apply) || (!job.applied && apply)) {
			const { data, error } = await supabase
				.from('jobs')
				.update({ applied: apply ? true : false })
				.eq('id', job.id)
				.select();
			if (data) {
				fetchJobs(currentPageNum);
				setAlertDialog(apply ? 'Job marked applied' : 'Job marked active');
			}
			if (error) {
				console.log(error);
			}
		} else {
			if (job.applied && apply) {
				setAlertErrorDialog('Job already applied');
			} else setAlertErrorDialog('Job already active');
		}
	};
	const markSelectedJobsApplied = async (apply: boolean) => {
		const { error } = await supabase
			.from('jobs')
			.update({ applied: apply ? true : false })
			.in(
				'id',
				selectedJobs.map((job) => job.id)
			);
		if (!error) {
			fetchJobs(currentPageNum);
			setAlertDialog(
				apply ? 'Jobs marked as applied' : 'Jobs marked as active'
			);
		} else console.log(error);
	};

	const deleteSingle = async (job: Job) => {
		const { error } = await supabase.from('jobs').delete().eq('id', job.id);
		if (!error) {
			fetchJobs(currentPageNum);
			setAlertDialog('Job deleted');
		} else console.log(error);
	};

	const deleteSelected = async () => {
		const { error } = await supabase
			.from('jobs')
			.delete()
			.in(
				'id',
				selectedJobs.map((job) => job.id)
			);
		if (!error) {
			fetchJobs(currentPageNum);
			setAlertDialog('Jobs deleted');
		} else console.log(error);
	};

	const buildQuery = (baseQuery: Query) => {
		// Apply sorting
		if (sortedBy === 'active') {
			baseQuery = baseQuery.eq('applied', false);
		} else if (sortedBy === 'applied') {
			baseQuery = baseQuery.eq('applied', true);
		}

		// Apply filtering
		if (filteredBy.includes('local') && !filteredBy.includes('remote')) {
			baseQuery = baseQuery.eq('is_local', true);
		} else if (filteredBy.includes('remote') && !filteredBy.includes('local')) {
			baseQuery = baseQuery.eq('is_local', false);
		}

		// Apply search query
		if (searchQuery) {
			baseQuery = baseQuery.or(
				`title.ilike.%${searchQuery}%, company.ilike.%${searchQuery}%, location.ilike.%${searchQuery}%`
			);
		}

		if (filteredBy.includes('date')) {
			baseQuery = baseQuery.order('created_at', { ascending: false });
		}

		return baseQuery;
	};

	const fetchUser = async () => {
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return redirect('/sign-in');
		}
	};

	const getNumPages = async () => {
		const baseQuery = supabase.from('jobs').select('*');
		const query = buildQuery(baseQuery);

		let { data: jobs, error } = await query;
		if (jobs) {
			setNumJobs(jobs.length);
			setNumPages(jobs.length / pageLimit);
		}
		if (error) {
			console.log(error);
		}
	};

	const fetchJobs = async (pageNum?: number) => {
		getNumPages();
		const { from, to } = getPageRange(pageNum);
		if (from && to) {
			setCurrentJobRange({
				from: from + 1,
				to: to + 1,
			});
		} else {
			setCurrentJobRange({
				from: 1,
				to: 10,
			});
		}

		const baseQuery = supabase.from('jobs').select('*').range(from, to);
		const query = buildQuery(baseQuery);

		let { data: jobs, error } = await query;
		if (jobs) {
			setCurrentJobs(jobs);
		}
		if (error) {
			console.log(error);
		}
	};

	const formatDate = (dateString: string): string => {
		const date = new Date(dateString);

		const day = date.getUTCDate();
		const month = date.getUTCMonth() + 1;
		const year = date.getUTCFullYear();

		return `${month}-${day}-${year}`;
	};

	const setPages = () => {
		const pages = [];
		for (let i = 0; i < numPages; i++) {
			pages.push(
				currentPageNum === i ? (
					<PaginationItem key={i}>
						<PaginationLink
							isActive
							className='cursor-pointer'
							onClick={() => {
								setCurrentPageNum(i);
							}}
						>
							{i + 1}
						</PaginationLink>
					</PaginationItem>
				) : (
					<PaginationItem key={i}>
						<PaginationLink
							className='cursor-pointer'
							onClick={() => {
								setCurrentPageNum(i);
							}}
						>
							{i + 1}
						</PaginationLink>
					</PaginationItem>
				)
			);
		}
		setPageNumbers(pages);
	};

	useEffect(() => {
		fetchUser();
	}, []);

	useEffect(() => {
		setPages();
	}, [numPages, currentPageNum]);

	useEffect(() => {
		fetchJobs(currentPageNum);
	}, [sortedBy, filteredBy, searchQuery, currentPageNum]);

	useEffect(() => {
		setSelectedJobs([]);
	}, [currentJobs]);

	useEffect(() => {
		setTimeout(() => {
			alertDialog ? setAlertDialog(null) : setAlertErrorDialog(null);
		}, 3000);
	}, [alertDialog, alertErrorDialog]);

	// Reset active page button to 1 when filtering or sorting applied
	useEffect(() => {
		setCurrentPageNum(0);
	}, [sortedBy, filteredBy]);

	return (
		<div className='flex min-h-screen w-full flex-col bg-muted/40'>
			<div className='flex flex-col sm:gap-4 sm:py-4'>
				<main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0'>
					<div className='flex items-center gap-2'>
						<ToggleGroup
							type='single'
							variant='outline'
						>
							<ToggleGroupItem
								value='active'
								onClick={() => {
									sortedBy === 'active'
										? setSortedBy('all')
										: setSortedBy('active');
								}}
							>
								Active
							</ToggleGroupItem>
							<ToggleGroupItem
								value='applied'
								onClick={() => {
									sortedBy === 'applied'
										? setSortedBy('all')
										: setSortedBy('applied');
								}}
							>
								Applied
							</ToggleGroupItem>
						</ToggleGroup>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant='outline'
									size='sm'
									className='h-8 gap-1'
								>
									<ListFilter className='h-3.5 w-3.5' />
									<span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>
										Filter
									</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end'>
								<DropdownMenuLabel>Filter by</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuCheckboxItem
									className='cursor-pointer'
									checked={filteredBy.includes('date') ? true : false}
									onClick={() => {
										setFilteredBy((prev) =>
											prev.includes('date')
												? prev.filter((filter) => filter !== 'date')
												: [...prev, 'date']
										);
									}}
								>
									Date
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem
									className='cursor-pointer'
									checked={filteredBy.includes('local') ? true : false}
									onClick={() => {
										setFilteredBy((prev) =>
											prev.includes('local')
												? prev.filter((filter) => filter !== 'local')
												: [...prev, 'local']
										);
									}}
								>
									Local
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem
									className='cursor-pointer'
									checked={filteredBy.includes('remote') ? true : false}
									onClick={() => {
										setFilteredBy((prev) =>
											prev.includes('remote')
												? prev.filter((filter) => filter !== 'remote')
												: [...prev, 'remote']
										);
									}}
								>
									Remote
								</DropdownMenuCheckboxItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<div className='relative ml-auto flex md:grow-0'>
							<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
							<Input
								type='search'
								placeholder='Search...'
								className='w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]'
								ref={searchRef}
								onChange={() => {
									SetSearchQuery(searchRef.current?.value || '');
								}}
							/>
						</div>
					</div>
					{alertDialog ? (
						<Alert className='border-green-600 bg-muted/10'>
							<CheckCheck className='h-4 w-4 stroke-green-600' />
							<AlertTitle className='text-green-600'>Done</AlertTitle>
							<AlertDescription className='text-green-600'>
								{alertDialog}
							</AlertDescription>
						</Alert>
					) : (
						''
					)}
					{alertErrorDialog ? (
						<Alert variant='destructive'>
							<AlertCircle className='h-4 w-4' />
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>{alertErrorDialog}</AlertDescription>
						</Alert>
					) : (
						''
					)}
					{selectedJobs.length > 0 ? (
						<div className='flex gap-1'>
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
											This action cannot be undone. This will permanently delete
											the selected jobs.
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
					) : (
						''
					)}
					<div>
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
											<TableHead className='hidden md:table-cell'>
												Company
											</TableHead>
											<TableHead className='hidden md:table-cell'>
												Location
											</TableHead>
											<TableHead className='hidden md:table-cell'>
												Created at
											</TableHead>
											<TableHead className='hidden md:table-cell'>
												Updated at
											</TableHead>
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
																					(selectedJob) =>
																						selectedJob.id !== job.id
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
					</div>
					<Pagination>
						<PaginationContent className='max-w-screen flex flex-wrap'>
							<PaginationItem>
								<PaginationPrevious
									className='cursor-pointer'
									onClick={() => {
										if (currentPageNum > 0) {
											setCurrentPageNum((prev) => prev - 1);
										}
									}}
								/>
							</PaginationItem>
							{pageNumbers}
							<PaginationItem>
								<PaginationNext
									className='cursor-pointer'
									onClick={() => {
										if (currentPageNum < numPages - 1) {
											setCurrentPageNum((prev) => prev + 1);
										}
									}}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</main>
			</div>
		</div>
	);
}
