import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, IndianRupee, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TaxSlab {
    min: number;
    max: number;
    rate: number;
}

interface TaxResult {
    baseTax: number;
    surcharge: number;
    cess: number;
    total: number;
}

interface TaxDetails {
    [regime: string]: TaxResult;
}

const TaxCalculator: React.FC = () => {
    const [income, setIncome] = useState<string>('');
    const [age, setAge] = useState<string>('30');
    const [calculatedTaxes, setCalculatedTaxes] = useState<TaxDetails | null>(null);

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const calculateTax = (income: number, regime: string): TaxResult => {
        let tax = 0;
        const slabs = getTaxSlabs(regime, parseInt(age));

        for (const slab of slabs) {
            if (income > slab.min) {
                const taxableAmount = Math.min(income - slab.min, slab.max - slab.min);
                tax += taxableAmount * slab.rate;
            }
        }

        // Apply rebate under section 87A
        if ((regime === 'new2025' && income <= 1200000) ||
            (regime === 'new2024' && income <= 700000) ||
            (regime !== 'new2025' && regime !== 'new2024' && income <= 500000)) {
            tax = 0;
        }

        // Calculate surcharge
        let surcharge = 0;
        if (income > 50000000) surcharge = tax * 0.37;
        else if (income > 20000000) surcharge = tax * 0.25;
        else if (income > 10000000) surcharge = tax * 0.15;
        else if (income > 5000000) surcharge = tax * 0.10;

        // Calculate cess
        const cess = (tax + surcharge) * 0.04;

        return {
            baseTax: tax,
            surcharge,
            cess,
            total: tax + surcharge + cess
        };
    };

    const getTaxSlabs = (regime: string, age: number): TaxSlab[] => {
        switch (regime) {
            case 'new2025':
                return [
                    { min: 0, max: 400000, rate: 0 },
                    { min: 400000, max: 800000, rate: 0.05 },
                    { min: 800000, max: 1200000, rate: 0.10 },
                    { min: 1200000, max: 1600000, rate: 0.15 },
                    { min: 1600000, max: 2000000, rate: 0.20 },
                    { min: 2000000, max: 2400000, rate: 0.25 },
                    { min: 2400000, max: Infinity, rate: 0.30 }
                ];
            case 'new2024':
                return [
                    { min: 0, max: 300000, rate: 0 },
                    { min: 300000, max: 700000, rate: 0.05 },
                    { min: 700000, max: 1000000, rate: 0.10 },
                    { min: 1000000, max: 1200000, rate: 0.15 },
                    { min: 1200000, max: 1500000, rate: 0.20 },
                    { min: 1500000, max: Infinity, rate: 0.30 }
                ];
            case 'old':
                if (age >= 80) {
                    return [
                        { min: 0, max: 500000, rate: 0 },
                        { min: 500000, max: 1000000, rate: 0.20 },
                        { min: 1000000, max: Infinity, rate: 0.30 }
                    ];
                } else if (age >= 60) {
                    return [
                        { min: 0, max: 300000, rate: 0 },
                        { min: 300000, max: 500000, rate: 0.05 },
                        { min: 500000, max: 1000000, rate: 0.20 },
                        { min: 1000000, max: Infinity, rate: 0.30 }
                    ];
                } else {
                    return [
                        { min: 0, max: 250000, rate: 0 },
                        { min: 250000, max: 500000, rate: 0.05 },
                        { min: 500000, max: 1000000, rate: 0.20 },
                        { min: 1000000, max: Infinity, rate: 0.30 }
                    ];
                }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericIncome = parseFloat(income.replace(/,/g, ''));

        if (isNaN(numericIncome) || numericIncome < 0) {
            alert('Please enter a valid income amount');
            return;
        }

        const taxes = {
            'New Tax Regime 2025-26': calculateTax(numericIncome, 'new2025'),
            'New Tax Regime 2024-25': calculateTax(numericIncome, 'new2024'),
            'Old Tax Regime': calculateTax(numericIncome, 'old')
        };

        setCalculatedTaxes(taxes);
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-6 w-6" />
                        Indian Income Tax Calculator 2024-25
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Annual Income</label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={income}
                                    onChange={(e) => setIncome(e.target.value)}
                                    className="pl-10 w-full rounded-md border border-gray-300 p-2"
                                    placeholder="Enter your annual income"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Age</label>
                            <input
                                type="number"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                className="w-full rounded-md border border-gray-300 p-2"
                                min="0"
                                max="120"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Calculate Tax
                        </button>
                    </form>
                </CardContent>
            </Card>

            {calculatedTaxes && (
                <div className="space-y-4">
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            Based on your income of {formatCurrency(parseFloat(income.replace(/,/g, '')))} and age {age}
                        </AlertDescription>
                    </Alert>

                    {Object.entries(calculatedTaxes).map(([regime, tax]) => (
                        <Card key={regime}>
                            <CardHeader>
                                <CardTitle>{regime}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Base Tax:</span>
                                        <span>{formatCurrency(tax.baseTax)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Surcharge:</span>
                                        <span>{formatCurrency(tax.surcharge)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Health & Education Cess:</span>
                                        <span>{formatCurrency(tax.cess)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold pt-2 border-t">
                                        <span>Total Tax Liability:</span>
                                        <span>{formatCurrency(tax.total)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TaxCalculator;