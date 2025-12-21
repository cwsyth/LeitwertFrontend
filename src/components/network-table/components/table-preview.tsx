/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {Skeleton} from '@/components/ui/skeleton'
import type {ColumnDef} from '@tanstack/react-table'
import type {NetworkDetail} from '@/types/network'

interface TablePreviewProps {
    columns: ColumnDef<NetworkDetail>[]
}

export function TablePreview({columns}: TablePreviewProps) {
    return (
        <div className='h-full rounded-lg border bg-card p-6 shadow-sm'>
            <h2 className='mb-4 text-xl font-semibold'>AS Overview</h2>
            <div className='w-full space-y-4'>
                <div className='relative rounded-md border bg-white'>
                    <div className='opacity-50'>
                        <Table className='blur-sm'>
                            <TableHeader>
                                <TableRow className='bg-muted/50'>
                                    {columns.map(column => (
                                        <TableHead key={column.id}
                                                   className='h-10'>
                                            <div
                                                className='flex items-center gap-2'>
                                                <Skeleton
                                                    className='h-4 w-4 rounded'/>
                                                <Skeleton className='h-4 w-24'/>
                                            </div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.from({length: 5}).map((_, i) => (
                                    <TableRow key={i}>
                                        {columns.map((column, colIndex) => (
                                            <TableCell key={`${i}-${colIndex}`}>
                                                <Skeleton className='h-4 w-16'/>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div
                        className='absolute inset-0 flex items-center justify-center'>
                        <div
                            className='rounded-lg bg-white/95 px-4 py-3 shadow-lg border'>
                            <p className='text-foreground text-sm font-medium'>Please select a country!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
