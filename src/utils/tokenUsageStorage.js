/**
 * Utility for tracking and managing User Token Usage
 */

const STORAGE_KEY = 'thamili_user_token_usage';

const DEFAULT_USAGE = {
  totalAllowance: 50000,
  usedTokens: 7500,
  geminiTokens: 5400,
  hfUnits: 1850,
  promptTokens: 250,
  plan: 'Pro Studio Creator',
  userName: 'JABAKINGSON',
  userEmail: 'creator@thamili.ai',
  renewalDate: '1st of next month'
};

export function getTokenUsage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USAGE));
      return DEFAULT_USAGE;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_USAGE, ...parsed };
  } catch {
    return DEFAULT_USAGE;
  }
}

export function consumeTokens(provider = 'gemini', amount = 100) {
  try {
    const current = getTokenUsage();
    let newGemini = current.geminiTokens;
    let newHf = current.hfUnits;
    let newPrompt = current.promptTokens;

    if (provider === 'gemini') {
      newGemini += amount;
    } else if (provider === 'pixazo' || provider === 'fal' || provider === 'fal.ai' || provider === 'huggingface') {
      newHf += amount;
    } else {
      newPrompt += amount;
    }

    const updated = {
      ...current,
      usedTokens: current.usedTokens + amount,
      geminiTokens: newGemini,
      hfUnits: newHf,
      promptTokens: newPrompt
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('tokens-updated'));
    return updated;
  } catch (err) {
    console.error('Failed to consume tokens:', err);
    return DEFAULT_USAGE;
  }
}

export function addTokens(amount = 10000) {
  try {
    const current = getTokenUsage();
    const updated = {
      ...current,
      totalAllowance: current.totalAllowance + amount
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('tokens-updated'));
    return updated;
  } catch (err) {
    console.error('Failed to add tokens:', err);
    return DEFAULT_USAGE;
  }
}
