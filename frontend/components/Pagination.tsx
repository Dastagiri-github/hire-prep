"use client";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

interface Props {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}

export default function Pagination({ page, totalPages, onPage }: Props) {
  const prev = () => onPage(Math.max(1, page - 1));
  const next = () => onPage(Math.min(totalPages, page + 1));

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={prev}
        disabled={page <= 1}
        className={`px-3 py-2 rounded-lg border transition disabled:opacity-50 disabled:cursor-not-allowed ${page <= 1 ? 'bg-white/3 border-white/5' : 'bg-white/5 hover:bg-white/10 border-white/10'}`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm">
        Page {page} of {totalPages}
      </div>

      <button
        onClick={next}
        disabled={page >= totalPages}
        className={`px-3 py-2 rounded-lg border transition disabled:opacity-50 disabled:cursor-not-allowed ${page >= totalPages ? 'bg-white/3 border-white/5' : 'bg-white/5 hover:bg-white/10 border-white/10'}`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
