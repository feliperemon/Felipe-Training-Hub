import { useState, useEffect } from "react";

function LoadBadge({ load }) {
  const colors = { HIGH: "#ff3b3b", MOD: "#f5a623", LOW: "#00d084" };
  const c = colors[load] || "#999";
  return <span style={{ fontSize:"9px", fontFamily:"'JetBrains Mono',monospace", fontWeight:600, letterSpacing:"0.08em", color:c, border:`1px solid ${c}33`, padding:"2px 6px", borderRadius:"2px" }}>{load}</span>;
}

function RecoveryRing({ value }) {
  const size=120, stroke=8, r=(size-stroke)/2, circ=2*Math.PI*r;
  const offset = circ - (value/100)*circ;
  const color = value>=67?"#00d084":value>=34?"#f5a623":"#ff3b3b";
  return (
    <div style={{ position:"relative", width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a1a1a" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition:"stroke-dashoffset 1s ease", filter:`drop-shadow(0 0 6px ${color}88)` }}/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:"28px", fontWeight:800, fontFamily:"'Barlow Condensed',sans-serif", color, lineHeight:1 }}>{value}</span>
        <span style={{ fontSize:"10px", color:"#555", fontFamily:"'JetBrains Mono',monospace", marginTop:2 }}>RECOVERY</span>
      </div>
    </div>
  );
}

function StatPill({ label, value, unit, highlight }) {
  return (
    <div style={{ background:highlight?"#0d1f12":"#0e0e0e", border:`1px solid ${highlight?"#00d08433":"#1a1a1a"}`, borderRadius:"6px", padding:"12px 16px", display:"flex", flexDirection:"column", gap:4 }}>
      <span style={{ fontSize:"10px", color:"#444", fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.1em" }}>{label}</span>
      <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
        <span style={{ fontSize:"22px", fontWeight:800, fontFamily:"'Barlow Condensed',sans-serif", color:highlight?"#00d084":"#e0e0e0" }}>{value ?? "—"}</span>
        {unit && <span style={{ fontSize:"11px", color:"#555", fontFamily:"'JetBrains Mono',monospace" }}>{unit}</span>}
      </div>
    </div>
  );
}

function ProgressBar({ value, target, color="#00d084", label, unit }) {
  const pct = Math.min((value/target)*100, 100);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <div style={{ display:"flex", justifyContent:"space-between" }}>
        <span style={{ fontSize:"11px", color:"#555", fontFamily:"'JetBrains Mono',monospace" }}>{label}</span>
        <span style={{ fontSize:"11px", color:"#888", fontFamily:"'JetBrains Mono',monospace" }}>{value}<span style={{ color:"#444" }}>/{target} {unit}</span></span>
      </div>
      <div style={{ height:4, background:"#1a1a1a", borderRadius:2, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:2, transition:"width 1s ease", boxShadow:`0 0 8px ${color}66` }}/>
      </div>
    </div>
  );
}

function WorkoutRow({ w }) {
  const sportColor = { Bike:"#f5a623", Run:"#00d084", Swim:"#4ecdc4", Lift:"#a78bfa", Soccer:"#60a5fa", Brick:"#ff6b6b" };
  const color = sportColor[w.sport] || "#888";
  return (
    <div style={{ display:"grid", gridTemplateColumns:"80px 1fr auto", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"1px solid #111" }}>
      <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
        <span style={{ fontSize:"10px", color:"#444", fontFamily:"'JetBrains Mono',monospace" }}>{w.date}</span>
        <span style={{ fontSize:"10px", fontWeight:600, fontFamily:"'JetBrains Mono',monospace", color, border:`1px solid ${color}33`, padding:"1px 5px", borderRadius:"2px", display:"inline-block" }}>{w.sport?.toUpperCase()}</span>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
        <span style={{ fontSize:"13px", fontWeight:600, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"0.03em", color:"#d0d0d0" }}>{w.activity}</span>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {w.distance && <span style={{ fontSize:"10px", color:"#555", fontFamily:"'JetBrains Mono',monospace" }}>{w.distance} mi</span>}
          {w.avgPace && <span style={{ fontSize:"10px", color:"#555", fontFamily:"'JetBrains Mono',monospace" }}>{w.avgPace}</span>}
          {w.avgPower && <span style={{ fontSize:"10px", color:"#555", fontFamily:"'JetBrains Mono',monospace" }}>{w.avgPower}W avg</span>}
          {w.normPower && <span style={{ fontSize:"10px", color:"#555", fontFamily:"'JetBrains Mono',monospace" }}>NP {w.normPower}W</span>}
          {w.avgHR && <span style={{ fontSize:"10px", color:"#555", fontFamily:"'JetBrains Mono',monospace" }}>{w.avgHR} bpm</span>}
          {w.avgCadence && <span style={{ fontSize:"10px", color:w.avgCadence>=88?"#00d084":"#f5a623", fontFamily:"'JetBrains Mono',monospace" }}>{w.avgCadence} rpm</span>}
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3 }}>
        {w.tss && <span style={{ fontSize:"13px", fontWeight:700, fontFamily:"'Barlow Condensed',sans-serif", color:"#888" }}>TSS {Math.round(w.tss)}</span>}
        {w.feel && <span style={{ fontSize:"10px", color:"#444", fontFamily:"'JetBrains Mono',monospace" }}>{w.feel}</span>}
      </div>
    </div>
  );
}

const s = {
  card: { background:"#0e0e0e", border:"1px solid #151515", borderRadius:"8px", padding:"20px" },
  cardTitle: { fontFamily:"'Barlow Condensed',sans-serif", fontSize:"11px", fontWeight:700, letterSpacing:"0.15em", color:"#333", textTransform:"uppercase", marginBottom:16 },
  gap: { display:"flex", flexDirection:"column", gap:12 },
  grid2: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 },
  grid4: { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 },
};

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    fetch("/api/notion")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const today = new Date().getDay();
  const cfg = data?.config || {};
  const ws = data?.weeklyStats || {};
  const lr = data?.latestRecovery;

  // Build today's schedule from Notion schedule data
  const todaySchedule = data?.schedule?.find(row => parseInt(row["Day Number"]) === today);

  // Extract PRs from config (keys starting with pr_)
  const prs = Object.entries(cfg)
    .filter(([k]) => k.startsWith("pr_"))
    .map(([k, v]) => {
      const label = k.replace("pr_", "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      const [value, date] = v.split("|");
      return { lift: label, pr: value?.trim(), date: date?.trim() };
    });

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#080808", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box;margin:0;padding:0} body{background:#080808}`}</style>
      <div style={{ width:40, height:40, border:"3px solid #151515", borderTop:"3px solid #00d084", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"11px", color:"#333" }}>LOADING TRAINING DATA</span>
    </div>
  );

  if (error) return (
    <div style={{ minHeight:"100vh", background:"#080808", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0} body{background:#080808}`}</style>
      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"12px", color:"#ff3b3b", background:"#1a0a0a", padding:24, borderRadius:8, border:"1px solid #ff3b3b33" }}>
        ERROR: {error}<br/><span style={{ color:"#555", fontSize:"10px" }}>Check NOTION_TOKEN in Vercel → Settings → Environment Variables</span>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#080808", color:"#e0e0e0", fontFamily:"'Barlow',sans-serif" }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0} body{background:#080808} ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#080808} ::-webkit-scrollbar-thumb{background:#222;border-radius:2px}`}</style>

      {/* Header */}
      <header style={{ background:"#0a0a0a", borderBottom:"1px solid #151515", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:56, position:"sticky", top:0, zIndex:100 }}>
        <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"20px", fontWeight:900, letterSpacing:"0.1em", color:"#fff", textTransform:"uppercase" }}>Felipe · Training OS</span>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {data?.meta && <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"10px", color:"#333" }}>{data.meta.daysToRace}D TO RACE</span>}
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"10px", color:"#00d084", border:"1px solid #00d08433", padding:"4px 10px", borderRadius:"2px", letterSpacing:"0.06em" }}>
            {cfg.race_goal || "SUB 4:45"} · MUSSELMAN 70.3
          </span>
        </div>
      </header>

      {/* Nav */}
      <nav style={{ display:"flex", gap:0, borderBottom:"1px solid #111", padding:"0 24px", background:"#080808", position:"sticky", top:56, zIndex:99 }}>
        {["dashboard","workouts","recovery","schedule","strength"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            fontFamily:"'JetBrains Mono',monospace", fontSize:"11px", letterSpacing:"0.08em",
            fontWeight:activeTab===tab?600:400, color:activeTab===tab?"#00d084":"#444",
            background:"none", border:"none", cursor:"pointer", padding:"14px 16px",
            borderBottom:activeTab===tab?"2px solid #00d084":"2px solid transparent",
          }}>{tab.toUpperCase()}</button>
        ))}
      </nav>

      <main style={{ padding:"24px", maxWidth:900, margin:"0 auto" }}>

        {/* DASHBOARD */}
        {activeTab==="dashboard" && (
          <div style={s.gap}>
            <div style={s.grid2}>
              {/* Recovery card */}
              <div style={s.card}>
                <div style={s.cardTitle}>Latest Recovery</div>
                {lr ? (
                  <div style={{ display:"flex", gap:20, alignItems:"center" }}>
                    <RecoveryRing value={lr.recoveryPct||0}/>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, flex:1 }}>
                      <StatPill label="HRV" value={lr.hrv}/>
                      <StatPill label="RHR" value={lr.rhr} unit="bpm"/>
                      <StatPill label="SLEEP" value={lr.sleepScore} unit="%"/>
                      <div style={{ background:"#0e0e0e", border:"1px solid #1a1a1a", borderRadius:"6px", padding:"12px 16px", display:"flex", flexDirection:"column", gap:4 }}>
                        <span style={{ fontSize:"10px", color:"#444", fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.1em" }}>STATUS</span>
                        <span style={{ fontSize:"12px", fontWeight:700, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"0.05em",
                          color:lr.readiness?.includes("Green")?"#00d084":lr.readiness?.includes("Yellow")?"#f5a623":"#ff3b3b" }}>
                          {lr.readiness?.includes("Green")?"TRAIN HARD":lr.readiness?.includes("Yellow")?"TRAIN MOD":"BACK OFF"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : <span style={{ fontSize:"12px", color:"#333", fontFamily:"'JetBrains Mono',monospace" }}>No recovery data today</span>}
              </div>

              {/* Today card — 100% from Notion schedule */}
              <div style={s.card}>
                <div style={s.cardTitle}>Today — {todaySchedule?.Day || "—"}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    {todaySchedule && <LoadBadge load={todaySchedule.Load}/>}
                    <span style={{ fontSize:"10px", color:"#333", fontFamily:"'JetBrains Mono',monospace" }}>WK {cfg.current_week} · {cfg.current_phase}</span>
                  </div>
                  {["AM Session","PM Session"].map(slot => (
                    <div key={slot} style={{ background:"#111", borderRadius:4, padding:"10px 12px" }}>
                      <div style={{ fontSize:"10px", color:"#444", fontFamily:"'JetBrains Mono',monospace", marginBottom:4 }}>{slot.split(" ")[0]}</div>
                      <div style={{ fontSize:"14px", fontWeight:600, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:"0.03em" }}>{todaySchedule?.[slot] || "Rest"}</div>
                      {todaySchedule?.[slot==="AM Session"?"AM Target":"PM Target"] && (
                        <div style={{ fontSize:"10px", color:"#444", fontFamily:"'JetBrains Mono',monospace", marginTop:4 }}>{todaySchedule[slot==="AM Session"?"AM Target":"PM Target"]}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weekly volume — targets from Notion config */}
            <div style={s.card}>
              <div style={s.cardTitle}>Week {cfg.current_week} Volume Progress</div>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <ProgressBar label="BIKE" value={ws.bikeMiles||0} target={ws.bikeTarget||97} unit="mi" color="#f5a623"/>
                <ProgressBar label="RUN" value={ws.runMiles||0} target={ws.runTarget||36} unit="mi" color="#00d084"/>
                <ProgressBar label="TSS" value={ws.tss||0} target={ws.tssTarget||420} unit="pts" color="#a78bfa"/>
              </div>
            </div>

            {/* Key metrics — from Notion config */}
            <div style={s.grid4}>
              <StatPill label="FTP" value={cfg.ftp} unit="W"/>
              <StatPill label="THRESHOLD" value={cfg.run_threshold_pace} unit="pace"/>
              <StatPill label="Z2 PACE" value={cfg.z2_run_pace}/>
              <StatPill label="CADENCE TARGET" value={cfg.cadence_target} unit="rpm" highlight/>
            </div>

            {/* Recent workouts */}
            <div style={s.card}>
              <div style={s.cardTitle}>Recent Workouts</div>
              {data?.workouts?.slice(0,4).map(w => <WorkoutRow key={w.id} w={w}/>)}
            </div>
          </div>
        )}

        {/* WORKOUTS */}
        {activeTab==="workouts" && (
          <div style={s.card}>
            <div style={s.cardTitle}>All Recent Workouts</div>
            {data?.workouts?.length
              ? data.workouts.map(w => <WorkoutRow key={w.id} w={w}/>)
              : <span style={{ fontSize:"12px", color:"#333", fontFamily:"'JetBrains Mono',monospace" }}>No workouts loaded</span>}
          </div>
        )}

        {/* RECOVERY */}
        {activeTab==="recovery" && (
          <div style={s.gap}>
            {data?.recovery?.map(r => (
              <div key={r.id} style={s.card}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"16px", fontWeight:700 }}>{r.date}</span>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"10px", color:r.readiness?.includes("Green")?"#00d084":r.readiness?.includes("Yellow")?"#f5a623":"#ff3b3b" }}>{r.readiness}</span>
                </div>
                <div style={s.grid4}>
                  <StatPill label="RECOVERY" value={r.recoveryPct} unit="%" highlight={r.recoveryPct>=67}/>
                  <StatPill label="HRV" value={r.hrv}/>
                  <StatPill label="RHR" value={r.rhr} unit="bpm"/>
                  <StatPill label="SLEEP" value={r.sleepScore} unit="%"/>
                </div>
                {r.notes && <div style={{ marginTop:12, fontSize:"12px", color:"#444", fontFamily:"'JetBrains Mono',monospace", lineHeight:1.6 }}>{r.notes}</div>}
              </div>
            ))}
          </div>
        )}

        {/* SCHEDULE — 100% from Notion */}
        {activeTab==="schedule" && (
          <div style={s.gap}>
            {data?.schedule?.map((row, i) => {
              const isToday = parseInt(row["Day Number"]) === today;
              return (
                <div key={i} style={{ ...s.card, border:isToday?"1px solid #00d08444":"1px solid #151515", background:isToday?"#0a1a0e":"#0e0e0e" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"20px", fontWeight:900, letterSpacing:"0.1em", color:isToday?"#00d084":"#e0e0e0" }}>{row.Day}</span>
                      {isToday && <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"9px", color:"#00d084", border:"1px solid #00d08433", padding:"2px 6px", borderRadius:"2px" }}>TODAY</span>}
                    </div>
                    <LoadBadge load={row.Load}/>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    {["AM Session","PM Session"].map(slot => (
                      <div key={slot} style={{ background:"#111", borderRadius:4, padding:"10px 12px" }}>
                        <div style={{ fontSize:"9px", color:"#333", fontFamily:"'JetBrains Mono',monospace", marginBottom:4 }}>{slot.split(" ")[0]}</div>
                        <div style={{ fontSize:"13px", fontFamily:"'Barlow Condensed',sans-serif", fontWeight:600, letterSpacing:"0.02em" }}>{row[slot]}</div>
                        {row[slot==="AM Session"?"AM Target":"PM Target"] && (
                          <div style={{ fontSize:"10px", color:"#444", fontFamily:"'JetBrains Mono',monospace", marginTop:4 }}>{row[slot==="AM Session"?"AM Target":"PM Target"]}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* STRENGTH — PRs from Notion config */}
        {activeTab==="strength" && (
          <div style={s.gap}>
            <div style={s.card}>
              <div style={s.cardTitle}>Current PRs — Wk {cfg.current_week}</div>
              {prs.length ? prs.map((pr, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:i<prs.length-1?"1px solid #111":"none" }}>
                  <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:"15px", fontWeight:600, letterSpacing:"0.03em" }}>{pr.lift}</span>
                  <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"13px", color:"#00d084", fontWeight:600 }}>{pr.pr}</span>
                    {pr.date && <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"10px", color:"#333" }}>{pr.date}</span>}
                  </div>
                </div>
              )) : <span style={{ fontSize:"12px", color:"#333", fontFamily:"'JetBrains Mono',monospace" }}>No PRs found in config</span>}
            </div>
            <div style={{ ...s.card, background:"#0a0a14", border:"1px solid #a78bfa22" }}>
              <div style={s.cardTitle}>Strength Notes</div>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"11px", color:"#555", lineHeight:1.8 }}>
                · Volume = stacked weight only (machine weight excluded)<br/>
                · 3x/week through Wk 10 → drops to 2x full-body at Wk 11+<br/>
                · Strength PRs are primary indicator recomp is working<br/>
                · Lower Heavy on Mon PM — furthest from Thu tempo + Fri long bike
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
