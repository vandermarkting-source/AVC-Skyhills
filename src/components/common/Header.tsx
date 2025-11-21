'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AppImage from '../ui/AppImage';
import { betService } from '@/services/betService';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showPointsPanel, setShowPointsPanel] = useState(false);
  const [reservedPoints, setReservedPoints] = useState(0);

  const handleSignOut = async () => {
    await signOut();
    router?.push('/home-dashboard');
  };

  const navItems = [
    { href: '/home-dashboard', label: 'Home' },
    { href: '/wedstrijden-matches', label: 'Wedstrijden' },
    { href: '/fun-bets', label: 'Fun Bets' },
    { href: '/ranglijst-leaderboard', label: 'Ranglijst' },
    { href: '/mijn-inzetten-bets', label: 'Inzetten' },
    ...(profile?.role === 'admin' ? [{ href: '/admin-panel', label: 'Admin' }] : []),
  ];

  useEffect(() => {
    let mounted = true;
    const loadReserved = async () => {
      if (!user) return;
      const sum = await betService.getReservedStakeSum(user.id);
      if (mounted) setReservedPoints(sum.total);
    };
    loadReserved();
    return () => {
      mounted = false;
    };
  }, [user, showPointsPanel]);

  return (
    <header className="fixed top-0 left-0 right-0 bg-card shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[60px]">
          {/* Logo */}
          <Link href="/home-dashboard" className="flex items-center space-x-3">
            <div className="h-10 w-auto">
              <AppImage
                src={'/assets/images/logo-avc-skyhills.png'}
                alt="AVC Skyhills"
                width={160}
                height={40}
                className="h-10 w-auto object-contain"
                priority
              />
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems?.map((item) => (
              <Link
                key={item?.href}
                href={item?.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === item?.href
                    ? 'text-primary'
                    : 'text-text-secondary hover:text-primary'
                }`}
              >
                {item?.label}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <button
              className="md:hidden flex items-center space-x-2 bg-accent/10 px-3 py-1.5 rounded-full"
              onClick={() => setShowPointsPanel(!showPointsPanel)}
            >
              <span className="text-sm font-semibold text-accent">
                {profile?.pointsBalance ?? 0} pts
              </span>
            </button>
            <button
              className="md:hidden p-2 rounded-md hover:bg-muted focus:outline-none"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-text-primary"
              >
                <path
                  fillRule="evenodd"
                  d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75zm.75 4.5a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5H3.75z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              className="hidden md:flex items-center space-x-2 bg-accent/10 px-3 py-1.5 rounded-full"
              onClick={() => setShowPointsPanel(!showPointsPanel)}
            >
              <span className="text-sm font-semibold text-accent">
                {profile?.pointsBalance ?? 0} pts
              </span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                {profile?.avatarUrl ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-border">
                    <AppImage
                      src={profile.avatarUrl}
                      alt={profile.fullName ?? 'Gebruiker'}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {profile?.fullName?.charAt(0)?.toUpperCase() ?? 'G'}
                    </span>
                  </div>
                )}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg py-2 z-50">
                  <Link
                    href="/mijn-account-profile"
                    className="block px-4 py-2 text-sm text-text-primary hover:bg-muted"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Mijn Account
                  </Link>
                  {user ? (
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-muted"
                    >
                      Uitloggen
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
        {showPointsPanel && (
          <div className="md:hidden absolute left-0 right-0 top-[60px] bg-card border-t border-border shadow-lg z-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Inzetbare punten</span>
                <span className="font-data font-semibold text-success">
                  {Math.max((profile?.pointsBalance ?? 0) - reservedPoints, 0).toLocaleString(
                    'nl-NL'
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Ingezette punten</span>
                <button
                  onClick={() => {
                    setShowPointsPanel(false);
                    router.push('/mijn-inzetten-bets');
                  }}
                  className="font-data font-semibold text-warning hover:underline"
                >
                  {reservedPoints.toLocaleString('nl-NL')}
                </button>
              </div>
            </div>
          </div>
        )}
        {showPointsPanel && (
          <div className="hidden md:block absolute right-0 top-[60px] bg-card border border-border rounded-md shadow-lg z-50">
            <div className="p-4 w-64">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Inzetbare punten</span>
                <span className="font-data font-semibold text-success">
                  {Math.max((profile?.pointsBalance ?? 0) - reservedPoints, 0).toLocaleString(
                    'nl-NL'
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Ingezette punten</span>
                <button
                  onClick={() => {
                    setShowPointsPanel(false);
                    router.push('/mijn-inzetten-bets');
                  }}
                  className="font-data font-semibold text-warning hover:underline"
                >
                  {reservedPoints.toLocaleString('nl-NL')}
                </button>
              </div>
            </div>
          </div>
        )}
        {showMobileMenu && (
          <div className="md:hidden absolute left-0 right-0 top-[60px] bg-card border-t border-border shadow-lg z-50">
            <nav className="flex flex-col p-4 space-y-2">
              {navItems?.map((item) => (
                <Link
                  key={item?.href}
                  href={item?.href}
                  className={`text-base font-medium transition-colors ${
                    pathname === item?.href
                      ? 'text-primary'
                      : 'text-text-secondary hover:text-primary'
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  {item?.label}
                </Link>
              ))}
              <Link
                href="/mijn-account-profile"
                className="text-base font-medium text-text-secondary hover:text-primary"
                onClick={() => setShowMobileMenu(false)}
              >
                Mijn Account
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
