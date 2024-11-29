'use client';
import { Dispatch, JSX, SetStateAction, useEffect, useState } from 'react';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from './pagination';

interface Props {
	currentPageNum: number;
	setCurrentPageNum: Dispatch<SetStateAction<number>>;
	numPages: number;
}

const MainPagination = ({
	currentPageNum,
	setCurrentPageNum,
	numPages,
}: Props) => {
	const [pageNumbers, setPageNumbers] = useState<JSX.Element[]>();
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
		setPages();
	}, [numPages, currentPageNum]);
	return (
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
	);
};

export default MainPagination;
