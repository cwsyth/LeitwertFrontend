/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import type {Router} from '@/types/dashboard'

interface RouterDetailTooltipProps {
    router: Router
}

export function RouterDetailTooltip({router}: RouterDetailTooltipProps) {
    return (
        <div className='flex flex-col gap-2'>
            <div>
                <p className='text-xs font-semibold text-gray-500'>Router ID</p>
                <code className='text-xs font-mono'>{router.router_id}</code>
            </div>
            <div>
                <p className='text-xs font-semibold text-gray-500'>IP address</p>
                <code className='text-xs font-mono'>{router.ip}</code>
            </div>
            <div>
                <p className='text-xs font-semibold text-gray-500'>Geohash</p>
                <code className='text-xs font-mono'>{router.geohash}</code>
            </div>
            <div>
                <p className='text-xs font-semibold text-gray-500'>Location</p>
                <p className='text-xs'>{router.location.city}, {router.location.region}</p>
                <p className='text-xs text-gray-600'>Lat: {router.location.lat},
                    Lon: {router.location.lon}</p>
            </div>
            <div>
                <p className='text-xs font-semibold text-gray-500'>ISP</p>
                <p className='text-xs'>{router.location.isp}</p>
            </div>
            <div>
                <p className='text-xs font-semibold text-gray-500'>Status</p>
                <span className='text-xs font-medium'>{router.status}</span>
            </div>
        </div>
    )
}
