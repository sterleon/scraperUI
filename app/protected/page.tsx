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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';

export interface Job {
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

export default function Dashboard() {
	const supabase = createClient();
	const [jobs, setJobs] = useState<Job[]>([]);

	useEffect(() => {
		const fetchUserAndJobs = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				return redirect('/sign-in');
			}
			let { data: jobs, error } = await supabase.from('jobs').select('*');
			if (jobs) {
				setJobs(jobs);
			} else if (error) {
				console.log(error);
			}
		};
		fetchUserAndJobs();
	}, []);

	return (
		<div className='flex min-h-screen w-full flex-col bg-muted/40'>
			<div className='flex flex-col sm:gap-4 sm:py-4'>
				<main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8'>
					<Tabs defaultValue='all'>
						<div className='flex items-center gap-2'>
							<TabsList>
								<TabsTrigger value='all'>All</TabsTrigger>
								<TabsTrigger value='active'>Active</TabsTrigger>
								<TabsTrigger value='applied'>Applied</TabsTrigger>
								<TabsTrigger value='applied'>Favorites</TabsTrigger>
							</TabsList>
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
						<TabsContent value='all'>
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
											{jobs.map((job) => {
												return (
													<TableRow>
														<TableCell className='font-medium'>
															{job.title}
														</TableCell>
														<TableCell>
															<Badge variant='outline'>
																{job.applied ? 'Applied' : 'Active'}
															</Badge>
														</TableCell>
														<TableCell className='hidden md:table-cell'>
															{job.company}
														</TableCell>
														<TableCell className='hidden md:table-cell'>
															{job.location}
														</TableCell>
														<TableCell className='hidden md:table-cell'>
															{job.created_at}
														</TableCell>
														<TableCell className='hidden md:table-cell'>
															{job.updated_at}
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
																	<DropdownMenuItem>Favorite</DropdownMenuItem>
																	<DropdownMenuItem>Delete</DropdownMenuItem>
																</DropdownMenuContent>
															</DropdownMenu>
														</TableCell>
													</TableRow>
												);
											})}
											{/* <TableRow>
												<TableCell className='hidden md:table-cell'>
													$499.99
												</TableCell>
												<TableCell className='hidden md:table-cell'>
													25
												</TableCell>
												<TableCell className='hidden md:table-cell'>
													2023-07-12 10:42 AM
												</TableCell>
												<TableCell className='hidden md:table-cell'>
													2023-07-12 10:42 AM
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
															<DropdownMenuItem>Favorite</DropdownMenuItem>
															<DropdownMenuItem>Delete</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</TableCell>
											</TableRow> */}
										</TableBody>
									</Table>
								</CardContent>
								<CardFooter>
									<div className='text-xs text-muted-foreground'>
										Showing <strong>1-10</strong> of <strong>32</strong>{' '}
										products
									</div>
								</CardFooter>
							</Card>
						</TabsContent>
					</Tabs>
				</main>
			</div>
		</div>
	);
}
