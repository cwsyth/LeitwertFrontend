/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import type {CSSProperties} from 'react'
import type {Cell} from '@tanstack/react-table'
import {flexRender} from '@tanstack/react-table'
import {useSortable} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'

import {TableCell} from '@/components/ui/table'
import type {NetworkDetail} from '@/types/network'

interface DragAlongCellProps {
    cell: Cell<NetworkDetail, unknown>
}

export function DragAlongCell({cell}: DragAlongCellProps) {
    const {isDragging, setNodeRef, transform, transition} = useSortable({
        id: cell.column.id
    })

    const style: CSSProperties = {
        opacity: isDragging ? 0.8 : 1,
        position: 'relative',
        transform: CSS.Translate.toString(transform),
        transition,
        width: cell.column.getSize(),
        zIndex: isDragging ? 1 : 0
    }

    return (
        <TableCell ref={setNodeRef} className='truncate' style={style}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
    )
}
