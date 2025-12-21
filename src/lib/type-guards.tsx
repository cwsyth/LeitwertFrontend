/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import {
    OthersMetadata,
    TreeMapDataItem,
    TreeMapOthersData
} from "@/types/network";

export function isOthersData(
    item: TreeMapDataItem | TreeMapOthersData
): item is TreeMapDataItem & { metadata: OthersMetadata } {
    return ('metadata' in item &&
        item.metadata !== undefined &&
        'isOthers' in item.metadata && item.metadata.isOthers);
}
