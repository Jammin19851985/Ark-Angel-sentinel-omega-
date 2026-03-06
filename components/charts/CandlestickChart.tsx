
import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CrosshairMode, LineStyle, Time } from 'lightweight-charts';
import { CandlestickData } from '../../types';
import { ChartInfoOverlay, ChartInfo } from './ChartInfoOverlay';
import { ActivityIcon } from '../icons/ActivityIcon';

interface CandlestickChartProps {
    data: CandlestickData[];
    info?: ChartInfo;
}

// Custom hook for resizing
const useResizeObserver = (ref: React.RefObject<HTMLDivElement>) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    useEffect(() => {
        if (!ref.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            if (entries[0]) {
                const { width, height } = entries[0].contentRect;
                setDimensions({ width, height });
            }
        });
        resizeObserver.observe(ref.current);
        return () => resizeObserver.disconnect();
    }, [ref]);
    return dimensions;
};

// Calculate SMA helper
const calculateSMA = (data: CandlestickData[], count: number) => {
    const avg = (d: CandlestickData) => d.close;
    const result = [];
    for (let i = count - 1; i < data.length; i++) {
        const val = data.slice(i - count + 1, i + 1).reduce((acc, curr) => acc + avg(curr), 0) / count;
        result.push({ time: Math.floor(new Date(data[i].date).getTime() / 1000) as Time, value: val });
    }
    return result;
};

export const CandlestickChart: React.FC<CandlestickChartProps> = ({ data, info }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const sma20SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
    const sma50SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
    
    const [isSMA20Active, setIsSMA20Active] = useState(false);
    const [isSMA50Active, setIsSMA50Active] = useState(false);
    const [areMarkersActive, setAreMarkersActive] = useState(false);

    const { width, height } = useResizeObserver(chartContainerRef);

    // Initialize Chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#94a3b8',
            },
            grid: {
                vertLines: { color: 'rgba(30, 41, 59, 0.5)' },
                horzLines: { color: 'rgba(30, 41, 59, 0.5)' },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
            },
            rightPriceScale: {
                borderColor: 'rgba(197, 203, 206, 0.8)',
            },
            timeScale: {
                borderColor: 'rgba(197, 203, 206, 0.8)',
                timeVisible: true,
                secondsVisible: false,
            },
        });

        const candleSeries = chart.addCandlestickSeries({
            upColor: '#10b981', // Emerald 500
            downColor: '#ef4444', // Red 500
            borderDownColor: '#ef4444',
            borderUpColor: '#10b981',
            wickDownColor: '#ef4444',
            wickUpColor: '#10b981',
        });

        chartRef.current = chart;
        candleSeriesRef.current = candleSeries;

        return () => {
            chart.remove();
        };
    }, []);

    // Handle Resize
    useEffect(() => {
        if (chartRef.current) {
            chartRef.current.resize(width, height);
        }
    }, [width, height]);

    // Handle Data Updates
    useEffect(() => {
        if (!candleSeriesRef.current || data.length === 0) return;
        
        // Map data to lightweight-charts format
        const chartData = data.map(d => ({
            time: Math.floor(new Date(d.date).getTime() / 1000) as Time,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close
        }));

        // Sort data chronologically to ensure lightweight-charts accepts it
        chartData.sort((a, b) => (a.time as number) - (b.time as number));

        candleSeriesRef.current.setData(chartData);

        // Update indicators if active
        if (isSMA20Active && chartRef.current) {
            if (!sma20SeriesRef.current) {
                sma20SeriesRef.current = chartRef.current.addLineSeries({
                    color: '#fbbf24', // Amber
                    lineWidth: 2,
                    priceLineVisible: false,
                });
            }
            sma20SeriesRef.current.setData(calculateSMA(data, 20));
        } else if (!isSMA20Active && sma20SeriesRef.current && chartRef.current) {
            chartRef.current.removeSeries(sma20SeriesRef.current);
            sma20SeriesRef.current = null;
        }

        if (isSMA50Active && chartRef.current) {
            if (!sma50SeriesRef.current) {
                sma50SeriesRef.current = chartRef.current.addLineSeries({
                    color: '#22d3ee', // Cyan
                    lineWidth: 2,
                    priceLineVisible: false,
                    lineStyle: LineStyle.Dashed,
                });
            }
            sma50SeriesRef.current.setData(calculateSMA(data, 50));
        } else if (!isSMA50Active && sma50SeriesRef.current && chartRef.current) {
            chartRef.current.removeSeries(sma50SeriesRef.current);
            sma50SeriesRef.current = null;
        }

        // Update Markers (Drawing Tool Simulation)
        if (areMarkersActive && candleSeriesRef.current) {
            const markers = chartData
                .filter((_, i) => i % 10 === 0) // Example logic
                .map((item, i) => ({
                    time: item.time,
                    position: i % 2 === 0 ? 'aboveBar' : 'belowBar',
                    color: i % 2 === 0 ? '#ef4444' : '#10b981',
                    shape: i % 2 === 0 ? 'arrowDown' : 'arrowUp',
                    text: i % 2 === 0 ? 'Sell' : 'Buy',
                }));
            // @ts-ignore
            candleSeriesRef.current.setMarkers(markers);
        } else if (!areMarkersActive && candleSeriesRef.current) {
            candleSeriesRef.current.setMarkers([]);
        }

    }, [data, isSMA20Active, isSMA50Active, areMarkersActive]);

    const ToolbarButton = ({ label, active, onClick, color }: any) => (
        <button
            onClick={onClick}
            className={`px-2 py-1 text-[8px] font-bold uppercase rounded border transition-all flex items-center gap-1 ${
                active 
                ? `bg-${color}-900/50 border-${color}-500 text-${color}-400 shadow-[0_0_10px_rgba(var(--color-${color}-500),0.3)]` 
                : 'bg-black/40 border-slate-700 text-slate-500 hover:text-slate-300'
            }`}
        >
            <div className={`w-1.5 h-1.5 rounded-full ${active ? `bg-${color}-500` : 'bg-slate-600'}`}></div>
            {label}
        </button>
    );

    return (
        <div className="relative w-full h-full group/chart flex flex-col">
            <ChartInfoOverlay info={info} />
            
            {/* Chart Toolbar */}
            <div className="absolute top-2 right-2 z-20 flex gap-2 p-1 bg-black/60 backdrop-blur-sm rounded-md border border-slate-800">
                <ToolbarButton 
                    label="SMA 20" 
                    active={isSMA20Active} 
                    onClick={() => setIsSMA20Active(!isSMA20Active)} 
                    color="amber"
                />
                <ToolbarButton 
                    label="SMA 50" 
                    active={isSMA50Active} 
                    onClick={() => setIsSMA50Active(!isSMA50Active)} 
                    color="cyan"
                />
                <ToolbarButton 
                    label="Signals" 
                    active={areMarkersActive} 
                    onClick={() => setAreMarkersActive(!areMarkersActive)} 
                    color="purple"
                />
            </div>

            <div ref={chartContainerRef} className="w-full h-full" />
            
            <div className="absolute bottom-2 left-2 z-20 pointer-events-none">
                <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500 bg-black/60 px-2 py-1 rounded border border-slate-800 backdrop-blur-sm">
                    <ActivityIcon className="w-3 h-3 text-emerald-500" />
                    <span>TradingView Lightweight Core v4.1</span>
                </div>
            </div>
        </div>
    );
};

export default CandlestickChart;
