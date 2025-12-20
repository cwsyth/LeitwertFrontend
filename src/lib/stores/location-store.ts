/*
 * IM_PRJ - Internet Analysis
 * Copyright (c) 2025 Leitwert GmbH. All rights reserved.
 * This work is licensed under the terms of the MIT license.
 * For a copy, see LICENSE.txt in the project root.
 */

import { create } from 'zustand';

interface LocationState {
    selectedLocationId: string | null;
    setSelectedLocationId: (id: string) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
    selectedLocationId: null,
    setSelectedLocationId: (id) => set({ selectedLocationId: id }),
}));
