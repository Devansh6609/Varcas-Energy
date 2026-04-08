export const calculateScore = (lead) => {
    let score = 30; // base score
    if (lead.productType === 'rooftop') score += 10;
    if (lead.phone && lead.phone.length >= 10) score += 10;
    return Math.min(score, 100);
};

export const getScoreStatus = (score) => {
    if (score >= 80) return 'Hot';
    if (score >= 50) return 'Warm';
    return 'Cold';
};
