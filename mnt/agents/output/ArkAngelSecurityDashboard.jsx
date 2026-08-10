/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ARK ANGEL SECURITY SHIELD — REACT DASHBOARD COMPONENT
 * Bridges into: https://ai.studio/apps/1195ddb6-4473-4e43-90c1-2d11440022df
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, AlertTriangle, CheckCircle, XCircle, 
  Activity, Lock, Server, Globe, FileCode, 
  Container, Zap, Search, Bell, TrendingUp,
  Clock, Database, Cloud, Key, Bug, Award,
  BarChart3, PieChart, AlertOctagon, Eye,
  Cpu, Network, Fingerprint, Folders,
  GitBranch, Package, HardDrive, Terminal
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// THEME & DESIGN TOKENS — Ark Angel Brand
// ═══════════════════════════════════════════════════════════════════════════════

const theme = {
  colors: {
    primary: '#6366f1',      // Indigo 500
    primaryDark: '#4f46e5',  // Indigo 600
    secondary: '#06b6d4',    // Cyan 500
    accent: '#f59e0b',       // Amber 500
    danger: '#ef4444',       // Red 500
    warning: '#f97316',      // Orange 500
    success: '#22c55e',      // Green 500
    info: '#3b82f6',         // Blue 500
    dark: '#0f172a',         // Slate 900
    darker: '#020617',       // Slate 950
    card: '#1e293b',         // Slate 800
    border: '#334155',       // Slate 700
    text: '#f8fafc',         // Slate 50
    textMuted: '#94a3b8',    // Slate 400
    textDim: '#64748b',      // Slate 500
    glow: {
      primary: '0 0 20px rgba(99, 102, 241, 0.3)',
      danger: '0 0 20px rgba(239, 68, 68, 0.3)',
      success: '0 0 20px rgba(34, 197, 94, 0.3)',
      warning: '0 0 20px rgba(245, 158, 11, 0.3)'
    }
  },
  fonts: {
    heading: "'Inter', 'SF Pro Display', system-ui, sans-serif",
    body: "'Inter', 'SF Pro Text', system-ui, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace"
  },
  spacing: {
    xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', xxl: '48px'
  },
  borderRadius: {
    sm: '6px', md: '10px', lg: '16px', xl: '24px', full: '9999px'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA — Replace with real API calls to AASS backend
// ═══════════════════════════════════════════════════════════════════════════════

const mockData = {
  overallScore: 87,
  riskTrend: [72, 75, 78, 82, 80, 85, 87],
  modules: [
    { id: 'sast', name: 'Seraphim SAST', status: 'active', score: 92, findings: 3, icon: FileCode, color: theme.colors.primary },
    { id: 'sca', name: 'Cherubim SCA', status: 'active', score: 88, findings: 7, icon: Package, color: theme.colors.secondary },
    { id: 'cspm', name: 'Guardian CSPM', status: 'active', score: 85, findings: 12, icon: Cloud, color: theme.colors.info },
    { id: 'dast', name: 'Vanguard DAST', status: 'active', score: 90, findings: 2, icon: Globe, color: theme.colors.success },
    { id: 'secrets', name: 'Oracle Secrets', status: 'warning', score: 65, findings: 8, icon: Key, color: theme.colors.warning },
    { id: 'iac', name: 'Sentinel IaC', status: 'active', score: 94, findings: 1, icon: Server, color: theme.colors.primaryDark },
    { id: 'container', name: 'Vanguard Container', status: 'active', score: 91, findings: 4, icon: Container, color: theme.colors.secondary },
    { id: 'runtime', name: 'Shield Runtime', status: 'active', score: 96, findings: 0, icon: Shield, color: theme.colors.success },
    { id: 'pentest', name: 'Prophet Pentest', status: 'active', score: 89, findings: 5, icon: Bug, color: theme.colors.danger },
    { id: 'compliance', name: 'Archangel Compliance', status: 'active', score: 82, findings: 15, icon: Award, color: theme.colors.accent }
  ],
  recentEvents: [
    { id: 1, type: 'shield.injection.blocked', severity: 'critical', module: 'runtime', message: 'SQL injection attempt blocked on /api/v1/orders', time: '2 min ago', icon: Shield },
    { id: 2, type: 'oracle.secret.leaked', severity: 'critical', module: 'secrets', message: 'Binance API key detected in commit a3f9d2', time: '15 min ago', icon: Key },
    { id: 3, type: 'prophet.exploit.confirmed', severity: 'high', module: 'pentest', message: 'JWT null-byte injection confirmed exploitable', time: '1 hr ago', icon: Bug },
    { id: 4, type: 'seraphim.autofix.generated', severity: 'medium', module: 'sast', message: 'AutoFix PR #2842 created for CWE-89 in order-service', time: '2 hrs ago', icon: GitBranch },
    { id: 5, type: 'guardian.asset.discovered', severity: 'low', module: 'dast', message: 'New subdomain trading-api-v2.arkangel.dev discovered', time: '3 hrs ago', icon: Globe },
    { id: 6, type: 'cherubim.reachability.verified', severity: 'high', module: 'sca', message: 'CVE-2024-1234 in lodash confirmed reachable from strategy-engine', time: '4 hrs ago', icon: Network },
    { id: 7, type: 'compliance.audit.completed', severity: 'info', module: 'compliance', message: 'SOC2 Type II audit completed — 3 gaps identified', time: '6 hrs ago', icon: Award },
    { id: 8, type: 'warden.malware.blocked', severity: 'critical', module: 'sca', message: 'Malicious package "crypto-utils-fake" blocked from build', time: '8 hrs ago', icon: AlertOctagon }
  ],
  findingsBySeverity: {
    critical: 4,
    high: 12,
    medium: 28,
    low: 45,
    info: 67
  },
  attackSurface: {
    totalAssets: 47,
    newAssets: 3,
    forgottenAssets: 2,
    publicEndpoints: 12,
    authenticatedEndpoints: 35
  },
  complianceStatus: {
    soc2: { score: 88, status: 'compliant', nextAudit: '2026-10-15' },
    iso27001: { score: 92, status: 'compliant', nextAudit: '2026-11-20' },
    gdpr: { score: 85, status: 'needs-improvement', nextAudit: '2026-09-01' },
    'pci-dss': { score: 79, status: 'needs-improvement', nextAudit: '2026-08-30' }
  },
  runtimeStats: {
    totalRequests: 2847392,
    blockedRequests: 1847,
    avgLatency: 12,
    activeConnections: 3421
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// STYLED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

const styles = {
  dashboard: {
    background: theme.colors.darker,
    color: theme.colors.text,
    fontFamily: theme.fonts.body,
    minHeight: '100vh',
    padding: theme.spacing.lg,
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: theme.spacing.lg
  },
  sidebar: {
    background: theme.colors.dark,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    border: `1px solid ${theme.colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.lg
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    background: theme.colors.dark,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.border}`
  },
  scoreCard: {
    background: theme.colors.dark,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    border: `1px solid ${theme.colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing.md,
    position: 'relative',
    overflow: 'hidden'
  },
  moduleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: theme.spacing.md
  },
  moduleCard: {
    background: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    border: `1px solid ${theme.colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  },
  eventList: {
    background: theme.colors.dark,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    border: `1px solid ${theme.colors.border}`,
    maxHeight: '500px',
    overflow: 'auto'
  },
  eventItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    padding: `${theme.spacing.md} 0`,
    borderBottom: `1px solid ${theme.colors.border}`,
    transition: 'background 0.2s ease'
  },
  severityBadge: (severity) => ({
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.full,
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    background: severity === 'critical' ? 'rgba(239, 68, 68, 0.15)' : 
                 severity === 'high' ? 'rgba(249, 115, 22, 0.15)' :
                 severity === 'medium' ? 'rgba(245, 158, 11, 0.15)' :
                 severity === 'low' ? 'rgba(59, 130, 246, 0.15)' :
                 'rgba(148, 163, 184, 0.15)',
    color: severity === 'critical' ? theme.colors.danger :
           severity === 'high' ? theme.colors.warning :
           severity === 'medium' ? theme.colors.accent :
           severity === 'low' ? theme.colors.info :
           theme.colors.textMuted
  }),
  progressRing: {
    width: '140px',
    height: '140px',
    position: 'relative'
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: theme.spacing.md
  },
  statCard: {
    background: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    border: `1px solid ${theme.colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xs
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

const ProgressRing = ({ score, size = 140, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  
  const getColor = (s) => {
    if (s >= 90) return theme.colors.success;
    if (s >= 80) return theme.colors.info;
    if (s >= 70) return theme.colors.accent;
    if (s >= 60) return theme.colors.warning;
    return theme.colors.danger;
  };

  return (
    <div style={styles.progressRing}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={theme.colors.border} strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={getColor(score)} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 6px ${getColor(score)})` }}
        />
      </svg>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '32px', fontWeight: 700, color: getColor(score), fontFamily: theme.fonts.mono }}>
          {score}
        </div>
        <div style={{ fontSize: '11px', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>
          Score
        </div>
      </div>
    </div>
  );
};

const ModuleCard = ({ module, onClick }) => {
  const Icon = module.icon;
  const isWarning = module.status === 'warning';
  
  return (
    <div 
      style={{
        ...styles.moduleCard,
        borderColor: isWarning ? theme.colors.warning : theme.colors.border,
        boxShadow: isWarning ? theme.colors.glow.warning : 'none'
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = module.color;
        e.currentTarget.style.boxShadow = `0 4px 20px rgba(0,0,0,0.3), 0 0 10px ${module.color}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = isWarning ? theme.colors.warning : theme.colors.border;
        e.currentTarget.style.boxShadow = isWarning ? theme.colors.glow.warning : 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: theme.borderRadius.md,
            background: `${module.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Icon size={20} color={module.color} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.text }}>{module.name}</div>
            <div style={{ fontSize: '12px', color: theme.colors.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: module.status === 'active' ? theme.colors.success : theme.colors.warning,
                boxShadow: `0 0 6px ${module.status === 'active' ? theme.colors.success : theme.colors.warning}`
              }} />
              {module.status === 'active' ? 'Active' : 'Warning'}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: module.color, fontFamily: theme.fonts.mono }}>
            {module.score}
          </div>
          <div style={{ fontSize: '11px', color: theme.colors.textMuted }}>Score</div>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: theme.spacing.sm }}>
        <div style={{ fontSize: '12px', color: theme.colors.textMuted }}>
          {module.findings} {module.findings === 1 ? 'finding' : 'findings'}
        </div>
        <div style={{
          width: `${module.score}%`, height: '4px', background: module.color,
          borderRadius: theme.borderRadius.full, opacity: 0.6
        }} />
      </div>
    </div>
  );
};

