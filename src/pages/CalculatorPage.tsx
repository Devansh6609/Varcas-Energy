import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import InteractiveCalculator from '../components/InteractiveCalculator';
import CalculatorForm from '../components/CalculatorForm';
import { CalculatorType } from '../types';
import { CalculationResults, calculateRooftopResults, calculatePumpResults } from '../utils/calculatorUtils';

const CalculatorPage: React.FC = () => {
    const { type } = useParams<{ type: string }>();
    const [showForm, setShowForm] = useState(false);
    const [initialValue, setInitialValue] = useState<number>(3000);
    const [results, setResults] = useState<CalculationResults | null>(null);

    const isRooftop = type === CalculatorType.Rooftop;
    const isPump = type === CalculatorType.Pump;

    if (!isRooftop && !isPump) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-night-sky">
                <div className="text-center p-8 bg-glass-surface rounded-3xl border border-red-500/20">
                    <h1 className="text-2xl font-black text-red-500 uppercase tracking-widest">Invalid Calculator Type</h1>
                    <p className="text-text-secondary mt-2 font-medium">Please select a valid calculator from the navigation.</p>
                </div>
            </div>
        );
    }

    const handleProceed = (value: number) => {
        setInitialValue(value);
        // Pre-calculate results for the form
        const res = isRooftop ? calculateRooftopResults(value) : calculatePumpResults(value);
        setResults(res);
        setShowForm(true);
    };

    const handleCalcChange = (value: number, res: CalculationResults) => {
        setInitialValue(value || 3000);
        setResults(res);
    };

    const pageConfig = {
        [CalculatorType.Rooftop]: {
            title: 'Rooftop Savings Calculator',
            subtitle: 'Estimate your solar potential in seconds.',
            productType: CalculatorType.Rooftop
        },
        [CalculatorType.Pump]: {
            title: 'Pump ROI Calculator',
            subtitle: 'Instantly calculate your diesel savings.',
            productType: CalculatorType.Pump
        },
    };

    const config = isRooftop ? pageConfig[CalculatorType.Rooftop] : pageConfig[CalculatorType.Pump];

    return (
        <div className="pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                {!showForm && (
                    <div className="text-center mb-12 animate-fade-in-down">
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 uppercase tracking-tight">
                            {config.title}
                        </h1>
                        <p className="text-xl text-text-secondary font-bold max-w-2xl mx-auto italic">
                            {config.subtitle}
                        </p>
                    </div>
                )}
                
                {showForm ? (
                    <div className="animate-fade-in-up">
                        <button 
                            onClick={() => setShowForm(false)}
                            className="mb-6 text-neon-cyan font-black flex items-center gap-2 hover:translate-x-[-4px] transition-all uppercase text-xs tracking-widest"
                        >
                            ← Back to Calculator
                        </button>
                        <CalculatorForm 
                            type={config.productType} 
                            initialValue={initialValue}
                            calculatorResults={results}
                        />
                    </div>
                ) : (
                    <InteractiveCalculator 
                        type={config.productType} 
                        onProceed={handleProceed}
                        onChange={handleCalcChange}
                        initialValue={initialValue}
                    />
                )}
            </div>
        </div>
    );
};

export default CalculatorPage;