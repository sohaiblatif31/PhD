'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  DollarSign,
  KanbanSquare,
  Users,
  Calendar,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store/useStore';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/programs', label: 'PhD Programs', icon: GraduationCap },
  { href: '/scholarships', label: 'Scholarships', icon: DollarSign },
  { href: '/tracker', label: 'App Tracker', icon: KanbanSquare },
  { href: '/supervisors', label: 'Supervisors', icon: Users },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="sidebar"
      style={{
        width: '240px',
        minHeight: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        gap: '4px',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: '32px', padding: '0 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
              PhD Tracker
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Canada 2027</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', color: 'var(--text-muted)', padding: '0 14px', marginBottom: '8px', textTransform: 'uppercase' }}>
          Navigation
        </div>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div
                className={cn('nav-link', isActive && 'active')}
              >
                <Icon size={17} />
                <span>{label}</span>
                {isActive && (
                  <div
                    style={{
                      marginLeft: 'auto',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#8b5cf6',
                    }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: '16px',
          borderRadius: '12px',
          background: 'rgba(124, 58, 237, 0.08)',
          border: '1px solid rgba(124, 58, 237, 0.15)',
          marginTop: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <BookOpen size={14} color="#8b5cf6" />
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#a78bfa' }}>Sohaib Latif</span>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          Mechanical Eng. + Full-Stack Dev<br />
          Applying for Fall 2027
        </p>
      </div>
    </aside>
  );
}