const EventFeed = ({ events }) => {
  const getEventIcon = (type) => {
    if (type.includes('shield')) return Shield;
    if (type.includes('secret')) return Key;
    if (type.includes('exploit')) return Bug;
    if (type.includes('autofix')) return GitBranch;
    if (type.includes('asset')) return Globe;
    if (type.includes('reachability')) return Network;
    if (type.includes('compliance')) return Award;
    if (type.includes('malware')) return AlertOctagon;
    return Activity;
  };

  return (
    <div style={styles.eventList}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
          <Activity size={18} color={theme.colors.primary} />
          Live Event Feed
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.colors.success, animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '12px', color: theme.colors.textMuted }}>Live</span>
        </div>
      </div>
      
      {events.map(event => {
        const EventIcon = getEventIcon(event.type);
        return (
          <div key={event.id} style={styles.eventItem}>
            <div style={{
              width: '36px', height: '36px', borderRadius: theme.borderRadius.md,
              background: event.severity === 'critical' ? 'rgba(239, 68, 68, 0.1)' :
                         event.severity === 'high' ? 'rgba(249, 115, 22, 0.1)' :
                         'rgba(99, 102, 241, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <EventIcon size={16} color={
                event.severity === 'critical' ? theme.colors.danger :
                event.severity === 'high' ? theme.colors.warning :
                theme.colors.primary
              } />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm, marginBottom: '2px' }}>
                <span style={styles.severityBadge(event.severity)}>{event.severity}</span>
                <span style={{ fontSize: '11px', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {event.module}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: theme.colors.text, lineHeight: 1.4 }}>
                {event.message}
              </div>
              <div style={{ fontSize: '11px', color: theme.colors.textDim, marginTop: '2px' }}>
                {event.time}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const SeverityBar = ({ data }) => {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  const colors = {
    critical: theme.colors.danger,
    high: theme.colors.warning,
    medium: theme.colors.accent,
    low: theme.colors.info,
    info: theme.colors.textMuted
  };

  return (
    <div style={{ background: theme.colors.dark, borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, border: `1px solid ${theme.colors.border}` }}>
      <h3 style={{ margin: `0 0 ${theme.spacing.md} 0`, fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
        <BarChart3 size={18} color={theme.colors.primary} />
        Findings by Severity
      </h3>
      <div style={{ display: 'flex', height: '32px', borderRadius: theme.borderRadius.sm, overflow: 'hidden', marginBottom: theme.spacing.md }}>
        {Object.entries(data).map(([severity, count]) => (
          <div 
            key={severity}
            style={{
              width: `${(count / total) * 100}%`,
              background: colors[severity],
              transition: 'width 0.5s ease'
            }}
            title={`${severity}: ${count}`}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: theme.spacing.sm }}>
        {Object.entries(data).map(([severity, count]) => (
          <div key={severity} style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: colors[severity] }} />
            <span style={{ fontSize: '12px', color: theme.colors.textMuted, textTransform: 'capitalize' }}>
              {severity}: <strong style={{ color: theme.colors.text }}>{count}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CompliancePanel = ({ data }) => {
  return (
    <div style={{ background: theme.colors.dark, borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, border: `1px solid ${theme.colors.border}` }}>
      <h3 style={{ margin: `0 0 ${theme.spacing.md} 0`, fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
        <Award size={18} color={theme.colors.accent} />
        Compliance Status
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
        {Object.entries(data).map(([framework, info]) => (
          <div key={framework} style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
            <div style={{ width: '80px', fontSize: '13px', fontWeight: 600, color: theme.colors.text, textTransform: 'uppercase' }}>
              {framework}
            </div>
            <div style={{ flex: 1, height: '8px', background: theme.colors.border, borderRadius: theme.borderRadius.full, overflow: 'hidden' }}>
              <div style={{
                width: `${info.score}%`,
                height: '100%',
                background: info.score >= 80 ? theme.colors.success : info.score >= 60 ? theme.colors.warning : theme.colors.danger,
                borderRadius: theme.borderRadius.full,
                transition: 'width 0.5s ease'
              }} />
            </div>
            <div style={{ width: '40px', textAlign: 'right', fontSize: '13px', fontWeight: 700, color: theme.colors.text, fontFamily: theme.fonts.mono }}>
              {info.score}
            </div>
            <div style={{
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              borderRadius: theme.borderRadius.full,
              fontSize: '11px',
              fontWeight: 600,
              background: info.status === 'compliant' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: info.status === 'compliant' ? theme.colors.success : theme.colors.warning
            }}>
              {info.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const RuntimeStats = ({ data }) => {
  const stats = [
    { label: 'Total Requests', value: data.totalRequests.toLocaleString(), icon: Activity, color: theme.colors.primary },
    { label: 'Blocked', value: data.blockedRequests.toLocaleString(), icon: Shield, color: theme.colors.danger },
    { label: 'Avg Latency', value: `${data.avgLatency}ms`, icon: Clock, color: theme.colors.success },
    { label: 'Connections', value: data.activeConnections.toLocaleString(), icon: Network, color: theme.colors.secondary }
  ];

  return (
    <div style={styles.statsRow}>
      {stats.map(stat => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} style={styles.statCard}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.xs }}>
              <span style={{ fontSize: '12px', color: theme.colors.textMuted }}>{stat.label}</span>
              <Icon size={16} color={stat.color} />
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: theme.colors.text, fontFamily: theme.fonts.mono }}>
              {stat.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const ArkAngelSecurityDashboard = () => {
  const [selectedModule, setSelectedModule] = useState(null);
  const [data, setData] = useState(mockData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // In production, connect to WebSocket for real-time events
    const interval = setInterval(() => {
      // Simulate live event feed updates
      setData(prev => ({
        ...prev,
        runtimeStats: {
          ...prev.runtimeStats,
          totalRequests: prev.runtimeStats.totalRequests + Math.floor(Math.random() * 100)
        }
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleModuleClick = (module) => {
    setSelectedModule(module);
  };

  const handleScanTrigger = async (moduleId) => {
    setIsLoading(true);
    // In production: await api.triggerScan(moduleId);
    await new Promise(r => setTimeout(r, 1500));
    setIsLoading(false);
  };

  return (
    <div style={styles.dashboard}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm, paddingBottom: theme.spacing.md, borderBottom: `1px solid ${theme.colors.border}` }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: theme.borderRadius.md,
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: theme.colors.glow.primary
          }}>
            <Shield size={22} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: theme.colors.text }}>Ark Angel</div>
            <div style={{ fontSize: '11px', color: theme.colors.textMuted, letterSpacing: '1px' }}>SECURITY SHIELD</div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
          {[
            { label: 'Dashboard', icon: BarChart3, active: true },
            { label: 'Findings', icon: AlertTriangle },
            { label: 'Modules', icon: Cpu },
            { label: 'Attack Surface', icon: Globe },
            { label: 'Compliance', icon: Award },
            { label: 'Runtime', icon: Activity },
            { label: 'Settings', icon: Folders }
          ].map(item => (
            <button key={item.label} style={{
              display: 'flex', alignItems: 'center', gap: theme.spacing.sm,
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              borderRadius: theme.borderRadius.md,
              border: 'none',
              background: item.active ? `${theme.colors.primary}15` : 'transparent',
              color: item.active ? theme.colors.primary : theme.colors.textMuted,
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}>
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: theme.spacing.md, background: `${theme.colors.danger}10`, borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.danger}30` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.xs }}>
            <AlertOctagon size={16} color={theme.colors.danger} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: theme.colors.danger }}>Critical Alert</span>
          </div>
          <div style={{ fontSize: '12px', color: theme.colors.textMuted, lineHeight: 1.5 }}>
            4 critical findings require immediate attention. Estimated fix time: 2 hours.
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: theme.colors.text }}>
              Security Dashboard
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: theme.colors.textMuted }}>
              Real-time security posture for Ark Angel Trading Platform
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs, padding: `${theme.spacing.xs} ${theme.spacing.md}`, background: `${theme.colors.success}15`, borderRadius: theme.borderRadius.full }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.colors.success, boxShadow: `0 0 8px ${theme.colors.success}` }} />
              <span style={{ fontSize: '12px', color: theme.colors.success, fontWeight: 600 }}>All Systems Operational</span>
            </div>
            <button style={{
              padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
              background: theme.colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm,
              boxShadow: theme.colors.glow.primary
            }}>
              <Zap size={16} />
              Run Full Scan
            </button>
          </div>
        </div>

        {/* Top Row: Score + Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: theme.spacing.lg }}>
          <div style={styles.scoreCard}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Overall Security Score
            </div>
            <ProgressRing score={data.overallScore} />
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs, fontSize: '13px', color: theme.colors.success }}>
              <TrendingUp size={14} />
              <span>+5 from last week</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
            <RuntimeStats data={data.runtimeStats} />
            <SeverityBar data={data.findingsBySeverity} />
          </div>
        </div>

        {/* Module Grid */}
        <div>
          <h2 style={{ margin: `0 0 ${theme.spacing.md} 0`, fontSize: '18px', fontWeight: 600, color: theme.colors.text, display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
            <Cpu size={20} color={theme.colors.primary} />
            Security Modules
          </h2>
          <div style={styles.moduleGrid}>
            {data.modules.map(module => (
              <ModuleCard 
                key={module.id} 
                module={module} 
                onClick={() => handleModuleClick(module)}
              />
            ))}
          </div>
        </div>

        {/* Bottom Row: Events + Compliance */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: theme.spacing.lg }}>
          <EventFeed events={data.recentEvents} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
            <CompliancePanel data={data.complianceStatus} />
            
            <div style={{ background: theme.colors.dark, borderRadius: theme.borderRadius.lg, padding: theme.spacing.lg, border: `1px solid ${theme.colors.border}` }}>
              <h3 style={{ margin: `0 0 ${theme.spacing.md} 0`, fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                <Eye size={18} color={theme.colors.secondary} />
                Attack Surface
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
                {[
                  { label: 'Total Assets', value: data.attackSurface.totalAssets, icon: Globe },
                  { label: 'New Assets', value: data.attackSurface.newAssets, icon: TrendingUp },
                  { label: 'Public Endpoints', value: data.attackSurface.publicEndpoints, icon: Lock },
                  { label: 'Auth Endpoints', value: data.attackSurface.authenticatedEndpoints, icon: Key }
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} style={{ textAlign: 'center', padding: theme.spacing.md, background: theme.colors.card, borderRadius: theme.borderRadius.md }}>
                      <Icon size={20} color={theme.colors.primary} style={{ marginBottom: theme.spacing.xs }} />
                      <div style={{ fontSize: '22px', fontWeight: 700, color: theme.colors.text, fontFamily: theme.fonts.mono }}>{item.value}</div>
                      <div style={{ fontSize: '11px', color: theme.colors.textMuted }}>{item.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(2, 6, 23, 0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, backdropFilter: 'blur(4px)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '48px', height: '48px',
              border: `3px solid ${theme.colors.border}`,
              borderTopColor: theme.colors.primary,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <div style={{ color: theme.colors.text, fontSize: '16px', fontWeight: 600 }}>Running Security Scan...</div>
            <div style={{ color: theme.colors.textMuted, fontSize: '13px', marginTop: '4px' }}>Analyzing code, cloud, and runtime</div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${theme.colors.border}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${theme.colors.textMuted}; }
      `}</style>
    </div>
  );
};

export default ArkAngelSecurityDashboard;
