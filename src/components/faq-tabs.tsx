'use client'

import { useState } from 'react'

interface FaqTabsProps {
  children: React.ReactNode
  parentFaqsNode: React.ReactNode
  schoolFaqsNode: React.ReactNode
}

export function FaqTabs({ parentFaqsNode, schoolFaqsNode }: Omit<FaqTabsProps, 'children'>) {
  const [activeTab, setActiveTab] = useState<'parent' | 'school'>('parent')

  return (
    <>
      <div className="flex justify-center gap-3 mb-12">
        <button
          onClick={() => setActiveTab('parent')}
          className={`px-6 py-3 rounded-full font-heading text-sm font-600 transition-all duration-300 ${
            activeTab === 'parent'
              ? 'bg-teal text-white shadow-md'
              : 'bg-pale text-navy hover:bg-pale-light'
          }`}
        >
          For Parents
        </button>
        <button
          onClick={() => setActiveTab('school')}
          className={`px-6 py-3 rounded-full font-heading text-sm font-600 transition-all duration-300 ${
            activeTab === 'school'
              ? 'bg-teal text-white shadow-md'
              : 'bg-pale text-navy hover:bg-pale-light'
          }`}
        >
          For Schools
        </button>
      </div>

      {activeTab === 'parent' && <div>{parentFaqsNode}</div>}
      {activeTab === 'school' && <div>{schoolFaqsNode}</div>}
    </>
  )
}
