import React from 'react';

interface SkeletonProps {
    className?: string;
    count?: number;
}

export function Skeleton({ className = '', count = 1 }: SkeletonProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={`animate-pulse bg-white/10 rounded-xl ${className}`}
                />
            ))}
        </>
    );
}

export function ProblemSkeleton() {
    return (
        <div className="glass-panel p-6 rounded-xl animate-pulse">
            <div className="flex justify-between items-center">
                <div className="space-y-3 w-full">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-3/4 max-w-sm rounded" />
                        <Skeleton className="h-4 w-16 rounded-full" />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-6 w-20 rounded-md" />
                        <Skeleton className="h-6 w-24 rounded-md" />
                        <Skeleton className="h-6 w-16 rounded-md" />
                    </div>
                </div>

                <div className="hidden sm:block">
                    <Skeleton className="h-10 w-24 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

export function SQLChapterSkeleton() {
    return (
        <div className="glass p-8 rounded-2xl border border-white/5 mb-6 animate-pulse">
            <div className="mb-6">
                <Skeleton className="h-8 w-1/3 rounded-lg" />
            </div>
            <div className="grid gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <div className="flex items-center gap-3 w-full">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-5 w-2/3 max-w-sm rounded" />
                        </div>
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-6 w-16 rounded" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function EmployeeProblemSkeleton() {
    return (
        <div className="glass-panel p-5 rounded-2xl border border-white/10 animate-pulse flex flex-col justify-between h-48">
            <div>
                <div className="flex justify-between items-start mb-3 gap-4">
                    <Skeleton className="h-6 w-full rounded" />
                    <Skeleton className="h-5 w-16 shrink-0 rounded" />
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                    <Skeleton className="h-4 w-12 rounded-full" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                    <Skeleton className="h-4 w-14 rounded-full" />
                </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                <Skeleton className="flex-1 h-8 rounded" />
                <Skeleton className="w-8 h-8 rounded shrink-0" />
            </div>
        </div>
    );
}

export function EmployeeChapterSkeleton() {
    return (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden animate-pulse mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="w-full">
                    <div className="flex items-center gap-2 mb-2">
                        <Skeleton className="h-5 w-8 rounded" />
                        <Skeleton className="h-6 w-1/3 rounded" />
                    </div>
                    <Skeleton className="h-4 w-2/3 rounded" />
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <Skeleton className="h-8 w-24 rounded-md" />
                    <Skeleton className="w-7 h-7 rounded" />
                    <Skeleton className="w-7 h-7 rounded" />
                </div>
            </div>
            <div className="bg-black/40 rounded-xl border border-white/5 overflow-hidden">
                <div className="divide-y divide-white/5">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4 w-full">
                                <Skeleton className="w-2 h-2 rounded-full" />
                                <Skeleton className="h-4 w-1/3 rounded" />
                            </div>
                            <div className="flex gap-3">
                                <Skeleton className="h-4 w-8 rounded" />
                                <Skeleton className="h-4 w-10 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function CompanySkeleton() {
    return (
        <div className="glass-panel p-6 rounded-xl relative overflow-hidden animate-pulse">
            <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 w-14 h-14">
                    <Skeleton className="w-full h-full rounded-md" />
                </div>
                <div className="p-2 rounded-full w-9 h-9">
                    <Skeleton className="w-full h-full rounded-full" />
                </div>
            </div>

            <div className="relative z-10">
                <Skeleton className="h-6 w-3/4 max-w-[200px] mb-2 rounded" />
                <div className="flex items-center justify-between text-sm">
                    <Skeleton className="h-4 w-1/2 rounded" />
                    <Skeleton className="h-5 w-8 rounded" />
                </div>
            </div>

            <div className="mt-6 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                {/* Empty bar skeleton */}
            </div>
        </div>
    );
}

// --- New skeletons for generic pages ---

export function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-[#0a0f1c] p-4 md:p-8 animate-pulse">
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Left Sidebar Skeleton */}
                <div className="xl:col-span-1 space-y-6">
                    {/* Profile Card */}
                    <div className="bg-[#111827] rounded-2xl border border-gray-800 p-6 flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                            <Skeleton className="w-16 h-16 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-6 w-24 rounded" />
                                <Skeleton className="h-4 w-16 rounded" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-800/50">
                                    <Skeleton className="h-4 w-24 rounded" />
                                    <Skeleton className="h-4 w-12 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Difficulty Breakdown */}
                    <div className="bg-[#111827] rounded-2xl border border-gray-800 p-6">
                        <Skeleton className="h-5 w-32 mb-4 rounded" />
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i}>
                                    <div className="flex justify-between mb-1">
                                        <Skeleton className="h-4 w-12 rounded" />
                                        <Skeleton className="h-4 w-8 rounded" />
                                    </div>
                                    <Skeleton className="h-1.5 w-full rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Skills/Radar */}
                    <div className="bg-[#111827] rounded-2xl border border-gray-800 p-6">
                        <Skeleton className="h-5 w-24 mb-4 rounded" />
                        <Skeleton className="h-48 w-full rounded-full" />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="xl:col-span-3 space-y-6">
                    {/* PoD Banner */}
                    <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6 h-40">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 h-full">
                            <div className="space-y-3 w-full">
                                <Skeleton className="h-5 w-32 rounded-full" />
                                <Skeleton className="h-8 w-2/3 max-w-[400px] rounded" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-4 w-16 rounded" />
                                    <Skeleton className="h-4 w-16 rounded" />
                                </div>
                            </div>
                            <Skeleton className="h-12 w-40 rounded-xl hidden md:block" />
                        </div>
                    </div>
                    {/* Heatmap Area */}
                    <div className="bg-[#111827] rounded-2xl border border-gray-800 p-6 h-64">
                        <div className="flex justify-between items-center mb-6">
                            <Skeleton className="h-5 w-48 rounded" />
                            <Skeleton className="h-4 w-32 rounded" />
                        </div>
                        <Skeleton className="h-32 w-full rounded" />
                    </div>
                    {/* Table Area */}
                    <div className="bg-[#111827] rounded-2xl border border-gray-800 p-6 h-64">
                        <Skeleton className="h-5 w-48 mb-6 rounded" />
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex justify-between">
                                    <Skeleton className="h-4 w-1/3 rounded" />
                                    <Skeleton className="h-4 w-20 rounded" />
                                    <Skeleton className="h-4 w-16 rounded hidden md:block" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function LeaderboardSkeleton() {
    return (
        <div className="min-h-screen bg-[#0a0f1c] py-8 px-4 animate-pulse">
            <div className="max-w-[1000px] mx-auto">
                {/* Header */}
                <div className="text-center mb-12 flex flex-col items-center">
                    <Skeleton className="w-20 h-20 rounded-full mb-4" />
                    <Skeleton className="h-10 w-64 mb-4 rounded" />
                    <Skeleton className="h-6 w-96 rounded" />
                </div>

                {/* Podium */}
                <div className="hidden md:flex justify-center items-end gap-6 mb-16 h-64">
                    <div className="flex flex-col items-center">
                        <Skeleton className="w-16 h-16 rounded-full mb-4" />
                        <Skeleton className="w-32 h-32 rounded-t-xl" />
                    </div>
                    <div className="flex flex-col items-center z-10">
                        <Skeleton className="w-24 h-24 rounded-full mb-4" />
                        <Skeleton className="w-40 h-44 rounded-t-xl" />
                    </div>
                    <div className="flex flex-col items-center">
                        <Skeleton className="w-16 h-16 rounded-full mb-4" />
                        <Skeleton className="w-32 h-24 rounded-t-xl" />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-[#111827] rounded-2xl border border-gray-800 shadow-2xl p-4">
                    <div className="space-y-4">
                        {/* Header row */}
                        <div className="flex justify-between pb-4 border-b border-gray-800">
                            <Skeleton className="h-4 w-16 rounded" />
                            <Skeleton className="h-4 w-32 rounded" />
                            <Skeleton className="h-4 w-24 rounded" />
                        </div>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex justify-between py-2 items-center">
                                <Skeleton className="h-6 w-8 rounded" />
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-8 h-8 rounded-full" />
                                    <Skeleton className="h-4 w-32 rounded" />
                                </div>
                                <Skeleton className="h-6 w-20 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function DSASkeleton() {
    return (
        <div className="min-h-screen bg-[#0a0f1c] p-4 md:p-8 animate-pulse">
            <div className="w-full mx-auto space-y-6">
                {/* Header */}
                <div>
                    <Skeleton className="h-8 w-64 mb-2 rounded" />
                    <Skeleton className="h-4 w-96 rounded" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6 bg-[#111827] rounded-2xl border border-gray-800 p-6 h-96">
                        <Skeleton className="h-6 w-24 mb-4 rounded" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20 rounded" />
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-16 rounded-lg" />
                                <Skeleton className="h-8 w-20 rounded-lg" />
                                <Skeleton className="h-8 w-16 rounded-lg" />
                            </div>
                        </div>
                        <div className="space-y-2 mt-6">
                            <Skeleton className="h-4 w-24 rounded" />
                            <div className="flex flex-wrap gap-2">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="h-8 w-20 rounded-lg" />
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Problems List */}
                    <div className="lg:col-span-3 bg-[#111827] rounded-2xl border border-gray-800 p-4">
                        <div className="flex justify-between pb-4 border-b border-gray-800">
                            <Skeleton className="h-4 w-32 rounded" />
                            <Skeleton className="h-4 w-20 rounded hidden md:block" />
                            <Skeleton className="h-4 w-24 rounded" />
                        </div>
                        <div className="space-y-4 mt-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="flex justify-between items-center py-2">
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-64 rounded" />
                                        <div className="flex gap-2">
                                            <Skeleton className="h-3 w-12 rounded-full" />
                                            <Skeleton className="h-3 w-16 rounded-full" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-4 w-16 rounded hidden md:block" />
                                    <Skeleton className="h-5 w-16 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ProblemViewSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 pt-4 pb-4 animate-pulse">
            {/* Header */}
            <div className="max-w-[1400px] mx-auto px-6 mb-4">
                <div className="bg-white/10 rounded-xl p-4 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <Skeleton className="h-10 w-36 rounded-xl" />
                        <Skeleton className="h-6 w-32 rounded" />
                    </div>
                    <Skeleton className="h-10 w-32 rounded-xl" />
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-5 items-start">
                    {/* Left Panel */}
                    <div className="space-y-4">
                        <div className="bg-white/10 rounded-xl p-6 min-h-[500px]">
                            <Skeleton className="h-8 w-3/4 mb-4 rounded" />
                            <div className="flex gap-3 mb-8">
                                <Skeleton className="h-8 w-20 rounded-xl" />
                                <Skeleton className="h-8 w-24 rounded-xl" />
                                <Skeleton className="h-8 w-32 rounded-xl" />
                            </div>

                            <div className="space-y-3 mb-12">
                                <Skeleton className="h-4 w-full rounded" />
                                <Skeleton className="h-4 w-[90%] rounded" />
                                <Skeleton className="h-4 w-[95%] rounded" />
                                <Skeleton className="h-4 w-3/4 rounded" />
                                <Skeleton className="h-4 w-[80%] rounded" />
                            </div>

                            <Skeleton className="h-6 w-40 mb-6 rounded" />
                            <Skeleton className="h-40 w-full rounded-xl mb-4" />
                            <Skeleton className="h-40 w-full rounded-xl" />
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="space-y-4">
                        <div className="bg-white/10 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex gap-4">
                                    <Skeleton className="h-12 w-32 rounded-xl" />
                                    <Skeleton className="h-12 w-32 rounded-xl" />
                                </div>
                            </div>
                            <div className="flex justify-start gap-4">
                                <Skeleton className="h-12 w-36 rounded-xl" />
                                <Skeleton className="h-12 w-36 rounded-xl" />
                            </div>
                        </div>

                        <div className="bg-[#1e1e1e] rounded-xl h-[520px] p-6">
                            {/* Editor lines mock */}
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-1/4 rounded bg-white/5" />
                                <Skeleton className="h-4 w-1/3 rounded bg-white/5 ml-4" />
                                <Skeleton className="h-4 w-1/2 rounded bg-white/5 ml-8" />
                                <Skeleton className="h-4 w-1/3 rounded bg-white/5 ml-8" />
                                <Skeleton className="h-4 w-1/4 rounded bg-white/5 ml-4" />
                            </div>
                        </div>

                        <div className="bg-white/10 rounded-2xl h-[120px] p-4">
                            <Skeleton className="h-6 w-40 rounded mb-4" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
