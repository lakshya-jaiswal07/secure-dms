import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, Route, Switch, useLocation, useParams } from 'wouter';
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Copy,
  Download,
  Eye,
  FileBadge,
  FileCheck2,
  FileSearch,
  FileText,
  Filter,
  Fingerprint,
  FolderOpen,
  Gavel,
  History,
  KeyRound,
  LayoutDashboard,
  Link2,
  LockKeyhole,
  LogOut,
  Menu,
  MoreHorizontal,
  PanelLeftClose,
  Plus,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';

type ToastTone = 'success' | 'info' | 'warning';
type ToastState = { message: string; tone: ToastTone } | null;

type Case = {
  id: string;
  number: string;
  title: string;
  type: string;
  court: string;
  location: string;
  status: string;
  statusTone: 'amber' | 'teal' | 'slate';
  nextReview: string;
  updated: string;
  description: string;
  parties: string[];
};

type Document = {
  id: string;
  caseId: string;
  name: string;
  category: string;
  size: string;
  date: string;
  pages: number;
  status: 'Verified' | 'Review required' | 'Sealed';
  hash: string;
  description: string;
};

type TrailEvent = {
  icon: 'capture' | 'upload' | 'verify' | 'view' | 'share' | 'seal';
  title: string;
  actor: string;
  role: string;
  time: string;
  detail: string;
  verified?: boolean;
};

const cases: Case[] = [
  {
    id: 'nv-2024-0817',
    number: 'CRL.A. 0817 / 2024',
    title: 'State v. Arvind Mehta',
    type: 'Criminal appeal',
    court: 'High Court of Delhi',
    location: 'New Delhi',
    status: 'Under review',
    statusTone: 'amber',
    nextReview: '18 Jun 2024',
    updated: '12 min ago',
    description: 'Appeal concerning the admissibility and provenance of digital evidence submitted at trial.',
    parties: ['State of Delhi', 'Arvind Mehta'],
  },
  {
    id: 'nv-2023-1142',
    number: 'FIR 118 / 2023',
    title: 'People v. Kavita Rao',
    type: 'Economic offences',
    court: 'District Court, Bengaluru',
    location: 'Bengaluru',
    status: 'Active investigation',
    statusTone: 'teal',
    nextReview: '21 Jun 2024',
    updated: 'Yesterday',
    description: 'Investigation into alleged financial misrepresentation across three connected entities.',
    parties: ['State of Karnataka', 'Kavita Rao'],
  },
  {
    id: 'nv-2024-0326',
    number: 'CS 326 / 2024',
    title: 'R. Sen v. Union of India',
    type: 'Constitutional petition',
    court: 'Supreme Court of India',
    location: 'New Delhi',
    status: 'Evidence filed',
    statusTone: 'slate',
    nextReview: '24 Jun 2024',
    updated: '2 days ago',
    description: 'Constitutional petition with a sealed expert report and supporting affidavits.',
    parties: ['Rohan Sen', 'Union of India'],
  },
  {
    id: 'nv-2022-0904',
    number: 'SC 904 / 2022',
    title: 'State v. Imran Qureshi',
    type: 'Serious offences',
    court: 'Sessions Court, Mumbai',
    location: 'Mumbai',
    status: 'Judgment reserved',
    statusTone: 'slate',
    nextReview: '01 Jul 2024',
    updated: '4 days ago',
    description: 'Final submissions recorded; judgment reserved after completion of witness examination.',
    parties: ['State of Maharashtra', 'Imran Qureshi'],
  },
  {
    id: 'nv-2024-0671',
    number: 'MISC 671 / 2024',
    title: 'K. Das v. State of West Bengal',
    type: 'Bail application',
    court: 'Calcutta High Court',
    location: 'Kolkata',
    status: 'Awaiting review',
    statusTone: 'amber',
    nextReview: '19 Jun 2024',
    updated: 'Last week',
    description: 'Bail application with an electronic surveillance record awaiting integrity review.',
    parties: ['Kunal Das', 'State of West Bengal'],
  },
];

const documents: Document[] = [
  { id: 'fir-118', caseId: 'nv-2023-1142', name: 'First information report', category: 'FIR', size: '2.4 MB', date: '14 Sep 2023', pages: 8, status: 'Verified', hash: '8c2a1f9d…7b4e', description: 'Certified FIR and station diary extract filed by the investigating officer.' },
  { id: 'chargesheet-118', caseId: 'nv-2023-1142', name: 'Final report and chargesheet', category: 'Chargesheet', size: '18.7 MB', date: '22 Jan 2024', pages: 146, status: 'Verified', hash: 'c14d09aa…c813', description: 'Final report including witness index, exhibits and forensic annexures.' },
  { id: 'ledger-118', caseId: 'nv-2023-1142', name: 'Forensic ledger export', category: 'Evidence', size: '6.8 MB', date: '02 Feb 2024', pages: 42, status: 'Review required', hash: 'e31b4c29…1f0a', description: 'Read-only export of the transaction ledger supplied by the forensic examiner.' },
  { id: 'affidavit-118', caseId: 'nv-2023-1142', name: 'Affidavit of S. Iyer', category: 'Affidavit', size: '1.1 MB', date: '18 Feb 2024', pages: 12, status: 'Verified', hash: 'ba7e021c…a9d2', description: 'Sworn affidavit submitted by the former finance controller.' },
  { id: 'judgment-118', caseId: 'nv-2023-1142', name: 'Interim order dated 04 Mar 2024', category: 'Judgment', size: '840 KB', date: '04 Mar 2024', pages: 17, status: 'Sealed', hash: 'f09283e1…44b7', description: 'Interim order accessible only to the assigned bench and court clerk.' },
  { id: 'digital-0817', caseId: 'nv-2024-0817', name: 'Device extraction report', category: 'Evidence', size: '24.2 MB', date: '11 Jun 2024', pages: 82, status: 'Verified', hash: 'a4ef00d2…c921', description: 'Forensic extraction report from the seized mobile device.' },
  { id: 'affidavit-0817', caseId: 'nv-2024-0817', name: 'Affidavit of N. Kapoor', category: 'Affidavit', size: '1.8 MB', date: '09 Jun 2024', pages: 9, status: 'Verified', hash: '47cc19e8…d0a1', description: 'Witness affidavit filed before the appellate registry.' },
  { id: 'judgment-0326', caseId: 'nv-2024-0326', name: 'Order on interim relief', category: 'Judgment', size: '2.9 MB', date: '05 Jun 2024', pages: 31, status: 'Sealed', hash: '4b2019ed…6fa3', description: 'Confidential order on interim relief and disclosure schedule.' },
];

