'use client';
import { createClient } from '@/utils/supabase/client';
import { redirect } from 'next/navigation';
import { ListFilter, MoreHorizontal, Search } from 'lucide-react';
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
import { JSX, useEffect, useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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

type SortType = 'all' | 'active' | 'applied';

export default function Dashboard() {
	const supabase = createClient();
	const [currentJobsPage, setCurrentJobsPage] = useState<Job[]>([]);
	const [currentPageNum, setCurrentPageNum] = useState<number>(0);
	const [numPages, setNumPages] = useState<number>(0);
	const [pageNumbers, setPageNumbers] = useState<JSX.Element[]>();
	const [sortedBy, setSortedBy] = useState<SortType>('all');
	const pageLimit = 10;

	const getPageRange = (page?: number) => {
		const from = page ? page * pageLimit : 0;
		const to = page ? from + (pageLimit - 1) : pageLimit - 1;

		return { from, to };
	};

	const markApplied = async (id: string) => {
		const { data, error } = await supabase
			.from('jobs')
			.update({ applied: true })
			.eq('id', id)
			.select();
		if (data) {
			fetchJobs(currentPageNum);
		}
		if (error) {
			console.log(error);
		}
	};

	const fetchUser = async () => {
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return redirect('/sign-in');
		}
	};

	const fetchJobs = async (pageNum?: number) => {
		const { from, to } = getPageRange(pageNum);

		if (sortedBy === 'all') {
			let { data: jobs, error } = await supabase
				.from('jobs')
				.select('*')
				.range(from, to);
			if (jobs) {
				setCurrentJobsPage(jobs);
			}
			if (error) {
				console.log(error);
			}
		} else if (sortedBy === 'active') {
			let { data: jobs, error } = await supabase
				.from('jobs')
				.select('*')
				.eq('applied', false)
				.range(from, to);
			if (jobs) {
				setCurrentJobsPage(jobs);
			}
			if (error) {
				console.log(error);
			}
		} else if (sortedBy === 'applied') {
			let { data: jobs, error } = await supabase
				.from('jobs')
				.select('*')
				.eq('applied', true)
				.range(from, to);
			if (jobs) {
				setCurrentJobsPage(jobs);
			}
			if (error) {
				console.log(error);
			}
		}
	};

	const getNumPages = async () => {
		if (sortedBy === 'all') {
			let { data: jobs, error } = await supabase.from('jobs').select('*');
			if (jobs) {
				setNumPages(jobs.length / pageLimit);
			}
			if (error) {
				console.log(error);
			}
		} else if (sortedBy === 'active') {
			let { data: jobs, error } = await supabase
				.from('jobs')
				.select('*')
				.eq('applied', false);
			if (jobs) {
				setNumPages(jobs.length / pageLimit);
			}
			if (error) {
				console.log(error);
			}
		} else if (sortedBy === 'applied') {
			let { data: jobs, error } = await supabase
				.from('jobs')
				.select('*')
				.eq('applied', true);
			if (jobs) {
				setNumPages(jobs.length / pageLimit);
			}
			if (error) {
				console.log(error);
			}
		}
	};
	const formatDate = (dateString: string): string => {
		const date = new Date(dateString);

		const day = date.getUTCDate();
		const month = date.getUTCMonth() + 1;
		const year = date.getUTCFullYear();

		return `${month}-${day}-${year}`;
	};

	useEffect(() => {
		fetchUser();
		getNumPages();
		fetchJobs();
	}, []);

	useEffect(() => {
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
								fetchJobs(i);
							}}
						>
							{i}
						</PaginationLink>
					</PaginationItem>
				) : (
					<PaginationItem key={i}>
						<PaginationLink
							className='cursor-pointer'
							onClick={() => {
								setCurrentPageNum(i);
								fetchJobs(i);
							}}
						>
							{i}
						</PaginationLink>
					</PaginationItem>
				)
			);
		}
		setPageNumbers(pages);
	}, [numPages, currentPageNum]);

	// Run this useEffect when the Applied or Active filters are toggled
	useEffect(() => {
		getNumPages();
		fetchJobs();
	}, [sortedBy]);

	return (
		<div className='flex min-h-screen w-full flex-col bg-muted/40'>
			<div className='flex flex-col sm:gap-4 sm:py-4'>
				<main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8'>
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
								<DropdownMenuCheckboxItem checked>
									Date
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem>Location</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem>Archived</DropdownMenuCheckboxItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<div className='relative ml-auto flex md:grow-0'>
							<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
							<Input
								type='search'
								placeholder='Search...'
								className='w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]'
							/>
						</div>
					</div>
					<div>
						<Card x-chunk='dashboard-06-chunk-0'>
							<CardHeader>
								<CardTitle>Job Listings</CardTitle>
								<CardDescription>Manage your listings</CardDescription>
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
										{currentJobsPage.map((job) => {
											return (
												<TableRow key={job.id}>
													<TableCell className='font-medium'>
														{job.title}
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
															<Badge variant='outline'>Active</Badge>
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
																	onClick={() => markApplied(job.id)}
																>
																	Mark Applied
																</DropdownMenuItem>
																<DropdownMenuItem>Favorite</DropdownMenuItem>
																<DropdownMenuItem>Delete</DropdownMenuItem>
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
									Showing <strong>1-10</strong> of <strong>32</strong> products
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
											fetchJobs(currentPageNum - 1);
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
											fetchJobs(currentPageNum + 1);
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
