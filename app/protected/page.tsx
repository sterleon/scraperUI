'use client';
import { createClient } from '@/utils/supabase/client';
import { redirect } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AlertDialogueMsg, FilterType, Job, Query, SortType } from '../types';

import Filtering from '@/components/ui/Filtering';
import AlertPopup from '@/components/ui/AlertPopup';
import SelectedJobsControls from '@/components/ui/SelectedJobsControls';
import MainTable from '@/components/ui/MainTable';
import MainPagination from '@/components/ui/MainPagination';

const Dashboard = () => {
	const supabase = createClient();
	const [currentJobs, setCurrentJobs] = useState<Job[]>([]);
	const [currentPageNum, setCurrentPageNum] = useState<number>(0);
	const [numPages, setNumPages] = useState<number>(0);
	const [sortedBy, setSortedBy] = useState<SortType>('all');
	const [filteredBy, setFilteredBy] = useState<FilterType[]>([]);
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [selectedJobs, setSelectedJobs] = useState<Job[]>([]);
	const [alertDialogueMsg, setAlertDialogueMsg] = useState<AlertDialogueMsg>({
		type: '',
		msg: '',
	});
	const [numJobs, setNumJobs] = useState<number | null>(null);
	const [currentJobRange, setCurrentJobRange] = useState({
		from: 1,
		to: 10,
	});

	const searchRef = useRef<HTMLInputElement>(null);
	const pageLimit = 10;

	const getCurrentFormattedDate = () => {
		const now = new Date();
		const year = now.getUTCFullYear();
		const month = String(now.getUTCMonth() + 1).padStart(2, '0');
		const day = String(now.getUTCDate()).padStart(2, '0');
		const hours = String(now.getUTCHours()).padStart(2, '0');
		const minutes = String(now.getUTCMinutes()).padStart(2, '0');
		const seconds = String(now.getUTCSeconds()).padStart(2, '0');
		const milliseconds = String(now.getUTCMilliseconds()).padStart(3, '0');
		const microseconds = milliseconds + '000';

		return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${microseconds}+00:00`;
	};

	const getPageRange = (page?: number) => {
		const from = page ? page * pageLimit : 0;
		const to = page ? from + (pageLimit - 1) : pageLimit - 1;

		return { from, to };
	};

	const fetchUser = async () => {
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return redirect('/sign-in');
		}
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

	const markSelectedJobsApplied = async (apply: boolean) => {
		const numApplied = selectedJobs.filter((job) => job.applied);
		if (
			(numApplied.length == selectedJobs.length && !apply) ||
			(numApplied.length == 0 && apply)
		) {
			const { error } = await supabase
				.from('jobs')
				.update({
					applied: apply ? true : false,
					updated_at: getCurrentFormattedDate(),
				})
				.in(
					'id',
					selectedJobs.map((job) => job.id)
				);
			if (!error) {
				fetchJobs(currentPageNum);
				setAlertDialogueMsg(
					apply
						? {
								type: 'success',
								msg: 'Jobs marked as applied',
							}
						: {
								type: 'success',
								msg: 'Jobs marked as active',
							}
				);
			} else console.log(error);
		} else
			setAlertDialogueMsg(
				numApplied.length > 0 && apply
					? {
							type: 'error',
							msg: 'One or more selected already applied',
						}
					: {
							type: 'error',
							msg: 'One or more selected already active',
						}
			);
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
		} else console.log(error);
	};

	useEffect(() => {
		fetchUser();
	}, []);

	useEffect(() => {
		fetchJobs(currentPageNum);
	}, [sortedBy, filteredBy, searchQuery, currentPageNum]);

	useEffect(() => {
		setSelectedJobs([]);
	}, [currentJobs]);

	useEffect(() => {
		if (alertDialogueMsg.msg) {
			setTimeout(() => {
				setAlertDialogueMsg({
					type: '',
					msg: '',
				});
			}, 5000);
		}
	}, [alertDialogueMsg]);

	// Reset active page button to 1 when filtering or sorting applied
	useEffect(() => {
		setCurrentPageNum(0);
	}, [sortedBy, filteredBy]);

	return (
		<div className='flex flex-col min-h-screen bg-muted/40 sm:gap-4 sm:py-4'>
			<main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0'>
				<Filtering
					sortedBy={sortedBy}
					setSortedBy={setSortedBy}
					filteredBy={filteredBy}
					setFilteredBy={setFilteredBy}
					searchRef={searchRef}
					setSearchQuery={setSearchQuery}
				/>
				{alertDialogueMsg.type && (
					<AlertPopup alertDialogueMsg={alertDialogueMsg} />
				)}

				{selectedJobs.length > 0 && (
					<SelectedJobsControls
						deleteSelected={deleteSelected}
						markSelectedJobsApplied={markSelectedJobsApplied}
					/>
				)}
				<MainTable
					currentJobs={currentJobs}
					selectedJobs={selectedJobs}
					setSelectedJobs={setSelectedJobs}
					currentJobRange={currentJobRange}
					numJobs={numJobs}
					setAlertDialogueMsg={setAlertDialogueMsg}
					fetchJobs={fetchJobs}
					currentPageNum={currentPageNum}
					getCurrentFormattedDate={getCurrentFormattedDate}
				/>
				<MainPagination
					currentPageNum={currentPageNum}
					setCurrentPageNum={setCurrentPageNum}
					numPages={numPages}
				/>
			</main>
		</div>
	);
};

export default Dashboard;
