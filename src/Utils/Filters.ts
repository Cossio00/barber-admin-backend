function validateDateFilters(
    startDate: string | undefined,
    endDate: string | undefined,
    closureMonth: string,
    res: any
): boolean {
    if (!startDate && !endDate) return true;

    if (!startDate || !endDate) {
        res.status(400).json({ message: 'Both startDate and endDate are required when using date filter' });
        return false;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
        res.status(400).json({ message: 'Invalid startDate format. Use YYYY-MM-DD' });
        return false;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        res.status(400).json({ message: 'Invalid endDate format. Use YYYY-MM-DD' });
        return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
        res.status(400).json({ message: 'endDate cannot be before startDate' });
        return false;
    }

    const startYearMonth = startDate.substring(0, 7);
    const endYearMonth = endDate.substring(0, 7);

    if (startYearMonth !== closureMonth || endYearMonth !== closureMonth) {
        res.status(400).json({ message: 'Filter dates must be within the closed month' });
        return false;
    }

    return true;
}

function buildFilters(
    closureMonth: string,
    startDate?: string,
    endDate?: string,
    categoryId?: string
): { dateFilter: string; categoryFilter: string; params: any[] } {
    let dateFilter = '';
    let categoryFilter = '';
    const params: any[] = [closureMonth];

    if (startDate && endDate) {
        dateFilter = 'AND servicedate >= ? AND servicedate <= ?';
        params.push(startDate, endDate);
    }

    if (categoryId) {
        categoryFilter = 'AND ser.servicecategoryid = ?';
        params.push(categoryId);
    }

    return { dateFilter, categoryFilter, params };
}

export { validateDateFilters, buildFilters };