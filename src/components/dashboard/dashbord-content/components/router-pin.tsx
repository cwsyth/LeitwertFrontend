import React from 'react';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card';
import RouterInfos
    from "@/components/dashboard/dashbord-content/components/router-infos";
import { MapPin } from "lucide-react";

export default function RouterPin({ routerId }: { routerId: string }) {
    return (
        <HoverCard openDelay={100}>
            <HoverCardTrigger asChild>
                <MapPin
                    className="w-8 h-8 text-red-500 fill-red-500 drop-shadow-lg animate-pulse cursor-pointer"/>
            </HoverCardTrigger>
            <HoverCardContent className="w-auto p-4">
                <RouterInfos routerId={ routerId }/>
            </HoverCardContent>
        </HoverCard>
    );
}
