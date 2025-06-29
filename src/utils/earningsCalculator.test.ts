
import { calculateEarnings } from './earningsCalculator';

describe('earningsCalculator', () => {
  test('calculates correct earnings for 4 minutes at £1000/hr', () => {
    const start = new Date('2025-06-29T10:00:00');
    const end = new Date('2025-06-29T10:04:00');
    const result = calculateEarnings(start, end, 0, 1000);
    
    expect(result.earnings).toBe(66.67);
    expect(result.hoursWorked).toBeCloseTo(0.0667, 4);
  });

  test('calculates correct earnings with break time', () => {
    const start = new Date('2025-06-29T10:00:00');
    const end = new Date('2025-06-29T11:00:00');
    const breakSeconds = 15 * 60; // 15 minutes break
    const result = calculateEarnings(start, end, breakSeconds, 20);
    
    // 1 hour - 15 minutes = 45 minutes = 0.75 hours
    // 0.75 * 20 = 15
    expect(result.earnings).toBe(15.00);
    expect(result.hoursWorked).toBe(0.75);
  });

  test('handles zero time worked', () => {
    const start = new Date('2025-06-29T10:00:00');
    const end = new Date('2025-06-29T10:00:00');
    const result = calculateEarnings(start, end, 0, 25);
    
    expect(result.earnings).toBe(0.00);
    expect(result.hoursWorked).toBe(0);
  });
});