const trailByDocument: Record<string, TrailEvent[]> = {
  'ledger-118': [
    { icon: 'capture', title: 'Evidence captured', actor: 'Ananya Joshi', role: 'Investigating officer · Bengaluru City Police', time: '02 Feb 2024 · 09:14 IST', detail: 'Export received from the secured evidence workstation.' },
    { icon: 'upload', title: 'Added to NyayaVault', actor: 'Ananya Joshi', role: 'Investigating officer', time: '02 Feb 2024 · 09:18 IST', detail: 'Original file sealed on ingest. SHA-256 generated.' },
    { icon: 'verify', title: 'Integrity verified', actor: 'Ritesh Menon', role: 'Digital forensics examiner', time: '02 Feb 2024 · 11:42 IST', detail: 'Hash matched the forensic acquisition record.', verified: true },
    { icon: 'view', title: 'Viewed', actor: 'Priya Nair', role: 'Assistant public prosecutor', time: '11 Jun 2024 · 16:05 IST', detail: 'Accessed from an authorized prosecution workspace.' },
  ],
  'digital-0817': [
    { icon: 'capture', title: 'Evidence captured', actor: 'Vikram Sethi', role: 'Cybercrime unit · Delhi Police', time: '11 Jun 2024 · 08:41 IST', detail: 'Mobile device extraction completed under seizure memo 22/24.' },
    { icon: 'upload', title: 'Added to NyayaVault', actor: 'Vikram Sethi', role: 'Investigating officer', time: '11 Jun 2024 · 09:02 IST', detail: 'Original file sealed on ingest. SHA-256 generated.' },
    { icon: 'verify', title: 'Integrity verified', actor: 'Ritesh Menon', role: 'Digital forensics examiner', time: '11 Jun 2024 · 10:22 IST', detail: 'Hash matched acquisition record and examiner report.', verified: true },
    { icon: 'view', title: 'Viewed', actor: 'You', role: 'Assistant public prosecutor', time: '12 Jun 2024 · 14:28 IST', detail: 'Accessed from this authorized workspace.' },
  ],
  'fir-118': [
    { icon: 'capture', title: 'Registered at station', actor: 'Meera Kulkarni', role: 'Station house officer', time: '14 Sep 2023 · 07:32 IST', detail: 'First information recorded and digitally signed.' },
    { icon: 'upload', title: 'Added to NyayaVault', actor: 'Meera Kulkarni', role: 'Station house officer', time: '14 Sep 2023 · 08:10 IST', detail: 'Certified scan sealed on ingest.' },
    { icon: 'verify', title: 'Integrity verified', actor: 'Court registry', role: 'District Court, Bengaluru', time: '15 Sep 2023 · 12:02 IST', detail: 'Digital signature and file hash validated.', verified: true },
  ],
};

const fallbackTrail: TrailEvent[] = [
  { icon: 'capture', title: 'Evidence captured', actor: 'Registry intake desk', role: 'Authorized court staff', time: '05 Jun 2024 · 10:10 IST', detail: 'File received through the court filing channel.' },
  { icon: 'upload', title: 'Added to NyayaVault', actor: 'Court registry', role: 'Authorized court staff', time: '05 Jun 2024 · 10:16 IST', detail: 'Original file sealed on ingest. SHA-256 generated.' },
  { icon: 'verify', title: 'Integrity verified', actor: 'Court registry', role: 'Authorized court staff', time: '05 Jun 2024 · 10:24 IST', detail: 'Hash matched the filing record.', verified: true },
];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-mark ${compact ? 'brand-mark-compact' : ''}`}>
      <div className="brand-seal"><ShieldCheck size={compact ? 18 : 21} strokeWidth={1.8} /></div>
      {!compact && <div><span className="brand-name">Nyaya<span>Vault</span></span><span className="brand-tagline">Evidence, accounted for.</span></div>}
    </div>
  );
}

function StatusBadge({ status, tone }: { status: string; tone?: string }) {
  const t = tone || (status.toLowerCase().includes('review') ? 'amber' : status.toLowerCase().includes('active') ? 'teal' : 'slate');
  return <span className={`status-pill status-pill-${t}`}><span className="status-pill-dot" />{status}</span>;
}

function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  if (!toast) return null;
  return <div className={`toast toast-${toast.tone}`} role="status" data-testid="status-toast">
    {toast.tone === 'success' ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
    <span>{toast.message}</span>
    <button onClick={onClose} aria-label="Dismiss notification" data-testid="button-dismiss-toast"><X size={15} /></button>
  </div>;
}

function SideNav({ onLogout, mobileOpen, onMobileClose }: { onLogout: () => void; mobileOpen: boolean; onMobileClose: () => void }) {
  const [location] = useLocation();
  const active = (path: string) => location === path || (path !== '/home' && location.startsWith(path));
  return <>
    <aside className={`app-sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-head"><Logo /><button className="icon-button sidebar-close" onClick={onMobileClose} aria-label="Close navigation" data-testid="button-close-navigation"><PanelLeftClose size={18} /></button></div>
      <div className="workspace-switcher"><div className="workspace-icon">AP</div><div><span className="micro-label">Workspace</span><strong>Prosecution desk</strong></div><ChevronDown size={15} /></div>
      <nav className="main-nav" aria-label="Primary navigation">
        <span className="nav-label">Workspace</span>
        <Link href="/home" className={`nav-item ${active('/home') ? 'nav-active' : ''}`} data-testid="link-home"><LayoutDashboard size={17} /><span>Overview</span></Link>
        <Link href="/search" className={`nav-item ${active('/search') ? 'nav-active' : ''}`} data-testid="link-search"><FileSearch size={17} /><span>Case search</span><kbd>⌘K</kbd></Link>
        <Link href="/home#reviews" className="nav-item" data-testid="link-reviews"><Clock3 size={17} /><span>Pending reviews</span><em>3</em></Link>
        <span className="nav-label nav-label-spaced">Account</span>
        <Link href="/profile" className={`nav-item ${active('/profile') ? 'nav-active' : ''}`} data-testid="link-profile"><CircleUserRound size={17} /><span>My profile</span></Link>
        <button className="nav-item" onClick={() => { onLogout(); onMobileClose(); }} data-testid="button-logout-nav"><LogOut size={17} /><span>Sign out</span></button>
      </nav>
      <div className="sidebar-footer">
        <div className="access-card"><div className="access-card-top"><LockKeyhole size={15} /><span>Controlled access</span><span className="live-dot" /></div><p>Every action is recorded in the audit log.</p></div>
        <div className="sidebar-user"><div className="avatar avatar-small">PN</div><div><strong>Priya Nair</strong><span>Assistant prosecutor</span></div><MoreHorizontal size={18} /></div>
      </div>
    </aside>
    {mobileOpen && <button className="sidebar-scrim" onClick={onMobileClose} aria-label="Close menu" data-testid="button-close-menu-overlay" />}
  </>;
}

