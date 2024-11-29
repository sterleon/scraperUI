import { ListFilter, Search } from 'lucide-react';
import { Button } from './button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from './dropdown-menu';
import { ToggleGroup, ToggleGroupItem } from './toggle-group';
import { Input } from './input';
import { Dispatch, RefObject, SetStateAction } from 'react';
import { FilterType, SortType } from '@/app/types';

interface Props {
	sortedBy: SortType;
	setSortedBy: Dispatch<SetStateAction<SortType>>;
	filteredBy: FilterType[];
	setFilteredBy: Dispatch<SetStateAction<FilterType[]>>;
	searchRef: RefObject<HTMLInputElement | null>;
	setSearchQuery: Dispatch<SetStateAction<string>>;
}

const Filtering = ({
	sortedBy,
	setSortedBy,
	filteredBy,
	setFilteredBy,
	searchRef,
	setSearchQuery,
}: Props) => {
	return (
		<div className='flex items-center gap-2'>
			<ToggleGroup
				type='single'
				variant='outline'
			>
				<ToggleGroupItem
					value='active'
					onClick={() => {
						sortedBy === 'active' ? setSortedBy('all') : setSortedBy('active');
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
						setSearchQuery(searchRef.current?.value || '');
					}}
				/>
			</div>
		</div>
	);
};

export default Filtering;
