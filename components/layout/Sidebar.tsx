'use client';

import { useState } from 'react';
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
  Menu,
  X,
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Sparkles size={14} color="white" />
          </div>
          <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>PhD Tracker</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn('sidebar-container', isOpen && 'open')}>
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
            <Link 
              key={href} 
              href={href} 
              style={{ textDecoration: 'none' }}
              onClick={() => setIsOpen(false)}
            >
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
    </>
  );
}
