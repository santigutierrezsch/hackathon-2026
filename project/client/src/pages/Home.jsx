import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container" style={{ maxWidth: 980 }}>
      <header className="card r1" style={{ marginBottom: 16 }}>
        <div className="sectionTitle" style={{ marginTop: 0 }}>Header</div>
        <h1 className="h1">EcoTracker</h1>
        <p className="sub">Track eco actions, earn XP, earn coins, and grow your garden.</p>
      </header>

      <section className="card r2" style={{ marginBottom: 16 }}>
        <div className="sectionTitle" style={{ marginTop: 0 }}>Hero</div>
        <div className="bigStat">
          <div className="headline">A sustainability game with real progress</div>
          <div className="hint">
            Every logged activity gives XP. Your lifetime XP feeds your coin balance, which you can spend to expand and customize your Garden.
          </div>
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <Link className="btn primary" to="/login">Sign In</Link>
          <Link className="btn" to="/login">Get Started</Link>
        </div>
      </section>

      <section className="card r3" style={{ marginBottom: 16 }}>
        <div className="sectionTitle" style={{ marginTop: 0 }}>Body</div>
        <div className="meta">
          <div>EcoTracker helps you log sustainability habits like carpooling, EV usage, and recycling.</div>
          <div>You earn XP for activities and appear on global and social leaderboards.</div>
          <div>XP also grows your coin balance. Coins can be spent on plants or extra plots for your Garden.</div>
          <div>Use the Social page to add friends and compare progress. Visit Resources for calculators and guides.</div>
        </div>
      </section>

      <footer className="card r4">
        <div className="sectionTitle" style={{ marginTop: 0 }}>Footer</div>
        <div className="meta">EcoTracker 2026 Hackathon Build</div>
      </footer>
    </div>
  );
}