function handleCaseSearch(queryStr: string, setLocationFn: (path: string) => void, casesList: Case[]) {
  const trimmed = queryStr.trim();
  if (!trimmed) return;
  const qLower = trimmed.toLowerCase();
  const qClean = qLower.replace(/[^a-z0-9]/gi, '');

  // Search by exact case number, case ID, or partial number match
  const match = casesList.find((c) =>
    c.id.toLowerCase() === qLower ||
    c.number.toLowerCase() === qLower ||
    c.number.replace(/[^a-z0-9]/gi, '').toLowerCase() === qClean ||
    (qClean.length >= 3 && c.number.replace(/[^a-z0-9]/gi, '').toLowerCase().includes(qClean))
  );

  if (match) {
    // Open directly to the case window!
    setLocationFn(`/case/${match.id}`);
  } else {
    setLocationFn(`/search?q=${encodeURIComponent(trimmed)}`);
  }
}

function AppHeader({ onMenu, onLogout, onToast, casesList }: { onMenu: () => void; onLogout: () => void; onToast: (message: string, tone?: ToastTone) => void; casesList: Case[] }) {
  const [location, setLocation] = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const submitSearch = () => {
    if (query.trim()) {
      handleCaseSearch(query, setLocation, casesList);
    }
  };

  return <header className="app-header">
    <button className="mobile-menu-button icon-button" onClick={onMenu} aria-label="Open navigation" data-testid="button-open-navigation"><Menu size={20} /></button>
    <div className="header-search">
      <Search size={17} />
      <input
        aria-label="Global case search"
        placeholder="Search cases by number (e.g. CRL.A. 0817 / 2024), FIR, title…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => { if (event.key === 'Enter') submitSearch(); }}
        data-testid="input-global-search"
      />
      <kbd>⌘ K</kbd>
    </div>
    <div className="header-actions">
      <div className="notification-wrap">
        <button className="icon-button notification-button" onClick={() => setNotificationsOpen(!notificationsOpen)} aria-label="Open notifications" data-testid="button-notifications"><Bell size={18} /><span className="notification-dot" /></button>
        {notificationsOpen && <div className="pop-menu notification-menu"><div className="pop-menu-head"><strong>Notifications</strong><button onClick={() => { setNotificationsOpen(false); onToast('All notifications marked as read'); }} data-testid="button-mark-read">Mark all read</button></div><div className="notification-row"><div className="notification-icon amber"><FileCheck2 size={15} /></div><div><strong>Review requested</strong><p>Forensic ledger export in FIR 118 / 2023</p><span>18 minutes ago</span></div></div><div className="notification-row"><div className="notification-icon teal"><UsersRound size={15} /></div><div><strong>Access granted</strong><p>R. Sen v. Union of India shared with you</p><span>Yesterday</span></div></div></div>}
      </div>
      <div className="profile-wrap">
        <button className="profile-trigger" onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen} data-testid="button-profile-menu"><div className="avatar">PN</div><span>Priya Nair</span><ChevronDown size={14} /></button>
        {profileOpen && <div className="pop-menu profile-menu"><div className="profile-menu-head"><div className="avatar avatar-large">PN</div><div><strong>Priya Nair</strong><span>Assistant prosecutor</span></div></div><Link href="/profile" onClick={() => setProfileOpen(false)} data-testid="link-profile-menu"><CircleUserRound size={16} /> My profile</Link><button onClick={() => { setProfileOpen(false); onLogout(); }} data-testid="button-logout-menu"><LogOut size={16} /> Sign out</button></div>}
      </div>
    </div>
  </header>;
}

function AppShell({ children, onLogout, onToast, casesList }: { children: ReactNode; onLogout: () => void; onToast: (message: string, tone?: ToastTone) => void; casesList: Case[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return <div className="app-frame"><SideNav onLogout={onLogout} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} /><div className="app-content"><AppHeader onMenu={() => setMobileOpen(true)} onLogout={onLogout} onToast={onToast} casesList={casesList} /><main className="app-main">{children}</main></div></div>;
}

function PageHeading({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description?: string; children?: ReactNode }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>{children && <div className="heading-actions">{children}</div>}</div>;
}

function CaseCard({ item }: { item: Case }) {
  return (
    <Link href={`/case/${item.id}`} className="case-card-tile" data-testid={`card-case-${item.id}`}>
      <div className="case-card-tile-top">
        <span className="case-tile-number">{item.number}</span>
        <StatusBadge status={item.status} tone={item.statusTone} />
      </div>
      <h3 className="case-tile-title">{item.title}</h3>
      <p className="case-tile-subtitle">
        {item.type}<span className="dot-separator" />{item.court}
      </p>
      <div className="case-card-tile-bottom">
        <span className="case-tile-updated">
          <Clock3 size={13} /> Updated {item.updated || '12 min ago'}
        </span>
        <ChevronRight size={17} className="case-tile-chevron" />
      </div>
    </Link>
  );
}

function HomeSkeleton() {
  return <div className="page page-home" aria-label="Loading workspace" data-testid="loading-home">
    <div className="skeleton skeleton-eyebrow" /><div className="skeleton skeleton-title" /><div className="skeleton skeleton-subtitle" />
    <div className="skeleton skeleton-search-card" /><div className="skeleton-section-row"><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line short" /></div>
    <div className="skeleton-list"><div className="skeleton skeleton-case" /><div className="skeleton skeleton-case" /><div className="skeleton skeleton-case" /></div>
  </div>;
}

function HomePage({ casesList, loading, onToast }: { casesList: Case[]; loading: boolean; onToast: (message: string, tone?: ToastTone) => void }) {
  const [location, setLocation] = useLocation();
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) {
      handleCaseSearch(query, setLocation, casesList);
    }
  };

  if (loading) return <HomeSkeleton />;
  return <div className="page page-home">
    <div className="home-intro"><div><div className="eyebrow">Wednesday, 12 June 2024 <span className="eyebrow-rule" /></div><h1>Good morning, Priya<span className="title-mark">.</span></h1><p>Your workspace is connected to <strong>{casesList.length} cases</strong> in the Neon Cloud Database.</p></div><div className="secure-chip"><span className="live-dot" /> Live DB Connected <LockKeyhole size={14} /></div></div>
    <section className="hero-search-panel">
      <div className="hero-search-copy">
        <span className="mini-kicker"><Search size={14} /> Find in your workspace</span>
        <h2>Search Case by ID or Case Number</h2>
        <p>Type any exact case number (e.g. “CRL.A. 0817 / 2024” or “0817”) to open its window directly.</p>
      </div>
      <div className="hero-search-form">
        <div className="search-input-large">
          <Search size={20} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            placeholder="Try case number “CRL.A. 0817” or “FIR 118”"
            data-testid="input-home-search"
          />
          <span>⌘ K</span>
        </div>
        <button className="button button-primary" onClick={handleSearch} data-testid="button-home-search">
          Search / Open Case <ArrowRight size={16} />
        </button>
      </div>
      <div className="search-scope"><span>Search scope</span><button className="scope-selected" data-testid="button-search-scope-all">All {casesList.length} database records <ChevronDown size={14} /></button><span className="scope-note"><ShieldCheck size={14} /> Live Neon PostgreSQL</span></div>
    </section>
    <section className="quick-access"><div className="section-label-row"><span className="section-kicker">Quick access</span><button onClick={() => setLocation('/search')} data-testid="button-view-all-search">View all {casesList.length} cases <ArrowRight size={14} /></button></div><div className="quick-chips"><button onClick={() => setLocation('/search?q=assigned')} data-testid="chip-assigned"><BriefcaseBusiness size={16} /> My assigned cases <span>{casesList.length}</span></button><button onClick={() => setLocation('/search?status=review')} data-testid="chip-review"><FileCheck2 size={16} /> Pending review <span className="chip-alert">3</span></button><button onClick={() => setLocation('/search?type=evidence')} data-testid="chip-evidence"><Fingerprint size={16} /> Recently verified <span>12</span></button><button onClick={() => onToast('Saved searches are available in the full workspace', 'info')} data-testid="chip-saved"><BookOpen size={16} /> Saved searches</button></div></section>
    <div className="home-grid"><section><div className="section-label-row"><div><span className="section-kicker">Recent database cases ({casesList.length} total)</span><p className="section-subline">Live records loaded from Neon database</p></div><Link href="/search" data-testid="link-see-all-cases">See all <ArrowRight size={14} /></Link></div><div className="case-list">{casesList.slice(0, 4).map((item) => <CaseCard item={item} key={item.id} />)}</div></section><section className="review-panel" id="reviews"><div className="section-label-row"><div><span className="section-kicker">Needs your attention</span><p className="section-subline">Review before the next hearing</p></div><span className="count-pill">03</span></div><div className="review-list"><Link href="/case/nv-2023-1142/documents/ledger-118" className="review-item" data-testid="review-item-ledger"><div className="review-icon review-amber"><FileBadge size={17} /></div><div><strong>Forensic ledger export</strong><span>FIR 118 / 2023 · Integrity review</span><small>Due in 2 days</small></div><ChevronRight size={16} /></Link><Link href="/case/nv-2024-0671" className="review-item" data-testid="review-item-das"><div className="review-icon review-teal"><Gavel size={17} /></div><div><strong>Awaiting case review</strong><span>MISC 671 / 2024 · Bail application</span><small>Due in 7 days</small></div><ChevronRight size={16} /></Link><Link href="/case/nv-2024-0326/documents/judgment-0326" className="review-item" data-testid="review-item-order"><div className="review-icon review-slate"><LockKeyhole size={17} /></div><div><strong>Sealed order available</strong><span>CS 326 / 2024 · Court registry</span><small>Access restricted</small></div><ChevronRight size={16} /></Link></div><button className="button button-quiet review-button" onClick={() => onToast('Opening review queue…')} data-testid="button-open-review-queue">Open review queue <ArrowRight size={15} /></button></section></div>
    <div className="activity-strip"><div><span className="activity-pulse" /><strong>Audit log operational</strong><span>Database status: Connected to Neon PostgreSQL</span></div><button onClick={() => onToast('Audit log is available to authorized administrators', 'info')} data-testid="button-audit-log">View audit log <ArrowRight size={14} /></button></div>
  </div>;
}

