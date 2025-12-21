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

interface MultipleRoutersCellProps {
    routers: Router[]
    onRouterClick: (router: Router) => void
}

export function MultipleRoutersCell({
                                        routers,
                                        onRouterClick
                                    }: MultipleRoutersCellProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className='cursor-pointer'>
                    <code
                        className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs'>
                        {routers[0].router_id}
                    </code>
                    <div className='text-muted-foreground text-xs mt-0.5'>
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
                    <div
                        className='max-h-[200px] space-y-1.5 overflow-y-auto pr-2'>
                        {routers.map((router, index) => (
                            <TooltipProvider key={index}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <code
                                            className='block cursor-pointer select-text rounded bg-gray-100 px-2 py-1 font-mono text-xs text-black hover:bg-gray-200'
                                            onClick={() => onRouterClick(router)}
                                        >
                                            {router.router_id}
                                        </code>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side='left'
                                        className='max-w-xs border border-muted bg-white p-3 text-black shadow-lg'
                                    >
                                        <RouterDetailTooltip router={router}/>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
