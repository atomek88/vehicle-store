'use client';

import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-6 py-4 md:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          <Link href="/vehicles" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Junkyard Tracker</h1>
              <p className="text-xs text-gray-500">Vehicle Management System</p>
            </div>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link
              href="/vehicles"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
            >
              Vehicles
            </Link>
            <Link
              href="/registration-log"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
            >
              Registration Log
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
