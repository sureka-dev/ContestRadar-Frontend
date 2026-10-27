
import { useEffect, useMemo, useState } from "react";
import "./App.css";

function App() {
  const [competitions, setCompetitions] = useState([]);
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("https://contestradar-cybernaut.onrender.com/api/competitions")
      .then((res) => {
        if (!res.ok) throw new Error("Could not load competition data");
        return res.json();
      })
      .then((data) => {
        if (data.status === "error") {
          throw new Error(data.message || "Could not load competition data");
        }

        const records = Array.isArray(data)
          ? data
          : data.competitions || data.records || [];

        setCompetitions(
          records.map((item, index) => ({
            id: item.id || index,
            name: item.name || item.title || "Untitled competition",
            platform: item.platform || "Other",
            date: item.start_date || item.start_time || item.startTime,
            duration:
              item.duration_minutes ?? item.duration ?? null,
            link: item.link || item.url || "",
          }))
        );
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const platforms = [
    "All",
    ...new Set(competitions.map((item) => item.platform)),
  ];

  const filtered = useMemo(() => {
    return competitions.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return (
        matchesSearch &&
        (platform === "All" || item.platform === platform)
      );
    });
  }, [competitions, search, platform]);

  function formatDate(date) {
    if (!date) return "Date not available";

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatDuration(value) {
    if (value == null || value === "") return "Not specified";
    const minutes = Number(value);

    if (!Number.isFinite(minutes)) return String(value);
    if (minutes < 60) return `${minutes} minutes`;
    if (minutes % 60 === 0) return `${minutes / 60} hours`;

    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  }

  return (
    <div className="app">
      <nav className="navbar">
        <a className="brand" href="#">
          <span className="brand-icon">CR</span>
          ContestRadar<span className="brand-dot">.</span>
        </a>
        <span className="nav-label">HACKATHONS · CONTESTS · CTFs</span>
      </nav>

      <header className="hero">
        <div className="hero-content">
          <span className="eyebrow">YOUR NEXT OPPORTUNITY STARTS HERE</span>
          <h1>
            Find your next
            <br />
            <span>big opportunity.</span>
          </h1>
          <p>
            Discover competitions, explore new challenges, and
            take the next step in your tech journey.
          </p>
          <a className="hero-button" href="#explore">
            Explore competitions ↘
          </a>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span className="orbit orbit-one" />
          <span className="orbit orbit-two" />
          <span className="radar-core">CR</span>
          <span className="radar-label">OPPORTUNITY DETECTED</span>
        </div>
      </header>

      <main id="explore">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE OPPORTUNITY BOARD</span>
            <h2>Explore competitions</h2>
            <p>Find a challenge that matches your interests.</p>
          </div>
          <div className="total-count">
            <strong>{competitions.length}</strong>
            <span>total listings</span>
          </div>
        </div>

        <div className="toolbar">
          <input
            className="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="⌕  Search competitions..."
            aria-label="Search competitions"
          />
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            aria-label="Filter by platform"
          >
            {platforms.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All platforms" : item}
              </option>
            ))}
          </select>
        </div>

        <div className="results-line">
          <span>{filtered.length} competitions found</span>
          <span>DATA-DRIVEN DISCOVERY</span>
        </div>

        {loading && <p className="message">Loading competitions...</p>}
        {error && <p className="message error">{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <p className="message">
            No competitions found. Try another search.
          </p>
        )}

        <div className="competition-grid">
          {filtered.map((item) => (
            <article className="competition-card" key={item.id}>
              <div className="card-top">
                <span className="platform-tag">{item.platform}</span>
                <span className="card-arrow">↗</span>
              </div>

              <h3>{item.name}</h3>

              <div className="detail">
                <span className="detail-icon">◷</span>
                <div>
                  <small>START DATE</small>
                  <p>{formatDate(item.date)}</p>
                </div>
              </div>

              <div className="detail">
                <span className="detail-icon">◴</span>
                <div>
                  <small>DURATION</small>
                  <p>{formatDuration(item.duration)}</p>
                </div>
              </div>

              {item.link ? (
                <a
                  className="card-link"
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  View competition <span>→</span>
                </a>
              ) : (
                <span className="card-link unavailable">
                  Link unavailable
                </span>
              )}
            </article>
          ))}
        </div>
      </main>

      <footer>
        <a className="brand footer-brand" href="#">
          ContestRadar<span className="brand-dot">.</span>
        </a>
        <span>Discover. Participate. Grow.</span>
        <span>Cybernaut Web Scraping Project</span>
      </footer>
    </div>
  );
}

export default App;
