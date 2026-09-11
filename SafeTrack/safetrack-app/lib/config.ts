// For the hackathon demo these are short. Set them via .env for a
// real deployment (e.g. grace period 10 minutes, confirm window 2 minutes).
export const GRACE_PERIOD_MS =
  Number(process.env.GRACE_PERIOD_SECONDS ?? 30) * 1000;

export const CONFIRM_WINDOW_MS =
  Number(process.env.CONFIRM_WINDOW_SECONDS ?? 20) * 1000;
