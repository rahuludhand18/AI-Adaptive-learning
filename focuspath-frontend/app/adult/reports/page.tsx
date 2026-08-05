'use client';

import React from 'react';
import { TopNav } from '@/components/layout/TopNav';
import { PageContainer } from '@/components/layout/PageContainer';
import { Users, MessageSquare, Award } from 'lucide-react';

export default function AdultReportsPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans antialiased text-textPrimary">
      <TopNav />

      <PageContainer>
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-textPrimary tracking-tight">
            Adult Focus Community
          </h1>
          <p className="text-sm text-textSecondary font-normal">
            Connect with peer adult learners, share deep-work strategies, and join accountability groups.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-border shadow-card flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-light text-indigo flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-textPrimary mb-1">Study Squads</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Join live co-working sessions with adult professionals studying for exams or certifications.
            </p>
            <button className="mt-4 py-2 px-4 bg-indigo text-white text-xs font-semibold rounded-xl hover:bg-indigo-dark transition-all cursor-pointer">
              Join Squad
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-border shadow-card flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-teal-light text-teal flex items-center justify-center mb-4">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-textPrimary mb-1">Discussion Forums</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Exchange tips on cognitive energy management, ergonomic setups, and time blocking.
            </p>
            <button className="mt-4 py-2 px-4 bg-teal text-white text-xs font-semibold rounded-xl hover:bg-teal-600 transition-all cursor-pointer">
              View Forums
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-border shadow-card flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-textPrimary mb-1">Leaderboards</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Celebrate weekly streak milestones and compare focus hours with top adult achievers.
            </p>
            <button className="mt-4 py-2 px-4 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-all cursor-pointer">
              View Ranks
            </button>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
