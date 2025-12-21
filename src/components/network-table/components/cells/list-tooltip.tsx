/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip"

interface ListTooltipProps {
    items: string[]
    title: string
    emptyText?: string
}

export function ListTooltip({items, title, emptyText = '-'}: ListTooltipProps) {
    if (items.length === 0) {
        return <div className='text-muted-foreground'>{emptyText}</div>
    }

    if (items.length === 1) {
        return <code
            className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs'>{items[0]}</code>
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className='cursor-pointer'>
                        <code
                            className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs'>{items[0]}</code>
                        <div
                            className='text-muted-foreground text-xs mt-0.5'>+{items.length - 1} more
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent
                    side='left'
                    align='start'
                    className='max-w-xs border border-muted bg-white p-3 text-black shadow-lg'
                >
                    <div className='flex flex-col'>
                        <p className='mb-2 text-xs font-semibold text-black'>
                            {title} ({items.length})
                        </p>
                        <div
                            className='max-h-[200px] space-y-1.5 overflow-y-auto pr-2'>
                            {items.map((item, index) => (
                                <code
                                    key={index}
                                    className='block cursor-text select-text rounded bg-gray-100 px-2 py-1 font-mono text-xs text-black hover:bg-gray-200'
                                >
                                    {item}
                                </code>
                            ))}
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
