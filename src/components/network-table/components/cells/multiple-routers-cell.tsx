/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip"
import type {Router} from "@/types/dashboard"
import {RouterDetailTooltip} from "./router-detail-tooltip"
import {getStatusColor} from "@/lib/statusColors"

interface MultipleRoutersCellProps {
    routers: Router[]
    onRouterClick: (router: null | Router) => void
    selectedRouter: Router | null
}

export function MultipleRoutersCell({
                                        routers,
                                        onRouterClick,
                                        selectedRouter
                                    }: MultipleRoutersCellProps) {
    const isFirstSelected = selectedRouter?.router_id === routers[0].router_id

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className='cursor-pointer'>
                    <div className='flex items-center gap-1.5'>
                        <div
                            className='h-2 w-2 rounded-full flex-shrink-0'
                            style={{backgroundColor: getStatusColor(routers[0].status)}}
                        />
                        <code
                            className={`rounded px-1.5 py-0.5 font-mono text-xs ${
                                isFirstSelected
                                    ? 'bg-black text-white'
                                    : 'bg-muted'
                            }`}
                        >
                            {routers[0].router_id}
                        </code>
                    </div>
                    <div className='text-muted-foreground text-xs mt-0.5 ml-3.5'>
                        +{routers.length - 1} more
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent
                side='left'
                align='start'
                className='max-w-xs border border-muted bg-white p-3 text-black shadow-lg'
            >
                <div className='flex flex-col'>
                    <p className='mb-2 text-xs font-semibold text-black'>
                        Routers ({routers.length})
                    </p>
                    <div className='max-h-[200px] space-y-1.5 overflow-y-auto pr-2'>
                        {routers.map((router, index) => {
                            const isSelected = selectedRouter?.router_id === router.router_id

                            return (
                                <TooltipProvider key={index}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className='flex items-center gap-1.5'>
                                                <div
                                                    className='h-2 w-2 rounded-full flex-shrink-0'
                                                    style={{backgroundColor: getStatusColor(router.status)}}
                                                />
                                                <code
                                                    className={`block cursor-pointer select-text rounded px-2 py-1 font-mono text-xs hover:bg-gray-200 flex-1 ${
                                                        isSelected
                                                            ? 'bg-black text-white'
                                                            : 'bg-gray-100 text-black'
                                                    }`}
                                                    onClick={() => onRouterClick(isSelected ? null : router)}
                                                >
                                                    {router.router_id}
                                                </code>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent
                                            side='left'
                                            className='max-w-xs border border-muted bg-white p-3 text-black shadow-lg'
                                        >
                                            <RouterDetailTooltip router={router}/>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )
                        })}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
