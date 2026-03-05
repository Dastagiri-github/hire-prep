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
