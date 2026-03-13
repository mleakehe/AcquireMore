const BLOB_ID = "019ce546-1e5f-7831-a6ba-cc6c492a8ca3";
const BASE_URL = `https://jsonblob.com/api/jsonBlob/${BLOB_ID}`;

export async function fetchLeaderboard() {
  try {
    const res = await fetch(BASE_URL, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    return data || { entries: [], totalGames: 0, totalWins: 0 };
  } catch (e) {
    console.warn("Leaderboard fetch failed, using localStorage:", e);
    return getLocal();
  }
}

export async function submitScore(entry) {
  const survived = !entry.bankrupt;
  try {
    const current = await fetchLeaderboard();
    const entries = [...(current.entries || []), entry]
      .sort((a, b) => b.valuation - a.valuation)
      .slice(0, 50);
    const totalGames = (current.totalGames || 0) + 1;
    const totalWins = (current.totalWins || 0) + (survived ? 1 : 0);
    const updated = { entries, totalGames, totalWins };
    await fetch(BASE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setLocal(updated);
    return updated;
  } catch (e) {
    console.warn("Score submit failed, saving locally:", e);
    const local = getLocal();
    const entries = [...(local.entries || []), entry]
      .sort((a, b) => b.valuation - a.valuation)
      .slice(0, 50);
    const updated = {
      entries,
      totalGames: (local.totalGames || 0) + 1,
      totalWins: (local.totalWins || 0) + (survived ? 1 : 0),
    };
    setLocal(updated);
    return updated;
  }
}

export async function recordGamePlayed() {
  try {
    const current = await fetchLeaderboard();
    const updated = { ...current, totalGames: (current.totalGames || 0) + 1 };
    await fetch(BASE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setLocal(updated);
  } catch (e) {
    console.warn("Record game failed:", e);
    const local = getLocal();
    setLocal({ ...local, totalGames: (local.totalGames || 0) + 1 });
  }
}

function getLocal() {
  try {
    const d = localStorage.getItem("acquiremore-leaderboard");
    return d ? JSON.parse(d) : { entries: [], totalGames: 0, totalWins: 0 };
  } catch { return { entries: [], totalGames: 0, totalWins: 0 }; }
}

function setLocal(data) {
  try { localStorage.setItem("acquiremore-leaderboard", JSON.stringify(data)); } catch {}
}
