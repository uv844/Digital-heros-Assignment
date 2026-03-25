export const STABLEFORD_MIN = 1;
export const STABLEFORD_MAX = 45;
export const MIN_CHARITY_CONTRIBUTION = 10; // 10%

export const PRIZE_POOL_SHARES = {
  MATCH_5: 0.40, // 40%
  MATCH_4: 0.35, // 35%
  MATCH_3: 0.25, // 25%
};

export const MOCK_CHARITIES = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Green Fairways Foundation',
    description: 'Supporting youth golf programs in underprivileged communities.',
    imageURL: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=800',
    upcomingEvents: [
      { name: 'Junior Open Day', date: '2026-04-15', description: 'A fun day for kids to learn golf.' }
    ]
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Golfers for Good',
    description: 'Providing clean water solutions through golf tournament fundraising.',
    imageURL: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=800',
    upcomingEvents: [
      { name: 'Charity Scramble', date: '2026-05-20', description: 'Annual tournament for clean water.' }
    ]
  }
];