function SearchPage({ casesList }: { casesList: Case[] }) {
  const [location, setLocation] = useLocation();
  const initial = new URLSearchParams(location.split('?')[1] || '').get('q') || '';
  const [query, setQuery] = useState(initial);
  const [type, setType] = useState('All case types');
  const [court, setCourt] = useState('All courts');
  const [status, setStatus] = useState('All statuses');
  const [docType, setDocType] = useState('All documents');
  const [showFilters, setShowFilters] = useState(true);

  const directMatch = useMemo(() => {
    const qLower = query.trim().toLowerCase();
    if (!qLower) return null;
    const qClean = qLower.replace(/[^a-z0-9]/gi, '');
    return casesList.find(
      (c) =>
        c.id.toLowerCase() === qLower ||
        c.number.toLowerCase() === qLower ||
        c.number.replace(/[^a-z0-9]/gi, '').toLowerCase() === qClean
    );
  }, [query, casesList]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return casesList.filter((item) => {
      const matchQuery = !normalized || [item.number, item.title, item.type, item.court, item.description, item.id].some((v) => (v || '').toLowerCase().includes(normalized));
      const matchType = type === 'All case types' || item.type === type;
      const matchCourt = court === 'All courts' || item.court === court;
      const matchStatus = status === 'All statuses' || item.status === status;
      return matchQuery && matchType && matchCourt && matchStatus;
    });
  }, [query, type, court, status, casesList]);

  const executeSearch = () => {
    if (query.trim()) {
      handleCaseSearch(query, setLocation, casesList);
    }
  };

  return <div className="page"><PageHeading eyebrow="Workspace search" title="Case search" description={`Search across ${casesList.length} database case records.`}><button className="button button-secondary" onClick={() => setShowFilters(!showFilters)} data-testid="button-toggle-filters"><SlidersHorizontal size={16} /> {showFilters ? 'Hide filters' : 'Show filters'}</button></PageHeading>
    <div className="search-toolbar">
      <Search size={18} />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') executeSearch(); }}
        placeholder="Case number (e.g. CRL.A. 0817 / 2024), FIR, person, or keyword"
        autoFocus
        data-testid="input-search-query"
      />
      <button className="button button-primary" onClick={executeSearch} data-testid="button-submit-search">Search / Open</button>
    </div>

    {directMatch && (
      <div className="direct-match-card">
        <div className="direct-match-info">
          <h4>Direct Match Found for "{directMatch.number}"</h4>
          <p>{directMatch.title} · {directMatch.court}</p>
        </div>
        <button className="button button-primary" onClick={() => setLocation(`/case/${directMatch.id}`)}>
          Open Case Window <ArrowRight size={15} />
        </button>
      </div>
    )}

    {showFilters && <div className="filter-panel"><div className="filter-heading"><Filter size={16} /><strong>Refine results</strong><button onClick={() => { setType('All case types'); setCourt('All courts'); setStatus('All statuses'); setDocType('All documents'); }} data-testid="button-clear-filters">Clear filters</button></div><div className="filter-grid"><label>Case type<select value={type} onChange={(e) => setType(e.target.value)} data-testid="select-case-type"><option>All case types</option><option>Criminal appeal</option><option>Economic offences</option><option>Constitutional petition</option><option>Serious offences</option><option>Bail application</option><option>Counterfeiting</option><option>Homicide</option><option>Cybercrime</option></select></label><label>Court<select value={court} onChange={(e) => setCourt(e.target.value)} data-testid="select-court"><option>All courts</option><option>High Court of Delhi</option><option>District Court, Bengaluru</option><option>Supreme Court of India</option><option>Sessions Court, Mumbai</option><option>Calcutta High Court</option></select></label><label>Date range<select data-testid="select-date-range"><option>Any date</option><option>Last 30 days</option><option>Last 6 months</option><option>Last year</option></select></label><label>Document type<select value={docType} onChange={(e) => setDocType(e.target.value)} data-testid="select-document-type"><option>All documents</option><option>FIR</option><option>Evidence</option><option>Affidavit</option><option>Judgment</option></select></label><label>Status<select value={status} onChange={(e) => setStatus(e.target.value)} data-testid="select-status"><option>All statuses</option><option>Under review</option><option>Active investigation</option><option>Evidence filed</option><option>Awaiting review</option><option>Judgment reserved</option><option>Not Solved</option></select></label></div></div>}<div className="result-summary"><strong>{filtered.length} {filtered.length === 1 ? 'case' : 'cases'} found</strong><span>Sorted by recent activity</span><button className="sort-button" data-testid="button-sort-results">Recent activity <ChevronDown size={14} /></button></div>{filtered.length ? <div className="search-results">{filtered.map((item) => <CaseCard item={item} key={item.id} />)}</div> : <div className="empty-state"><div className="empty-icon"><FileSearch size={25} /></div><h3>No records found</h3><p>Try a broader search term or remove one of the filters. Only records within your authorization scope are shown.</p><button className="button button-secondary" onClick={() => { setQuery(''); setType('All case types'); setCourt('All courts'); setStatus('All statuses'); }} data-testid="button-reset-search">Reset search</button></div>}</div>;
}

