export interface CalculationResults {
    annualSavings: number;
    recommendedSize: string;
    subsidy: string;
    paybackPeriod: string;
    netCost?: number;
    totalCost?: number;
}

export const calculateRooftopResults = (monthlyBill: number): CalculationResults => {
    const systemSize = parseFloat((monthlyBill / 750).toFixed(1));
    const subsidyValue = Math.min(78000, systemSize * 22000);
    const annualSavings = monthlyBill * 12;
    const costPerKw = 60000;
    const totalSystemCost = systemSize * costPerKw;
    const netSystemCost = totalSystemCost - subsidyValue;
    const paybackPeriodValue = (netSystemCost > 0 && annualSavings > 0)
        ? (netSystemCost / annualSavings).toFixed(1)
        : 'N/A';

    return {
        annualSavings,
        recommendedSize: `${systemSize} kW`,
        subsidy: `≈ ₹ ${Math.round(subsidyValue).toLocaleString('en-IN')}`,
        paybackPeriod: paybackPeriodValue !== 'N/A' ? `~${paybackPeriodValue} Years` : 'N/A',
        netCost: netSystemCost,
        totalCost: totalSystemCost
    };
};

export const calculatePumpResults = (seasonalDieselCost: number): CalculationResults => {
    const annualSavings = seasonalDieselCost * 4;
    const pumpSystemCost = 180000;
    const subsidyPercentage = 0.60;
    const netCost = pumpSystemCost * (1 - subsidyPercentage);
    const paybackPeriodValue = (netCost > 0 && annualSavings > 0)
        ? (netCost / annualSavings).toFixed(1)
        : 'N/A';

    return {
        annualSavings,
        recommendedSize: "5-7.5 HP",
        subsidy: "Up to 60%",
        paybackPeriod: paybackPeriodValue !== 'N/A' ? `~${paybackPeriodValue} Years` : 'N/A',
        netCost: netCost,
        totalCost: pumpSystemCost
    };
};
