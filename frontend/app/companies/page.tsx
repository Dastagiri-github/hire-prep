"use client";
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Building2, ChevronRight, Trophy } from 'lucide-react';
import Pagination from '@/components/Pagination';

interface Company {
  name: string;
  count: number;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await api.get('/problems/companies/list');
        setCompanies(response.data);
      } catch (error) {
        console.error('Failed to fetch companies');
      }
    };
    fetchCompanies();
  }, []);

  const totalPages = Math.max(1, Math.ceil(companies.length / itemsPerPage));
  const paged = companies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-4 pt-4 max-w-7xl mx-auto min-h-screen">
      <div className="flex items-center gap-4 mb-12">
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Trophy className="w-8 h-8 text-blue-400" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Company Battleground
          </h1>
          <p className="text-gray-400 mt-1">Master the most asked questions from top tech companies</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paged.map((company, index) => (
          <Link
            href={`/companies/${company.name}`}
            key={company.name}
            className="block group animate-fade-in cursor-hand"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="glass-panel p-6 rounded-xl relative overflow-hidden transition-all duration-300 card-hover group-hover:border-blue-500/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-blue-500/10"></div>

              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all duration-300">
                  <Building2 className="w-8 h-8 text-gray-400 group-hover:text-blue-400 transition-colors" />
                </div>
                <div className="p-2 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                  <ChevronRight className="w-5 h-5 text-blue-400" />
                </div>
              </div>

              <div className="relative z-10">
                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">{company.name}</h2>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 group-hover:text-gray-300 transition-colors">Available Problems</span>
                  <span className="font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {company.count}
                  </span>
                </div>
              </div>

              <div className="mt-6 w-full bg-gray-800/50 h-1 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full w-0 group-hover:w-full transition-all duration-700 ease-out"></div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination page={currentPage} totalPages={totalPages} onPage={p => setCurrentPage(p)} />
        </div>
      )}
    </div>
  );
}
