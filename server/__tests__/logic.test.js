describe('Financial Logic Utilities', () => {
  const mockExpenses = [
    { category: 'Food', amount: 100 },
    { category: 'Food', amount: 200 },
    { category: 'Transport', amount: 50 },
    { category: 'Bills', amount: 500 },
  ];

  test('Total calculation should sum all amounts correctly', () => {
    const total = mockExpenses.reduce((sum, e) => sum + e.amount, 0);
    expect(total).toBe(850);
  });

  test('Category filtering should return correct subset', () => {
    const foodExpenses = mockExpenses.filter(e => e.category === 'Food');
    expect(foodExpenses).toHaveLength(2);
    expect(foodExpenses[0].amount).toBe(100);
  });

  test('Category breakdown should group totals correctly', () => {
    const breakdown = mockExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    expect(breakdown['Food']).toBe(300);
    expect(breakdown['Transport']).toBe(50);
    expect(breakdown['Bills']).toBe(500);
  });
});