function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return <div className="breadcrumbs"><Link href="/home" data-testid="link-breadcrumb-home">Workspace</Link>{items.map((item, index) => <span key={item.label}><ChevronRight size={13} />{item.href ? <Link href={item.href} data-testid={`link-breadcrumb-${index}`}>{item.label}</Link> : <strong>{item.label}</strong>}</span>)}</div>;
}

function CasePage({ casesList }: { casesList: Case[] }) {
  const { id = '' } = useParams();
  const [, setLocation] = useLocation();
  const [singleCase, setSingleCase] = useState<Case | null>(null);

  useEffect(() => {
    const foundLocal = casesList.find((entry) => entry.id === id || entry.number === id);
    if (foundLocal) {
      setSingleCase(foundLocal);
    } else {
      fetch(`/api/cases/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) setSingleCase(data);
          else setSingleCase(casesList[0] || cases[0]);
        })
        .catch(() => setSingleCase(casesList[0] || cases[0]));
    }
  }, [id, casesList]);

  const item = singleCase || casesList[0] || cases[0];
  const caseDocs = documents.filter((doc) => doc.caseId === item.id);
  return <div className="page"><Breadcrumbs items={[{ label: item.number }]} /><div className="case-hero"><div><div className="eyebrow">Case file <span className="eyebrow-rule" /></div><h1>{item.title}</h1><p className="case-hero-description">{item.description}</p><div className="case-hero-tags"><StatusBadge status={item.status} tone={item.statusTone} /><span className="subtle-tag"><Gavel size={13} /> {item.type}</span><span className="subtle-tag"><LockKeyhole size={13} /> Restricted workspace</span></div></div><div className="case-hero-actions"><button className="button button-secondary" onClick={() => setLocation(`/case/${item.id}/documents`)} data-testid="button-open-documents"><FolderOpen size={16} /> Open documents</button><button className="button button-primary" onClick={() => setLocation(`/case/${item.id}/documents/${caseDocs[0]?.id || 'digital-0817'}`)} data-testid="button-view-latest-document"><Eye size={16} /> View latest evidence</button></div></div><div className="case-meta-grid"><div><span>Case number</span><strong>{item.number}</strong></div><div><span>Court</span><strong>{item.court}</strong><small>{item.location}</small></div><div><span>Next review</span><strong>{item.nextReview}</strong><small>Registry calendar</small></div><div><span>Assigned team</span><strong>Prosecution desk</strong><small>Priya Nair + 2 others</small></div></div><div className="case-content-grid"><section className="content-card"><div className="card-title-row"><div><span className="section-kicker">Evidence inventory</span><h2>Documents in this case</h2></div><Link href={`/case/${item.id}/documents`} className="text-link" data-testid="link-case-documents">View all <ArrowRight size={14} /></Link></div><div className="document-mini-list">{caseDocs.length ? caseDocs.slice(0, 4).map((doc) => <Link href={`/case/${item.id}/documents/${doc.id}`} className="document-mini" key={doc.id} data-testid={`row-case-document-${doc.id}`}><div className="file-icon"><FileText size={18} /></div><div><strong>{doc.name}</strong><span>{doc.category} <span className="dot-separator" /> {doc.size}</span></div><StatusBadge status={doc.status} /><ChevronRight size={16} /></Link>) : <div className="inline-empty">No documents have been added to this case.</div>}</div></section><section className="content-card case-activity-card"><div className="card-title-row"><div><span className="section-kicker">Case activity</span><h2>Recent access</h2></div><History size={18} className="muted-icon" /></div><div className="activity-entry"><div className="activity-avatar">PN</div><div><strong>You viewed device extraction report</strong><span>12 Jun 2024 · 14:28 IST</span></div></div><div className="activity-entry"><div className="activity-avatar system">SY</div><div><strong>Integrity verification completed</strong><span>11 Jun 2024 · 10:22 IST</span></div></div><div className="activity-entry"><div className="activity-avatar registry">CR</div><div><strong>Registry added affidavit</strong><span>09 Jun 2024 · 11:09 IST</span></div></div><button className="button button-quiet full-width" data-testid="button-view-case-activity">View full case activity <ArrowRight size={15} /></button></section></div><div className="case-notice"><ShieldCheck size={18} /><div><strong>Chain of custody is intact</strong><p>All {caseDocs.length || 0} documents in this case have a recorded source and access history. Last integrity event was 11 Jun 2024.</p></div><Link href={`/case/${item.id}/documents`} data-testid="link-inspect-chain">Inspect chain <ArrowRight size={15} /></Link></div></div>;
}


function DocumentsPage() {
  const { id = '' } = useParams();
  const item = cases.find((entry) => entry.id === id) || cases[0];
  const [category, setCategory] = useState('All documents');
  const caseDocs = documents.filter((doc) => doc.caseId === item.id && (category === 'All documents' || doc.category === category));
  return <div className="page"><Breadcrumbs items={[{ label: item.number, href: `/case/${item.id}` }, { label: 'Documents' }]} /><PageHeading eyebrow={item.number} title="Documents" description={`${item.title} · ${item.court}`}><button className="button button-secondary" onClick={() => {}} data-testid="button-document-filters"><Filter size={16} /> Filter</button><button className="button button-primary" onClick={() => {}} data-testid="button-add-document"><Plus size={16} /> Add document</button></PageHeading><div className="document-toolbar"><div className="doc-tabs">{['All documents', 'FIR', 'Chargesheet', 'Evidence', 'Affidavit', 'Judgment'].map((tab) => <button className={category === tab ? 'doc-tab-active' : ''} onClick={() => setCategory(tab)} key={tab} data-testid={`tab-documents-${tab.toLowerCase()}`}>{tab}{tab === 'All documents' && <span>{documents.filter((d) => d.caseId === item.id).length}</span>}</button>)}</div><div className="document-sort"><SlidersHorizontal size={15} /> Recently added <ChevronDown size={14} /></div></div><div className="documents-table"><div className="table-head"><span>Document</span><span>Type</span><span>Added</span><span>Integrity</span><span /></div>{caseDocs.length ? caseDocs.map((doc) => <Link href={`/case/${item.id}/documents/${doc.id}`} className="document-row" key={doc.id} data-testid={`row-document-${doc.id}`}><div className="doc-name-cell"><div className="file-icon"><FileText size={18} /></div><div><strong>{doc.name}</strong><span>{doc.pages} pages <span className="dot-separator" /> {doc.size}</span></div></div><span className="type-cell">{doc.category}</span><span className="date-cell">{doc.date}</span><StatusBadge status={doc.status} /><ChevronRight size={17} className="row-chevron" /></Link>) : <div className="table-empty"><FileSearch size={22} /><strong>No {category.toLowerCase()} documents</strong><span>Try another document category.</span></div>}</div><div className="documents-footer"><span>Showing {caseDocs.length} document{caseDocs.length === 1 ? '' : 's'} · Access is logged automatically</span><span className="integrity-legend"><ShieldCheck size={14} /> Integrity badges reflect latest verification</span></div></div>;
}

function TrailIcon({ kind }: { kind: TrailEvent['icon'] }) {
  const icons = { capture: Fingerprint, upload: Archive, verify: ShieldCheck, view: Eye, share: Send, seal: LockKeyhole };
  const Icon = icons[kind];
  return <div className={`trail-icon trail-${kind}`}><Icon size={16} /></div>;
}

function ShareModal({ doc, onClose, onToast }: { doc: Document; onClose: () => void; onToast: (message: string, tone?: ToastTone) => void }) {
  const [scope, setScope] = useState('Assigned case team');
  const [recipient, setRecipient] = useState('');
  return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="share-title"><div className="modal-card"><div className="modal-head"><div><span className="eyebrow">Controlled action</span><h2 id="share-title">Share document</h2></div><button className="icon-button" onClick={onClose} aria-label="Close share dialog" data-testid="button-close-share"><X size={18} /></button></div><p className="modal-description">Grant scoped access to <strong>{doc.name}</strong>. Sharing is recorded in the chain of custody.</p><label className="modal-label">Recipient or team<input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Name, role, or team" data-testid="input-share-recipient" /></label><label className="modal-label">Access scope<select value={scope} onChange={(e) => setScope(e.target.value)} data-testid="select-share-scope"><option>Assigned case team</option><option>Prosecution counsel only</option><option>Specific court registry user</option><option>View once · expires in 24 hours</option></select></label><div className="share-notice"><LockKeyhole size={15} /><span>Recipients can view this copy. The original remains sealed and cannot be edited.</span></div><div className="modal-actions"><button className="button button-secondary" onClick={onClose} data-testid="button-cancel-share">Cancel</button><button className="button button-primary" onClick={() => { onToast(`Access shared with ${recipient || 'the selected scope'}`); onClose(); }} data-testid="button-confirm-share"><Send size={15} /> Share securely</button></div></div></div>;
}

function DocumentPage({ onToast }: { onToast: (message: string, tone?: ToastTone) => void }) {
  const { id = '', docId = '' } = useParams();
  const [, setLocation] = useLocation();
  const item = cases.find((entry) => entry.id === id) || cases[0];
  const doc = documents.find((entry) => entry.id === docId) || documents.find((entry) => entry.caseId === item.id) || documents[0];
  const [shareOpen, setShareOpen] = useState(false);
  const [verified, setVerified] = useState(doc.status === 'Verified');
  const trail = trailByDocument[doc.id] || fallbackTrail;
  return <div className="page page-document"><Breadcrumbs items={[{ label: item.number, href: `/case/${item.id}` }, { label: 'Documents', href: `/case/${item.id}/documents` }, { label: doc.name }]} /><div className="document-view-header"><button className="back-link" onClick={() => setLocation(`/case/${item.id}/documents`)} data-testid="button-back-documents"><ArrowLeft size={16} /> Back to documents</button><div className="document-actions"><button className="button button-secondary" onClick={() => onToast('Download prepared securely', 'info')} data-testid="button-download-document"><Download size={16} /> Download</button><button className="button button-secondary" onClick={() => setShareOpen(true)} data-testid="button-share-document"><UsersRound size={16} /> Share</button><button className="button button-primary" onClick={() => { setVerified(true); onToast('Integrity verified against the original hash'); }} data-testid="button-verify-document"><ShieldCheck size={16} /> {verified ? 'Verified' : 'Verify integrity'}</button></div></div><div className="document-title"><div className="file-icon file-icon-large"><FileText size={24} /></div><div><div className="eyebrow">{doc.category} <span className="eyebrow-rule" /></div><h1>{doc.name}</h1><p>{item.title} <span className="dot-separator" /> Added {doc.date}</p></div><StatusBadge status={verified ? 'Verified' : doc.status} /></div><div className="document-layout"><section className="document-preview-panel"><div className="preview-bar"><span><Eye size={15} /> Preview</span><span>Page 1 of {doc.pages}</span><div><button aria-label="Zoom out" data-testid="button-zoom-out">−</button><span>100%</span><button aria-label="Zoom in" data-testid="button-zoom-in">+</button></div></div><div className="preview-canvas"><div className="paper"><div className="paper-header"><span>IN THE {item.court.toUpperCase()}</span><span>Exhibit {doc.category === 'Evidence' ? 'E-04' : 'A-01'}</span></div><div className="paper-rule" /><div className="paper-title">{doc.name.toUpperCase()}</div><p className="paper-center">Certified digital copy · NyayaVault record</p><div className="paper-block"><span className="paper-line wide" /><span className="paper-line" /><span className="paper-line medium" /></div><div className="paper-block"><span className="paper-line" /><span className="paper-line wide" /><span className="paper-line short" /><span className="paper-line" /></div><div className="paper-stamp"><ShieldCheck size={21} /><span>HASH VERIFIED</span></div><div className="paper-footer"><span>Record {doc.id.toUpperCase()}</span><span>Page 1</span></div></div></div><div className="preview-footer"><span><LockKeyhole size={14} /> Read-only preview · Original file sealed</span><button onClick={() => onToast('Opening print-safe preview', 'info')} data-testid="button-print-preview"><FileText size={14} /> Print-safe view</button></div></section><aside className="document-sidebar"><section className="detail-card"><div className="card-title-row"><span className="section-kicker">Record details</span><MoreHorizontal size={17} className="muted-icon" /></div><dl className="detail-list"><div><dt>Document type</dt><dd>{doc.category}</dd></div><div><dt>File size</dt><dd>{doc.size}</dd></div><div><dt>Pages</dt><dd>{doc.pages}</dd></div><div><dt>Record ID</dt><dd className="mono">{doc.id}</dd></div></dl></section><section className="detail-card hash-card"><div className="card-title-row"><span className="section-kicker">Integrity record</span><CheckCircle2 size={17} className="icon-teal" /></div><p>SHA-256 fingerprint</p><div className="hash-value">{doc.hash}<button onClick={() => { navigator.clipboard?.writeText(doc.hash); onToast('Hash copied to clipboard'); }} aria-label="Copy fingerprint" data-testid="button-copy-hash"><Copy size={14} /></button></div><div className="hash-status"><span className="live-dot" /> {verified ? 'Matches original record' : 'Verification pending'}</div></section><section className="detail-card"><div className="card-title-row"><span className="section-kicker">Permissions</span><KeyRound size={17} className="muted-icon" /></div><div className="permission-row"><div className="avatar avatar-tiny">PN</div><div><strong>Priya Nair</strong><span>View · Download · Share</span></div><span className="you-label">You</span></div><div className="permission-row"><div className="avatar avatar-tiny registry">CR</div><div><strong>Court registry</strong><span>View · Seal</span></div></div></section></aside></div><section className="chain-section"><div className="chain-heading"><div><span className="section-kicker">Audit trail</span><h2>Chain of custody</h2><p>An unbroken record of where this evidence came from and who has accessed it.</p></div><div className="chain-integrity"><CheckCircle2 size={18} /><div><strong>Chain intact</strong><span>{trail.length} recorded events</span></div></div></div><div className="timeline">{trail.map((event, index) => <div className="timeline-item" key={`${event.title}-${event.time}`}><div className="timeline-rail"><TrailIcon kind={event.icon} />{index !== trail.length - 1 && <span className="timeline-line" />}</div><div className="timeline-body"><div className="timeline-top"><div><h3>{event.title}{event.verified && <span className="verified-check"><Check size={12} /></span>}</h3><p>{event.detail}</p></div><time>{event.time}</time></div><div className="actor"><div className="avatar avatar-tiny">{event.actor === 'You' ? 'PN' : event.actor.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div><span><strong>{event.actor}</strong><small>{event.role}</small></span></div></div></div>)}</div></section>{shareOpen && <ShareModal doc={doc} onClose={() => setShareOpen(false)} onToast={onToast} />}</div>;
}

function ProfilePage({ onToast, onLogout }: { onToast: (message: string, tone?: ToastTone) => void; onLogout: () => void }) {
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  return <div className="page"><PageHeading eyebrow="Account" title="My profile" description="Your identity, access scope, and recent activity in NyayaVault." /><div className="profile-layout"><section className="profile-main"><div className="profile-card identity-card"><div className="identity-top"><div className="avatar avatar-profile">PN</div><div><h2>Priya Nair</h2><p>Assistant public prosecutor</p><span className="role-chip"><ShieldCheck size={13} /> Authorized personnel</span></div><button className="button button-secondary" onClick={() => onToast('Profile editing is restricted to administrators', 'info')} data-testid="button-edit-profile">Edit profile</button></div><div className="identity-details"><div><span>Organization</span><strong>Office of the Public Prosecutor</strong></div><div><span>Jurisdiction</span><strong>High Court of Delhi</strong></div><div><span>Workspace role</span><strong>Case reviewer</strong></div><div><span>Last sign in</span><strong>12 Jun 2024 · 08:56 IST</strong></div></div></div><div className="profile-card"><div className="card-title-row"><div><span className="section-kicker">Security</span><h2>Sign-in and access</h2></div><LockKeyhole size={18} className="muted-icon" /></div><div className="security-row"><div className="security-icon"><KeyRound size={17} /></div><div><strong>Password</strong><span>Last changed 42 days ago</span></div><button className="button button-quiet" onClick={() => setPasswordOpen(!passwordOpen)} data-testid="button-change-password">{passwordOpen ? 'Cancel' : 'Change password'}</button></div>{passwordOpen && <div className="password-form"><label>Current password<input type="password" data-testid="input-current-password" /></label><label>New password<input type="password" data-testid="input-new-password" /></label><label>Confirm new password<input type="password" data-testid="input-confirm-password" /></label><button className="button button-primary" onClick={() => { setSaved(true); setPasswordOpen(false); onToast('Password changed successfully'); }} data-testid="button-save-password">Save new password</button></div>}<div className="security-row"><div className="security-icon teal-bg"><ShieldCheck size={17} /></div><div><strong>Two-factor authentication</strong><span>Authenticator app · Active</span></div><span className="active-label">Active</span></div></div><div className="profile-card activity-profile"><div className="card-title-row"><div><span className="section-kicker">Your activity</span><h2>Recent access</h2></div><Link href="/home" className="text-link" data-testid="link-profile-dashboard">Dashboard <ArrowRight size={14} /></Link></div><div className="profile-activity-list"><div><div className="activity-icon"><Eye size={15} /></div><span><strong>Viewed Device extraction report</strong><small>CRL.A. 0817 / 2024 · Today at 14:28</small></span></div><div><div className="activity-icon"><ShieldCheck size={15} /></div><span><strong>Verified Forensic ledger export</strong><small>FIR 118 / 2023 · Today at 13:57</small></span></div><div><div className="activity-icon"><Send size={15} /></div><span><strong>Shared Affidavit of N. Kapoor</strong><small>CRL.A. 0817 / 2024 · Yesterday at 16:05</small></span></div></div></div></section><aside className="profile-side"><div className="scope-card"><div className="scope-card-top"><div className="scope-symbol"><LockKeyhole size={21} /></div><span className="live-dot" /></div><span className="section-kicker">Access scope</span><h3>Prosecution desk</h3><p>You can access 12 active cases and their associated evidence records.</p><div className="scope-stat"><strong>12</strong><span>active cases</span></div><div className="scope-stat"><strong>86</strong><span>documents accessible</span></div><button className="button button-outline-light" onClick={() => onToast('Access scope is managed by your organization administrator', 'info')} data-testid="button-view-access-scope">View access policy <ArrowRight size={14} /></button></div><div className="logout-card"><div><strong>End your session</strong><span>Sign out of this workspace on this device.</span></div><button className="icon-button danger-icon" onClick={onLogout} aria-label="Sign out" data-testid="button-logout-profile"><LogOut size={17} /></button></div></aside></div>{saved && <span className="sr-only">Password saved</span>}</div>;
}

function LoginPage({ onLogin, onToast }: { onLogin: () => void; onToast: (message: string, tone?: ToastTone) => void }) {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [robot, setRobot] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [error, setError] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);
  const submit = () => {
    if (!username || !password) return setError('Enter your username and password to continue.');
    if (username !== 'demo' || password !== 'nyaya2024') return setError('Those credentials do not match our demo account.');
     if (!robot) return setError('Confirm that you are not a robot before signing in.');
    localStorage.setItem('nyayavault-auth', 'true'); onLogin(); setLocation('/home');
  };
  if (forgot) return <div className="login-page"><div className="login-aside"><Logo /><div className="login-aside-copy"><div className="seal-large"><ShieldCheck size={32} /></div><span className="eyebrow">Controlled evidence workspace</span><h2>Every record has a history.<br /><em>Nothing gets lost.</em></h2><p>NyayaVault keeps the evidence trail clear, verified, and accountable for the people responsible for justice.</p></div><span className="login-aside-foot">Private system · Authorized users only</span></div><main className="login-main"><div className="login-mobile-logo"><Logo /></div><div className="login-form-wrap"><button className="back-link" onClick={() => { setForgot(false); setRecoverySent(false); }} data-testid="button-back-login"><ArrowLeft size={16} /> Back to sign in</button>{recoverySent ? <div className="recovery-success"><div className="success-icon"><CheckCircle2 size={25} /></div><span className="eyebrow">Request received</span><h1>Check your inbox.</h1><p>If an authorized account exists for <strong>{recoveryEmail}</strong>, we have sent a secure recovery link.</p><button className="button button-primary full-width" onClick={() => { setForgot(false); setRecoverySent(false); }} data-testid="button-return-login">Return to sign in</button></div> : <><div className="eyebrow">Account recovery</div><h1>Reset your access</h1><p className="login-lead">Enter your work email and we’ll send instructions to recover your NyayaVault account.</p><label>Work email<input type="email" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} placeholder="name@department.gov.in" data-testid="input-recovery-email" /></label><button className="button button-primary full-width" onClick={() => recoveryEmail.includes('@') ? setRecoverySent(true) : onToast('Enter a valid work email address', 'warning')} data-testid="button-send-recovery">Send recovery instructions <ArrowRight size={16} /></button></>}</div><AuthorizedFooter /></main></div>;
   return <div className="login-page"><div className="login-aside"><Logo /><div className="login-aside-copy"><div className="seal-large"><ShieldCheck size={32} /></div><span className="eyebrow">Controlled evidence workspace</span><h2>Every record has a history.<br /><em>Nothing gets lost.</em></h2><p>NyayaVault keeps the evidence trail clear, verified, and accountable for the people responsible for justice.</p><div className="login-trust-list"><span><CheckCircle2 size={15} /> Immutable audit trail</span><span><CheckCircle2 size={15} /> Scoped access by role</span><span><CheckCircle2 size={15} /> Hash-verified records</span></div></div><span className="login-aside-foot">Private system · Authorized users only</span></div><main className="login-main"><div className="login-mobile-logo"><Logo /></div><div className="login-form-wrap"><div className="eyebrow">Authorized access <span className="eyebrow-rule" /></div><h1>Welcome back.</h1><p className="login-lead">Sign in to your secure justice workspace.</p><div className="demo-note"><div className="demo-note-icon"><KeyRound size={15} /></div><div><strong>Demo access</strong><span>Username <b>demo</b> · Password <b>nyaya2024</b></span></div></div><label>Username<input value={username} onChange={(e) => { setUsername(e.target.value); setError(''); }} placeholder="Enter your username" autoComplete="username" data-testid="input-username" /></label><label>Password<div className="password-input"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} placeholder="Enter your password" autoComplete="current-password" data-testid="input-password" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} data-testid="button-toggle-password">{showPassword ? <Eye size={17} /> : <Eye size={17} />}</button></div></label><div className="login-options"><label className="checkbox-label"><input type="checkbox" checked={robot} onChange={(e) => { setRobot(e.target.checked); setError(''); }} data-testid="checkbox-robot" /><span className="custom-checkbox">{robot && <Check size={12} />}</span><span>I'm not a robot</span></label><button className="text-button" onClick={() => setForgot(true)} data-testid="button-forgot-password">Forgot password?</button></div>{error && <div className="form-error" role="alert"><AlertCircle size={15} />{error}</div>}<button className="button button-primary full-width login-button" onClick={submit} data-testid="button-sign-in">Sign in securely <ArrowRight size={16} /></button><div className="login-security-note"><LockKeyhole size={14} /><span>Authorized personnel only · All access is logged</span></div></div><AuthorizedFooter /></main></div>;
}

function AuthorizedFooter() {
  return <footer className="authorized-footer"><span><LockKeyhole size={13} /> Authorized personnel only · All access is logged</span><span>NyayaVault prototype · v0.9</span></footer>;
}

function NotFoundPage() {
  return <div className="not-found"><Logo /><div className="empty-icon"><FileSearch size={25} /></div><h1>That record is not available.</h1><p>The page may have moved, or your access scope may not include it.</p><Link href="/home" className="button button-primary" data-testid="link-not-found-home">Return to workspace</Link></div>;
}

function App() {
  const [authed, setAuthed] = useState(() => localStorage.getItem('nyayavault-auth') === 'true');
  const [toast, setToast] = useState<ToastState>(null);
  const [casesList, setCasesList] = useState<Case[]>(cases);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/cases')
      .then((res) => {
        if (!res.ok) throw new Error('API offline');
        return res.json();
      })
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCasesList(data);
        }
      })
      .catch(() => {
        // Fall back gracefully to mock cases
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(null), 3600); return () => window.clearTimeout(timer); }, [toast]);
  const onToast = (message: string, tone: ToastTone = 'success') => setToast({ message, tone });
  const logout = () => { localStorage.removeItem('nyayavault-auth'); setAuthed(false); onToast('You have been signed out'); };

  return <>
    <Switch>
      <Route path="/"><LoginPage onLogin={() => setAuthed(true)} onToast={onToast} /></Route>
      {authed && (
        <>
          <Route path="/home">
            <AppShell onLogout={logout} onToast={onToast} casesList={casesList}>
              <HomePage casesList={casesList} loading={loading} onToast={onToast} />
            </AppShell>
          </Route>
          <Route path="/search">
            <AppShell onLogout={logout} onToast={onToast} casesList={casesList}>
              <SearchPage casesList={casesList} />
            </AppShell>
          </Route>
          <Route path="/case/:id/documents/:docId">
            <AppShell onLogout={logout} onToast={onToast} casesList={casesList}>
              <DocumentPage onToast={onToast} />
            </AppShell>
          </Route>
          <Route path="/case/:id/documents">
            <AppShell onLogout={logout} onToast={onToast} casesList={casesList}>
              <DocumentsPage />
            </AppShell>
          </Route>
          <Route path="/case/:id">
            <AppShell onLogout={logout} onToast={onToast} casesList={casesList}>
              <CasePage casesList={casesList} />
            </AppShell>
          </Route>
          <Route path="/profile">
            <AppShell onLogout={logout} onToast={onToast} casesList={casesList}>
              <ProfilePage onToast={onToast} onLogout={logout} />
            </AppShell>
          </Route>
        </>
      )}
      <Route>{authed ? <NotFoundPage /> : <LoginPage onLogin={() => setAuthed(true)} onToast={onToast} />}</Route>
    </Switch>
    <Toast toast={toast} onClose={() => setToast(null)} />
  </>;
}

export default App;