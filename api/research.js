const ALLOWED_ORIGIN = null;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const query = String(req.query?.q || "").trim().slice(0, 240);
  if (query.length < 2) return res.status(400).json({ error: "Enter a research topic with at least 2 characters." });

  const safeText = (value) => typeof value === "string" ? value.replace(/<[^>]*>/g, "").trim() : "";
  const yearFrom = (value) => {
    if (Array.isArray(value) && value[0] && value[0][0]) return Number(value[0][0]) || null;
    if (Array.isArray(value) && value[0]) return Number(value[0]) || null;
    return null;
  };

  const crossref = async () => {
    const url = "https://api.crossref.org/works?rows=5&query.bibliographic=" + encodeURIComponent(query);
    const response = await fetch(url, { headers: { "User-Agent": "NEXA-Engineering-Universe/1.0 (research discovery portal)" } });
    if (!response.ok) throw new Error("Crossref search unavailable");
    const json = await response.json();
    return (json.message?.items || []).map((item) => ({
      title: safeText(item.title?.[0]) || "Untitled work",
      year: yearFrom(item.published?.["date-parts"] || item.created?.["date-parts"]),
      source: "Crossref",
      doi: safeText(item.DOI),
      url: safeText(item.URL) || (item.DOI ? "https://doi.org/" + encodeURIComponent(item.DOI) : ""),
      authors: (item.author || []).slice(0, 4).map((a) => [safeText(a.given), safeText(a.family)].filter(Boolean).join(" ")).filter(Boolean)
    }));
  };

  const openAlex = async () => {
    const url = "https://api.openalex.org/works?per-page=5&search=" + encodeURIComponent(query);
    const response = await fetch(url);
    if (!response.ok) throw new Error("OpenAlex search unavailable");
    const json = await response.json();
    return (json.results || []).map((item) => ({
      title: safeText(item.title) || "Untitled work",
      year: Number(item.publication_year) || null,
      source: "OpenAlex",
      doi: safeText(item.doi).replace(/^https?:\/\/doi\.org\//i, ""),
      url: safeText(item.doi) || safeText(item.id),
      authors: (item.authorships || []).slice(0, 4).map((a) => safeText(a.author?.display_name)).filter(Boolean),
      openAccess: Boolean(item.open_access?.is_oa)
    }));
  };

  try {
    const outcomes = await Promise.allSettled([crossref(), openAlex()]);
    const results = outcomes.flatMap((outcome) => outcome.status === "fulfilled" ? outcome.value : []);
    const unique = [];
    const seen = new Set();
    for (const item of results) {
      const key = (item.doi || item.title).toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      unique.push(item);
    }
    if (!unique.length && outcomes.every((outcome) => outcome.status === "rejected")) {
      return res.status(502).json({ error: "Research providers are temporarily unavailable. Try again shortly." });
    }
    return res.status(200).json({ query, count: unique.length, results: unique.slice(0, 10) });
  } catch {
    return res.status(502).json({ error: "Research search failed. Please try again shortly." });
  }
}
