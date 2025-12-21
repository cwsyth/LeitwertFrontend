/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"

interface TablePaginationProps {
    currentPage: number
    totalPages: number
    totalEntries: number
    itemsPerPage: number
    onPageChange: (page: number) => void
    onItemsPerPageChange: (value: number) => void
}

export function TablePagination({
                                    currentPage,
                                    totalPages,
                                    totalEntries,
                                    itemsPerPage,
                                    onPageChange,
                                    onItemsPerPageChange
                                }: TablePaginationProps) {

    // Generate page numbers with ellipsis
    const getPageNumbers = (): (number | 'ellipsis')[] => {
        const pages: (number | 'ellipsis')[] = []
        const maxVisible = 5

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i)
                pages.push('ellipsis')
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1)
                pages.push('ellipsis')
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
            } else {
                pages.push(1)
                pages.push('ellipsis')
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
                pages.push('ellipsis')
                pages.push(totalPages)
            }
        }

        return pages
    }

    return (
        <div className='flex items-center justify-between'>
            <p className='text-muted-foreground whitespace-nowrap text-sm'>
                Entries {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalEntries)} ({totalEntries})
            </p>

            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>

                    {getPageNumbers().map((page, index) => (
                        <PaginationItem key={index}>
                            {page === 'ellipsis' ? (
                                <PaginationEllipsis/>
                            ) : (
                                <PaginationLink
                                    onClick={() => onPageChange(page)}
                                    isActive={currentPage === page}
                                    className='cursor-pointer'
                                >
                                    {page}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}

                    <PaginationItem>
                        <PaginationNext
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>

            <div className='flex items-center gap-2'>
                <span
                    className='text-muted-foreground whitespace-nowrap text-sm'>Anzahl pro Seite:</span>
                <Select
                    value={String(itemsPerPage)}
                    onValueChange={(value) => onItemsPerPageChange(Number(value))}
                >
                    <SelectTrigger className='h-8 w-[80px]'>
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='10'>10</SelectItem>
                        <SelectItem value='25'>25</SelectItem>
                        <SelectItem value='50'>50</SelectItem>
                        <SelectItem value='100'>100</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
