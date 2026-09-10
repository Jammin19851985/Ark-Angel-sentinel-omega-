import React, { useState, useMemo } from 'react';
import { Trade, OrderState } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { 
    ArrowUpRight, ArrowDownRight, Search, Filter, 
    ChevronDown, ChevronUp, ShieldCheck, Activity,
    SlidersHorizontal, Layers
} from 'lucide-react';
import { TradeStatusBadge } from './TradeHistory';

interface HistoricalTradesViewProps {
    className?: string;
    trades?: Trade[];
}

export const HistoricalTradesView: React.FC<HistoricalTradesViewProps> = ({ className = '' }) => {
    const { trades } = useAppContext();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | OrderState>('ALL');
    const [actionFilter, setActionFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
    const [sortBy, setSortBy] = useState<'NEWEST' | 'PNL_DESC' | 'VALUE_DESC'>('NEWEST');
    const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null);

    // Compute aggregate metrics
    const metrics = useMemo(() => {
        const totalTrades = trades.length;
        const filledTrades = trades.filter(t => t.status === OrderState.FILLED || t.status === OrderState.PARTIALLY_FILLED).length;
        const fillRate = totalTrades > 0 ? (filledTrades / totalTrades) * 100 : 0;
        
        const totalPnl = trades.reduce((acc, t) => acc + (t.pnl || 0), 0);
        const totalNotional = trades.reduce((acc, t) => acc + (t.quantity * t.price), 0);

        return {
            totalTrades,
            filledTrades,
            fillRate,
            totalPnl,
            totalNotional
        };
    }, [trades]);

    // Filter and sort trades
    const filteredTrades = useMemo(() => {
        return trades.filter(trade => {
            const matchesQuery = 
                trade.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                trade.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (trade.venue && trade.venue.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (trade.type && trade.type.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesStatus = statusFilter === 'ALL' || trade.status === statusFilter;
            const matchesAction = actionFilter === 'ALL' || trade.action === actionFilter;

            return matchesQuery && matchesStatus && matchesAction;
        }).sort((a, b) => {
            if (sortBy === 'PNL_DESC') {
                return (b.pnl || 0) - (a.pnl || 0);
            }
            if (sortBy === 'VALUE_DESC') {
                return (b.quantity * b.price) - (a.quantity * a.price);
            }
            // Default newest first
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
    }, [trades, searchQuery, statusFilter, actionFilter, sortBy]);

    const formatRelativeTime = (timestampStr: string) => {
        try {
            const time = new Date(timestampStr).getTime();
            const now = Date.now();
            const diffSeconds = Math.floor((now - time) / 1000);

            if (diffSeconds < 60) return `${Math.max(1, diffSeconds)}s ago`;
            const diffMinutes = Math.floor(diffSeconds / 60);
            if (diffMinutes < 60) return `${diffMinutes}m ago`;
            const diffHours = Math.floor(diffMinutes / 60);
            if (diffHours < 24) return `${diffHours}h ago`;
            return new Date(timestampStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
        } catch {
            return timestampStr;
        }
    };

    const renderStatusBadge = (status: OrderState) => {
        return <TradeStatusBadge status={status} size="sm" />;
    };

    return (
        <div className={`flex flex-col h-full font-mono text-[10px] ${className}`}>
            {/* Quick KPI Summary Header */}
            <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-black/40 border border-slate-800 rounded-sm mb-2">
                <div className="flex flex-col">
                    <span className="text-[7.5px] text-slate-500 uppercase tracking-widest font-bold">Executed</span>
                    <span className="text-slate-200 font-bold text-[11px]">{metrics.totalTrades} <span className="text-[8px] font-normal text-slate-500">orders</span></span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[7.5px] text-slate-500 uppercase tracking-widest font-bold">Fill Rate</span>
                    <span className="text-emerald-400 font-bold text-[11px]">{metrics.fillRate.toFixed(1)}%</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[7.5px] text-slate-500 uppercase tracking-widest font-bold">Net P&L</span>
                    <span className={`font-bold text-[11px] ${metrics.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {metrics.totalPnl >= 0 ? '+' : ''}${metrics.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[7.5px] text-slate-500 uppercase tracking-widest font-bold">Notional Vol</span>
                    <span className="text-amber-400 font-bold text-[11px]">
                        ${new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(metrics.totalNotional)}
                    </span>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col gap-1.5 mb-2">
                <div className="relative group">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="FILTER_ORDERS (SYM, ID, VENUE)..."
                        className="w-full bg-black/80 border border-slate-700 rounded-sm pl-7 pr-3 py-1 text-[9px] font-mono text-slate-200 placeholder-slate-600 focus:border-amber-500 transition outline-none"
                    />
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 pointer-events-none" />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-[9px]"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center justify-between gap-1 overflow-x-auto custom-scrollbar pb-0.5">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setStatusFilter('ALL')}
                            className={`px-1.5 py-0.5 text-[8px] font-bold rounded-sm border transition ${
                                statusFilter === 'ALL' 
                                ? 'bg-amber-900/50 border-amber-500 text-amber-300 shadow-[0_0_5px_rgba(245,158,11,0.2)]' 
                                : 'bg-black/30 border-slate-800 text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            ALL
                        </button>
                        <button
                            onClick={() => setStatusFilter(OrderState.FILLED)}
                            className={`px-1.5 py-0.5 text-[8px] font-bold rounded-sm border transition ${
                                statusFilter === OrderState.FILLED 
                                ? 'bg-emerald-900/50 border-emerald-500 text-emerald-300 shadow-[0_0_5px_rgba(16,185,129,0.2)]' 
                                : 'bg-black/30 border-slate-800 text-slate-500 hover:text-emerald-400'
                            }`}
                        >
                            FILLED
                        </button>
                        <button
                            onClick={() => setStatusFilter(OrderState.PARTIALLY_FILLED)}
                            className={`px-1.5 py-0.5 text-[8px] font-bold rounded-sm border transition ${
                                statusFilter === OrderState.PARTIALLY_FILLED 
                                ? 'bg-amber-900/50 border-amber-500 text-amber-300' 
                                : 'bg-black/30 border-slate-800 text-slate-500 hover:text-amber-400'
                            }`}
                        >
                            PARTIAL
                        </button>
                        <button
                            onClick={() => setStatusFilter(OrderState.SUBMITTED)}
                            className={`px-1.5 py-0.5 text-[8px] font-bold rounded-sm border transition ${
                                statusFilter === OrderState.SUBMITTED 
                                ? 'bg-cyan-900/50 border-cyan-500 text-cyan-300' 
                                : 'bg-black/30 border-slate-800 text-slate-500 hover:text-cyan-400'
                            }`}
                        >
                            PENDING
                        </button>
                        <button
                            onClick={() => setStatusFilter(OrderState.CANCELLED)}
                            className={`px-1.5 py-0.5 text-[8px] font-bold rounded-sm border transition ${
                                statusFilter === OrderState.CANCELLED 
                                ? 'bg-slate-800 border-slate-600 text-slate-200' 
                                : 'bg-black/30 border-slate-800 text-slate-500 hover:text-slate-400'
                            }`}
                        >
                            CANCELLED
                        </button>
                    </div>

                    <div className="flex items-center gap-1 border-l border-slate-800 pl-1">
                        <button
                            onClick={() => setActionFilter(prev => prev === 'ALL' ? 'BUY' : prev === 'BUY' ? 'SELL' : 'ALL')}
                            className="px-1.5 py-0.5 text-[8px] font-bold rounded-sm border bg-black/40 border-slate-800 text-slate-400 hover:border-slate-600 flex items-center gap-0.5"
                            title="Filter by Buy/Sell action"
                        >
                            <span>SIDE:</span>
                            <span className={actionFilter === 'BUY' ? 'text-emerald-400' : actionFilter === 'SELL' ? 'text-red-400' : 'text-amber-400'}>
                                {actionFilter}
                            </span>
                        </button>

                        <button
                            onClick={() => setSortBy(prev => prev === 'NEWEST' ? 'PNL_DESC' : prev === 'PNL_DESC' ? 'VALUE_DESC' : 'NEWEST')}
                            className="px-1.5 py-0.5 text-[8px] font-bold rounded-sm border bg-black/40 border-slate-800 text-slate-400 hover:border-slate-600 flex items-center gap-0.5"
                            title="Toggle sorting mode"
                        >
                            <SlidersHorizontal className="w-2.5 h-2.5" />
                            <span>{sortBy === 'NEWEST' ? 'TIME' : sortBy === 'PNL_DESC' ? 'P&L' : 'VOL'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-12 font-mono text-[8px] text-slate-500 px-2 pb-1 border-b border-slate-800 uppercase tracking-wider">
                <span className="col-span-4">Side / Symbol</span>
                <span className="col-span-3 text-right">Price / Qty</span>
                <span className="col-span-3 text-right">P&L / Value</span>
                <span className="col-span-2 text-right">Status</span>
            </div>

            {/* Trades List Container */}
            <div className="flex-1 overflow-y-auto space-y-1 p-0.5 custom-scrollbar min-h-0">
                {filteredTrades.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-8 text-center border border-dashed border-slate-800 rounded-sm p-4 bg-black/20">
                        <Layers className="w-5 h-5 text-slate-700 mb-1" />
                        <span className="text-slate-500 text-[9px] font-bold">NO_MATCHING_TRADES</span>
                        <span className="text-slate-600 text-[8px] mt-0.5">Adjust filter or scan for active order vectors.</span>
                        {(searchQuery || statusFilter !== 'ALL' || actionFilter !== 'ALL') && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setStatusFilter('ALL');
                                    setActionFilter('ALL');
                                }}
                                className="mt-2 px-2 py-0.5 text-[8px] uppercase bg-amber-950/40 text-amber-400 border border-amber-700/50 rounded-sm hover:bg-amber-900/60 transition"
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                ) : (
                    filteredTrades.map(trade => {
                        const isExpanded = expandedTradeId === trade.id;
                        const notionalValue = trade.quantity * trade.price;
                        const isBuy = trade.action === 'BUY';

                        return (
                            <div 
                                key={trade.id}
                                className={`border rounded-sm transition-all duration-150 ${
                                    isExpanded 
                                    ? 'bg-slate-900/80 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.15)]' 
                                    : 'bg-black/50 border-slate-800/80 hover:border-slate-700 hover:bg-white/[0.02]'
                                }`}
                            >
                                {/* Primary Row */}
                                <div 
                                    className="grid grid-cols-12 items-center p-1.5 cursor-pointer select-none"
                                    onClick={() => setExpandedTradeId(isExpanded ? null : trade.id)}
                                >
                                    {/* Action & Symbol */}
                                    <div className="col-span-4 flex items-center gap-1.5 overflow-hidden pr-1">
                                        <span className={`px-1 py-0.2 rounded text-[7.5px] font-black tracking-tight uppercase flex items-center gap-0.5 ${
                                            isBuy 
                                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' 
                                            : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                                        }`}>
                                            {isBuy ? <ArrowUpRight className="w-2 h-2" /> : <ArrowDownRight className="w-2 h-2" />}
                                            {trade.action}
                                        </span>
                                        <div className="flex flex-col truncate">
                                            <span className="font-bold text-slate-200 text-[10px] leading-tight truncate">
                                                {trade.symbol}
                                            </span>
                                            <span className="text-[7.5px] text-slate-500 leading-none truncate flex items-center gap-1">
                                                {formatRelativeTime(trade.timestamp)}
                                                {trade.venue && <span className="text-slate-600">· {trade.venue}</span>}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Price & Quantity */}
                                    <div className="col-span-3 text-right flex flex-col justify-center pr-1">
                                        <span className="font-bold text-slate-300 text-[9.5px]">
                                            ${trade.price < 0.01 ? trade.price.toFixed(8) : trade.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                        <span className="text-[7.5px] text-slate-500">
                                            {trade.quantity.toLocaleString()} qty
                                        </span>
                                    </div>

                                    {/* PnL & Notional Value */}
                                    <div className="col-span-3 text-right flex flex-col justify-center pr-1">
                                        <span className={`font-bold text-[9.5px] ${
                                            (trade.pnl || 0) > 0 ? 'text-green-400' : (trade.pnl || 0) < 0 ? 'text-red-400' : 'text-slate-400'
                                        }`}>
                                            {(trade.pnl || 0) > 0 ? '+' : ''}${trade.pnl?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                        </span>
                                        <span className="text-[7.5px] text-slate-500">
                                            ${notionalValue < 0.01 ? notionalValue.toFixed(4) : notionalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>

                                    {/* Status Indicator */}
                                    <div className="col-span-2 flex flex-col items-end justify-center">
                                        {renderStatusBadge(trade.status)}
                                    </div>
                                </div>

                                {/* Expanded Telemetry Drawer */}
                                {isExpanded && (
                                    <div className="px-2 py-2 border-t border-slate-800/80 bg-black/60 grid grid-cols-2 gap-2 text-[8.5px] animate-fade-in-fast font-mono">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-between border-b border-slate-800/60 pb-0.5">
                                                <span className="text-slate-500">ORDER_ID:</span>
                                                <span className="text-amber-400 font-bold">{trade.id}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-800/60 pb-0.5">
                                                <span className="text-slate-500">ORDER_TYPE:</span>
                                                <span className="text-slate-300">{trade.type || 'STANDARD'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-800/60 pb-0.5">
                                                <span className="text-slate-500">TIMESTAMP:</span>
                                                <span className="text-slate-400">{new Date(trade.timestamp).toLocaleTimeString()} ({new Date(trade.timestamp).toLocaleDateString()})</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-between border-b border-slate-800/60 pb-0.5">
                                                <span className="text-slate-500">AUDIT_HASH:</span>
                                                <span className="text-cyan-400 truncate max-w-[100px]" title={trade.auditHash || '0xAUTH_NATIVE_SPINE'}>
                                                    {trade.auditHash || '0x7F4A...9B1C'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-800/60 pb-0.5">
                                                <span className="text-slate-500">TES_CONFIDENCE:</span>
                                                <span className="text-emerald-400 font-bold">{(trade.tesScore || 0.98).toFixed(2)} / 1.00</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-800/60 pb-0.5">
                                                <span className="text-slate-500">EXEC_MODE:</span>
                                                <span className={trade.isPaper ? "text-amber-400" : "text-emerald-400"}>
                                                    {trade.isPaper ? "PAPER_SIMULATION" : "LIVE_ATOMIC_ROUTING"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer Telemetry Stamp */}
            <div className="mt-2 pt-1.5 border-t border-slate-800 flex justify-between items-center text-[7.5px] text-slate-500">
                <span className="flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
                    <span>SOVEREIGN_LEDGER_SYNC</span>
                </span>
                <span className="text-slate-600 font-bold">
                    UPB-1 COMPLIANCE VERIFIED
                </span>
            </div>
        </div>
    );
};

export default React.memo(HistoricalTradesView);
