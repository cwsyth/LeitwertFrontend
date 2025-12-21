/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import type {CSSProperties} from 'react'
import type {Header} from '@tanstack/react-table'
import {flexRender} from '@tanstack/react-table'
import {useSortable} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'
import {ChevronUp, GripVertical} from 'lucide-react'

import {TableHead} from '@/components/ui/table'
import {Button} from '@/components/ui/button'
import type {NetworkDetail} from '@/types/network'

interface DraggableTableHeaderProps {
    header: Header<NetworkDetail, unknown>
}

export function DraggableTableHeader({header}: DraggableTableHeaderProps) {
    const {
        attributes,
        isDragging,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({
        id: header.column.id
    })

    const style: CSSProperties = {
        opacity: isDragging ? 0.8 : 1,
        position: 'relative',
        transform: CSS.Translate.toString(transform),
        transition,
        whiteSpace: 'nowrap',
        width: header.column.getSize(),
        zIndex: isDragging ? 1 : 0
    }

    return (
        <TableHead
            ref={setNodeRef}
            className='before:bg-border relative h-10 border-t before:absolute before:inset-y-0 before:left-0 before:w-px first:before:bg-transparent'
            style={style}
            aria-sort={
                header.column.getIsSorted() === 'asc'
                    ? 'ascending'
                    : header.column.getIsSorted() === 'desc'
                        ? 'descending'
                        : 'none'
            }
        >
            <div className='flex items-center justify-start gap-0.5'>
                <Button
                    size='icon'
                    variant='ghost'
                    className='-ml-2 size-7'
                    {...attributes}
                    {...listeners}
                    aria-label='Drag to reorder'
                >
                    <GripVertical className='opacity-60' aria-hidden='true'/>
                </Button>
                <span className='grow truncate'>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </span>
                {header.column.getCanSort() && (
                    <Button
                        size='icon'
                        variant='ghost'
                        className='group -mr-1 size-7'
                        onClick={header.column.getToggleSortingHandler()}
                        onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                header.column.getToggleSortingHandler()?.(e)
                            }
                        }}
                        aria-label='Toggle sorting'
                    >
                        <ChevronUp
                            className={`shrink-0 ${header.column.getIsSorted() ? 'opacity-60' : 'opacity-0 group-hover:opacity-60'}`}
                            size={16}
                            aria-hidden='true'
                        />
                    </Button>
                )}
            </div>
        </TableHead>
    )
}
