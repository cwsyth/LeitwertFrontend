   import { Marker } from 'react-map-gl/maplibre';
import React from 'react';

interface PieChartMarkerProps {
    longitude: number;
    latitude: number;
    online: number;
    degraded: number;
    down: number;
    unknown: number;
    total: number;
    onClick?: () => void;
}

const STATUS_COLORS = {
    online: '#22c55e',    // green
    degraded: '#eab308',  // yellow
    down: '#ef4444',      // red
    unknown: '#6b7280',   // grey
};

export default function PieChartMarker({
    longitude,
    latitude,
    online,
    degraded,
    down,
    unknown,
    total,
    onClick
}: PieChartMarkerProps) {
    // Calculate size based on total count
    const size = Math.min(20 + Math.sqrt(total) * 3, 60);
    const radius = size / 2;
    const center = size / 2;

    // Calculate pie segments
    const segments = [
        { count: online, color: STATUS_COLORS.online },
        { count: degraded, color: STATUS_COLORS.degraded },
        { count: down, color: STATUS_COLORS.down },
        { count: unknown, color: STATUS_COLORS.unknown },
    ].filter(s => s.count > 0);

    // Generate pie chart path
    const generatePieSegments = () => {
        if (total === 0) return null;

        let currentAngle = -90; // Start from top
        const paths: React.ReactNode[] = [];

        segments.forEach((segment, index) => {
            const percentage = segment.count / total;
            const angle = percentage * 360;

            if (percentage === 1) {
                // Full circle
                paths.push(
                    <circle
                        key={index}
                        cx={center}
                        cy={center}
                        r={radius - 1}
                        fill={segment.color}
                    />
                );
            } else {
                const startAngle = currentAngle;
                const endAngle = currentAngle + angle;

                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;

                const x1 = center + (radius - 1) * Math.cos(startRad);
                const y1 = center + (radius - 1) * Math.sin(startRad);
                const x2 = center + (radius - 1) * Math.cos(endRad);
                const y2 = center + (radius - 1) * Math.sin(endRad);

                const largeArcFlag = angle > 180 ? 1 : 0;

                const pathData = [
                    `M ${center} ${center}`,
                    `L ${x1} ${y1}`,
                    `A ${radius - 1} ${radius - 1} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    'Z'
                ].join(' ');

                paths.push(
                    <path
                        key={index}
                        d={pathData}
                        fill={segment.color}
                    />
                );

                currentAngle = endAngle;
            }
        });

        return paths;
    };

    return (
        <Marker
            longitude={longitude}
            latitude={latitude}
            anchor="center"
            onClick={onClick}
        >
            <div
                className="cursor-pointer transition-transform hover:scale-110"
                style={{ width: size, height: size }}
            >
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    {/* Background circle */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="white"
                        stroke="#374151"
                        strokeWidth="1"
                    />
                    {/* Pie segments */}
                    {generatePieSegments()}
                    {/* Center circle with count */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius * 0.5}
                        fill="white"
                        stroke="#e5e7eb"
                        strokeWidth="1"
                    />
                    <text
                        x={center}
                        y={center}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={size * 0.25}
                        fontWeight="bold"
                        fill="#374151"
                    >
                        {total}
                    </text>
                </svg>
            </div>
        </Marker>
    );
}
