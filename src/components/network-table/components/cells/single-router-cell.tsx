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
import type {Router} from "@/types/dashboard"
import {RouterDetailTooltip} from "./router-detail-tooltip"

interface SingleRouterCellProps {
    router: Router
    onRouterClick: (router: Router) => void
}

export function SingleRouterCell({
                                     router,
                                     onRouterClick
                                 }: SingleRouterCellProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <code
                        className='cursor-pointer rounded bg-muted px-1.5 py-0.5 font-mono text-xs'
                        onClick={() => onRouterClick(router)}
                    >
                        {router.router_id}
                    </code>
                </TooltipTrigger>
                <TooltipContent
                    side='left'
                    align='start'
                    className='max-w-xs border border-muted bg-white p-3 text-black shadow-lg'
                >
                    <RouterDetailTooltip router={router}/>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
