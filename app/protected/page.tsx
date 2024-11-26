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
import { JSX, useEffect, useRef, useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { Checkbox } from '@/components/ui/checkbox';

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
	const [currentJobsPage, setCurrentJobsPage] = useState<Job[]>([]);
	const [currentPageNum, setCurrentPageNum] = useState<number>(0);
	const [numPages, setNumPages] = useState<number>(0);
	const [pageNumbers, setPageNumbers] = useState<JSX.Element[]>();
	const [sortedBy, setSortedBy] = useState<SortType>('all');
	const [filteredBy, setFilteredBy] = useState<FilterType[]>([]);
	const [searchQuery, SetSearchQuery] = useState<string>('');
	const [selected, setSelected] = useState<string[]>([]);
	const [boxesChecked, setBoxesChecked] = useState<boolean>(true);

	const searchRef = useRef<HTMLInputElement>(null);
	const pageLimit = 10;

	const getPageRange = (page?: number) => {
		const from = page ? page * pageLimit : 0;
		const to = page ? from + (pageLimit - 1) : pageLimit - 1;

		return { from, to };
	};

	const markSingleApplied = async (id: string) => {
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

	const markSelectedApplied = async () => {
		const { error } = await supabase
			.from('jobs')
			.update({ applied: true })
			.in('id', selected);
		if (!error) {
			fetchJobs(currentPageNum);
			setSelected([]);
		} else console.log(error);
	};

	const deleteSingle = async (id: string) => {
		const { error } = await supabase.from('jobs').delete().eq('id', id);
		if (!error) {
			fetchJobs(currentPageNum);
		} else console.log(error);
	};

	const deleteSelected = async () => {
		const { error } = await supabase.from('jobs').delete().in('id', selected);
		if (!error) {
			fetchJobs(currentPageNum);
			setSelected([]);
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
			setNumPages(jobs.length / pageLimit);
		}
		if (error) {
			console.log(error);
		}
	};

	const fetchJobs = async (pageNum?: number) => {
		const { from, to } = getPageRange(pageNum);
		getNumPages();

		const baseQuery = supabase.from('jobs').select('*').range(from, to);
		const query = buildQuery(baseQuery);

		let { data: jobs, error } = await query;
		if (jobs) {
			setCurrentJobsPage(jobs);
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
	};

	useEffect(() => {
		fetchUser();
	}, []);

	useEffect(() => {
		setPages();
	}, [numPages, currentPageNum]);

	useEffect(() => {
		fetchJobs();
	}, [sortedBy, filteredBy, searchQuery]);

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
									setSelected([]);
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
									setSelected([]);
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
										setSelected([]);
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
										setSelected([]);
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
										setSelected([]);
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
					{selected.length > 0 ? (
						<div className='flex gap-1'>
							<Button
								variant='outline'
								className='hover:bg-red-600'
								onClick={() => {
									deleteSelected();
								}}
							>
								Delete Selected
							</Button>
							<Button
								variant='outline'
								className='hover:bg-green-600'
								onClick={() => {
									markSelectedApplied();
								}}
							>
								Mark Applied
							</Button>
						</div>
					) : (
						''
					)}
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
													<TableCell>
														<div className='flex items-center gap-2'>
															<Checkbox
																onCheckedChange={(checked) => {
																	setSelected((prev) =>
																		checked
																			? [...prev, job.id]
																			: selected.filter((id) => id !== job.id)
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
																	onClick={() => markSingleApplied(job.id)}
																>
																	Mark Applied
																</DropdownMenuItem>
																<DropdownMenuItem
																	className='cursor-pointer'
																	onClick={() => deleteSingle(job.id)}
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
