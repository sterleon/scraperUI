'use client';
import { createClient } from '@/utils/supabase/client';
import { redirect } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FilterType, Job, Query, SortType } from '../types';

import Filtering from '@/components/ui/Filtering';
import AlertPopup from '@/components/ui/AlertPopup';
import AlertPopupError from '@/components/ui/AlertPopupError';
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
	const [alertDialogMsg, setAlertDialogMsg] = useState<string | null>(null);
	const [alertErrorDialogMsg, setAlertErrorDialogMsg] = useState<string | null>(
		null
	);
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
				.update({ applied: apply ? true : false })
				.in(
					'id',
					selectedJobs.map((job) => job.id)
				);
			if (!error) {
				fetchJobs(currentPageNum);
				setAlertDialogMsg(
					apply ? 'Jobs marked as applied' : 'Jobs marked as active'
				);
			} else console.log(error);
		} else {
			if (numApplied.length > 0 && apply) {
				setAlertErrorDialogMsg('One or more selected already applied');
			} else setAlertErrorDialogMsg('One or more selected already active');
		}
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
			setAlertDialogMsg('Jobs deleted');
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
		setTimeout(() => {
			alertDialogMsg ? setAlertDialogMsg(null) : setAlertErrorDialogMsg(null);
		}, 3000);
	}, [alertDialogMsg, alertErrorDialogMsg]);

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
				{alertDialogMsg ? <AlertPopup alertDialogMsg={alertDialogMsg} /> : ''}
				{alertErrorDialogMsg ? (
					<AlertPopupError alertErrorDialogMsg={alertErrorDialogMsg} />
				) : (
					''
				)}
				{selectedJobs.length > 0 ? (
					<SelectedJobsControls
						deleteSelected={deleteSelected}
						markSelectedJobsApplied={markSelectedJobsApplied}
					/>
				) : (
					''
				)}

				<MainTable
					currentJobs={currentJobs}
					selectedJobs={selectedJobs}
					setSelectedJobs={setSelectedJobs}
					currentJobRange={currentJobRange}
					numJobs={numJobs}
					setAlertDialogMsg={setAlertDialogMsg}
					setAlertErrorDialogMsg={setAlertErrorDialogMsg}
					fetchJobs={fetchJobs}
					currentPageNum={currentPageNum}
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
