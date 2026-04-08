import React, { useState, useMemo, useEffect } from 'react';
import { CalculatorType } from '../types';
import { calculateRooftopResults, calculatePumpResults, CalculationResults } from '../utils/calculatorUtils';

interface InteractiveCalculatorProps {
    type: CalculatorType;
    onProceed?: (value: number) => void;
    onChange?: (value: number, results: CalculationResults) => void;
    initialValue?: number;
}

const ResultCard: React.FC<{ label: string; value: string; isPrimary?: boolean }> = ({ label, value, isPrimary = false }) => (
    <div className={`p-4 rounded-lg ${isPrimary ? 'bg-primary-green/20 border border-primary-green/30' : 'bg-white/5 border border-white/10'}`}>
        <p className="text-[10px] uppercase tracking-widest font-black text-text-secondary/80 mb-1">{label}</p>
        <p className={`text-2xl font-black ${isPrimary ? 'text-primary-green' : 'text-white'}`}>{value}</p>
    </div>
);

const InteractiveCalculator: React.FC<InteractiveCalculatorProps> = ({ type, onProceed, onChange, initialValue }) => {
    const isRooftop = type === CalculatorType.Rooftop;
    const config = isRooftop ? {
        label: "Average Monthly Electricity Bill",
        min: 500, max: 20000, step: 100, defaultValue: 3000, unit: "₹"
    } : {
        label: "Current Seasonal Energy Cost (Diesel)",
        min: 2000, max: 50000, step: 500, defaultValue: 10000, unit: "₹"
    };

    const [value, setValue] = useState(initialValue || config.defaultValue);

    const calculationResults = useMemo(() => {
        return isRooftop ? calculateRooftopResults(value) : calculatePumpResults(value);
    }, [value, isRooftop]);

    useEffect(() => {
        if (onChange) {
            onChange(value, calculationResults);
        }
    }, [value, calculationResults, onChange]);

    const resultsDisplay = useMemo(() => {
        if (isRooftop) {
            return {
                primary: { label: "Est. Annual Savings", value: `₹ ${calculationResults.annualSavings.toLocaleString('en-IN')}` },
                secondary: [
                    { label: "Recommended System", value: calculationResults.recommendedSize },
                    { label: "Govt. Subsidy", value: calculationResults.subsidy },
                    { label: "Payback Period", value: calculationResults.paybackPeriod }
                ]
            };
        } else {
            return {
                primary: { label: "Est. Annual Diesel Savings", value: `₹ ${calculationResults.annualSavings.toLocaleString('en-IN')}` },
                secondary: [
                    { label: "Recommended Pump", value: calculationResults.recommendedSize },
                    { label: "PM-KUSUM Subsidy", value: calculationResults.subsidy },
                    { label: "Payback Period", value: calculationResults.paybackPeriod }
                ]
            };
        }
    }, [calculationResults, isRooftop]);

    return (
        <div className="bg-glass-surface/30 backdrop-blur-xl border border-glass-border/30 p-8 rounded-3xl shadow-glow-sm shadow-neon-cyan/5 max-w-3xl mx-auto text-white">
            <div className="text-center mb-8">
                <label htmlFor="calculator-slider" className="block text-sm font-black text-text-secondary uppercase tracking-[0.2em] mb-2">{config.label}</label>
                <p className="text-5xl font-black text-neon-cyan drop-shadow-[0_0_15px_rgba(34,211,238,0.3)] my-2">
                    {config.unit} {value.toLocaleString('en-IN')}
                </p>
            </div>

            <div className="relative pt-4 pb-2">
                <input
                    id="calculator-slider"
                    type="range"
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full h-2 bg-night-sky/50 rounded-full appearance-none cursor-pointer accent-neon-cyan"
                />
                <div className="flex justify-between text-[10px] font-black text-text-secondary/60 mt-4 uppercase tracking-widest">
                    <span>{config.unit} {config.min.toLocaleString('en-IN')}</span>
                    <span>{config.unit} {config.max.toLocaleString('en-IN')}</span>
                </div>
            </div>

            <div className="mt-10 border-t border-glass-border/20 pt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <ResultCard label={resultsDisplay.primary.label} value={resultsDisplay.primary.value} isPrimary />
                    </div>
                    {resultsDisplay.secondary.map(res => (
                        <ResultCard key={res.label} label={res.label} value={res.value} />
                    ))}
                </div>
            </div>

            {onProceed && (
                <div className="mt-10 text-center">
                    <button
                        onClick={() => onProceed(value)}
                        className="w-full md:w-auto font-black bg-gradient-to-r from-neon-cyan to-electric-blue text-night-sky py-4 px-16 rounded-2xl shadow-glow-sm shadow-neon-cyan/20 hover:scale-[1.02] transition-all duration-300 uppercase text-sm tracking-widest"
                    >
                        Proceed to Get Verified Quote
                    </button>
                    <p className="text-[10px] font-medium text-text-secondary/60 mt-4 uppercase tracking-widest">No commitment required. Secure Application.</p>
                </div>
            )}
        </div>
    );
};

export default InteractiveCalculator;
