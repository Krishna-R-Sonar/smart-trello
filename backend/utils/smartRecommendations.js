// backend/utils/smartRecommendations.js
const dueDateMatchers = [
  { test: /(today|urgent|asap)/i, days: 0 },
  { test: /(tomorrow|tmrw)/i, days: 1 },
  { test: /(next week|week end|weekly)/i, days: 7 },
  { test: /(next sprint|next month|later)/i, days: 14 },
  { test: /(review|qa|testing)/i, days: 3 }
];

const moveHints = [
  { keywords: ['start', 'started', 'starting', 'working', 'progress', 'wip'], target: 'In Progress' },
  { keywords: ['blocked', 'waiting', 'review'], target: 'In Progress' },
  { keywords: ['complete', 'completed', 'done', 'ship', 'ready'], target: 'Done' }
];

const normalize = (text = '') => text.toLowerCase();

const pickListByTitle = (lists, title) => {
  const normalized = title.toLowerCase();
  return lists.find(list => list.title.toLowerCase() === normalized);
};

const getDueDateSuggestion = (card) => {
  if (card.dueDate) return null;
  const haystack = `${card.title ?? ''} ${card.description ?? ''}`;
  const match = dueDateMatchers.find(({ test }) => test.test(haystack));
  if (!match) return null;

  const date = new Date();
  date.setDate(date.getDate() + match.days);
  return date.toISOString();
};

const getListSuggestion = (card, lists) => {
  const haystack = normalize(`${card.title} ${card.description}`);
  for (const hint of moveHints) {
    if (hint.keywords.some(keyword => haystack.includes(keyword))) {
      const targetList = pickListByTitle(lists, hint.target);
      if (targetList && card.listId.toString() !== targetList._id.toString()) {
        return targetList;
      }
    }
  }
  return null;
};

const tokenize = (text = '') => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
};

const findRelatedCards = (cards) => {
  const recommendations = [];
  const tokenMaps = cards.map(card => ({
    card,
    tokens: new Set(tokenize(`${card.title} ${card.description}`))
  }));

  for (let i = 0; i < tokenMaps.length; i++) {
    for (let j = i + 1; j < tokenMaps.length; j++) {
      const first = tokenMaps[i];
      const second = tokenMaps[j];
      const intersection = [...first.tokens].filter(token => second.tokens.has(token));

      if (intersection.length >= 2) {
        recommendations.push({
          type: 'related',
          cardIds: [first.card._id, second.card._id],
          message: `“${first.card.title}” and “${second.card.title}” both mention ${intersection.slice(0, 2).join(', ')}`,
          sharedKeywords: intersection.slice(0, 5)
        });
      }
    }
  }

  return recommendations;
};

const getRecommendations = (board, cards = []) => {
  if (!board || !board.lists) return [];

  const recommendations = [];

  cards.forEach(card => {
    const dueDate = getDueDateSuggestion(card);
    if (dueDate) {
      recommendations.push({
        type: 'dueDate',
        cardId: card._id,
        message: `Set a due date for “${card.title}” based on its description`,
        suggestedDate: dueDate
      });
    }

    const listSuggestion = getListSuggestion(card, board.lists);
    if (listSuggestion) {
      recommendations.push({
        type: 'move',
        cardId: card._id,
        message: `Move “${card.title}” to “${listSuggestion.title}”`,
        suggestedListId: listSuggestion._id,
        suggestedListTitle: listSuggestion.title
      });
    }
  });

  recommendations.push(...findRelatedCards(cards));

  return recommendations.slice(0, 8);
};

module.exports = { getRecommendations };
