export const CATEGORIES = [
  { id: 'snacks', label: 'Snacks & fast food', emoji: '🍔', color: '#ffb98a' },
  { id: 'groceries', label: 'Fruits & vegetables', emoji: '🥦', color: '#7fd8b5' },
  { id: 'education', label: 'Books & education', emoji: '📚', color: '#8fdcff' },
  { id: 'travel', label: 'Travel & transport', emoji: '🚌', color: '#5b5bf0' },
  { id: 'shopping', label: 'Shopping & clothing', emoji: '🛍️', color: '#ff8fb1' },
  { id: 'medical', label: 'Medical', emoji: '💊', color: '#ff7a8a' },
  { id: 'bills', label: 'Bills & subscriptions', emoji: '🧾', color: '#b8b5ff' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎮', color: '#ffd966' },
  { id: 'savings', label: 'Savings & investments', emoji: '🐖', color: '#4fc3a1' },
  { id: 'other', label: 'Other', emoji: '✨', color: '#a9a6c9' }
];

export const INCOME_CATEGORIES = [
  { id: 'allowance', label: 'Allowance', emoji: '🏠', color: '#7fd8b5' },
  { id: 'salary', label: 'Salary', emoji: '💼', color: '#7fd8b5' },
  { id: 'freelance', label: 'Freelance', emoji: '💻', color: '#7fd8b5' },
  { id: 'gift', label: 'Gift', emoji: '🎁', color: '#7fd8b5' },
  { id: 'other_income', label: 'Other income', emoji: '➕', color: '#7fd8b5' }
];

export const MOTIVES = [
  { id: 'need', label: 'Need', emoji: '🧱', hint: 'I had to' },
  { id: 'want', label: 'Want', emoji: '😊', hint: 'I chose it' },
  { id: 'impulse', label: 'Impulse', emoji: '⚡', hint: 'Spur of the moment' },
  { id: 'planned', label: 'Planned', emoji: '🗓️', hint: 'I planned it' },
  { id: 'emergency', label: 'Emergency', emoji: '🚑', hint: 'It couldn\'t wait' }
];

export const PRIORITIES = [
  { id: 'essential', label: 'Essential' },
  { id: 'flexible', label: 'Flexible' },
  { id: 'treat', label: 'Treat' }
];

const all = [...CATEGORIES, ...INCOME_CATEGORIES];
export const categoryOf = (id) => all.find((c) => c.id === id) || { id, label: id, emoji: '•', color: '#a9a6c9' };
export const motiveOf = (id) => MOTIVES.find((m) => m.id === id);
