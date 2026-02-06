export const calculateMonthlyProjections = (inventory, expenses, growthPercent = 5) => {
    const annualProjections = [];

    // Base values for Month 1
    let currentMonthlyVolumeMultiplier = 1;
    const monthlyExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    for (let m = 1; m <= 12; m++) {
        let totalRevenue = 0;
        let totalGrossProfitRaw = 0;
        let totalWastage = 0;

        inventory.forEach(item => {
            const volume = item.expectedVolume * currentMonthlyVolumeMultiplier;
            const baseSellingPrice = item.unitCost * (1 + item.markup / 100);

            const sellingPrice = (item.bulkThreshold && volume >= item.bulkThreshold)
                ? baseSellingPrice * (1 - (item.discountPercentage || 0) / 100)
                : baseSellingPrice;

            const revenue = sellingPrice * volume;
            const baseGrossProfit = (sellingPrice - item.unitCost) * volume;
            const wastageCost = item.unitCost * volume * (item.spoilageRate || 0);

            totalRevenue += revenue;
            totalGrossProfitRaw += baseGrossProfit;
            totalWastage += wastageCost;
        });

        const netIncome = (totalGrossProfitRaw - totalWastage) - monthlyExpenses;

        annualProjections.push({
            month: `Month ${m}`,
            revenue: Math.round(totalRevenue),
            grossProfitRaw: Math.round(totalGrossProfitRaw),
            wastage: Math.round(totalWastage),
            grossProfit: Math.round(totalGrossProfitRaw - totalWastage),
            netIncome: Math.round(netIncome),
            expenses: Math.round(monthlyExpenses)
        });

        // Apply growth for next month
        currentMonthlyVolumeMultiplier *= (1 + growthPercent / 100);
    }

    return annualProjections;
};

export const calculateBreakEven = (inventory, expenses) => {
    const monthlyExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    let totalWeightedMargin = 0;
    let totalVolume = 0;

    inventory.forEach(item => {
        const sellingPrice = item.unitCost * (1 + item.markup / 100);
        const wastageCostPerUnit = item.unitCost * (item.spoilageRate || 0);
        const unitMargin = (sellingPrice - item.unitCost) - wastageCostPerUnit;

        totalWeightedMargin += unitMargin * item.expectedVolume;
        totalVolume += item.expectedVolume;
    });

    if (totalVolume === 0) return 0;

    const averageMarginPerUnit = totalWeightedMargin / totalVolume;
    return Math.ceil(monthlyExpenses / averageMarginPerUnit);
};
