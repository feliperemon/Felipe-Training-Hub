// ============================================================
// ALL config pulled from Notion — zero hardcoding in App.jsx
// To update anything: edit ⚙️ Training Config or 📅 Weekly Schedule
// pages in Notion. Site reflects changes on next load.
// ============================================================

const NOTION_TOKEN = process.env.NOTION_TOKEN;

const PAGE_IDS = {
  config:   '320e6abcb90281bcb5c2d8fc3337cb63', // ⚙️ Training Config
  schedule: '320e6abcb90281bf9b43c9514a529c97', // 📅 Weekly Schedule
};

const DB_IDS = {
  workoutLog:  'c245facb-286a-4924-9e63-741c0f910091',
  recoveryLog: 'd9a498bc-7b87-49f2-8e52-ab14d648851f',
};

const headers = {
  'Authorization': `Bearer ${NOTION_TOKEN}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
};

async function fetchPageBlocks(pageId) {
  const res = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`, { headers });
  if (!res.ok) throw new Error(`Notion page error ${res.status}: ${await res.text()}`);
  return res.json();
}

async function fetchBlockChildren(blockId) {
  const res = await fetch(`https://api.notion.com/v1/blocks/${blockId}/children?page_size=100`, { headers });
  if (!res.ok) return { results: [] };
  return res.json();
}

async function queryDB(dbId, sorts, pageSize = 10) {
  const body = { page_size: pageSize };
  if (sorts) body.sorts = sorts;
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST', headers, body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Notion DB error ${res.status}: ${await res.text()}`);
  return res.json();
}

async function queryDBFiltered(dbId, filter, sorts, pageSize = 30) {
  const body = { page_size: pageSize, filter };
  if (sorts) body.sorts = sorts;
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST', headers, body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Notion DB error ${res.status}: ${await res.text()}`);
  return res.json();
}

function prop(page, name) {
  const p = page.properties?.[name];
  if (!p) return null;
  switch (p.type) {
    case 'title':     return p.title?.map(t => t.plain_text).join('') || '';
    case 'rich_text': return p.rich_text?.map(t => t.plain_text).join('') || '';
    case 'number':    return p.number;
    case 'select':    return p.select?.name || null;
    case 'date':      return p.date?.start || null;
    default:          return null;
  }
}

async function parseNotionTable(pageId) {
  const blocks = await fetchPageBlocks(pageId);
  const tableBlock = blocks.results?.find(b => b.type === 'table');
  if (!tableBlock) return { header: [], rows: [] };

  const tableChildren = await fetchBlockChildren(tableBlock.id);
  const rows = tableChildren.results?.filter(b => b.type === 'table_row') || [];
  if (rows.length < 2) return { header: [], rows: [] };

  const header = rows[0].table_row.cells.map(cell =>
    cell.map(t => t.plain_text).join('').trim()
  );

  const data = rows.slice(1).map(row => {
    const obj = {};
    row.table_row.cells.forEach((cell, i) => {
      obj[header[i] || `col${i}`] = cell.map(t => t.plain_text).join('').trim();
    });
    return obj;
  });

  return { header, rows: data };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!NOTION_TOKEN) {
    return res.status(500).json({ error: 'NOTION_TOKEN environment variable is not set. Add it in Vercel → Settings → Environment Variables.' });
  }

  try {
    // 1. Parse ⚙️ Training Config table → key/value map
    const configTable = await parseNotionTable(PAGE_IDS.config);
    const config = {};
    configTable.rows.forEach(row => {
      const key = row['Key'] || row[configTable.header[0]];
      const val = row['Value'] || row[configTable.header[1]];
      if (key) config[key] = val;
    });

    // 2. Parse 📅 Weekly Schedule table → array of day objects
    const scheduleTable = await parseNotionTable(PAGE_IDS.schedule);
    const schedule = scheduleTable.rows;

    // 3. Recent workouts (last 15)
    const workoutsRaw = await queryDB(
      DB_IDS.workoutLog,
      [{ property: 'Date', direction: 'descending' }],
      15
    );

    // 4. Recent recovery (last 7 days)
    const recoveryRaw = await queryDB(
      DB_IDS.recoveryLog,
      [{ property: 'Date', direction: 'descending' }],
      7
    );

    // 5. Weekly stats — from Monday of current week
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);
    const mondayStr = monday.toISOString().split('T')[0];

    const weeklyRaw = await queryDBFiltered(
      DB_IDS.workoutLog,
      { property: 'Date', date: { on_or_after: mondayStr } },
      [{ property: 'Date', direction: 'descending' }],
      30
    );

    let weeklyTSS = 0, weeklyBikeMiles = 0, weeklyRunMiles = 0;
    weeklyRaw.results.forEach(p => {
      weeklyTSS      += prop(p, 'TSS') || 0;
      const sport     = prop(p, 'Sport');
      const dist      = prop(p, 'Distance') || 0;
      if (sport === 'Bike' || sport === 'Brick') weeklyBikeMiles += dist;
      if (sport === 'Run'  || sport === 'Brick') weeklyRunMiles  += dist;
    });

    // Format workouts
    const workouts = workoutsRaw.results.map(p => ({
      id:          p.id,
      activity:    prop(p, 'Activity'),
      sport:       prop(p, 'Sport'),
      sessionType: prop(p, 'Session Type'),
      date:        prop(p, 'Date'),
      duration:    prop(p, 'Duration'),
      distance:    prop(p, 'Distance'),
      avgPace:     prop(p, 'Avg Pace'),
      avgPower:    prop(p, 'Avg Power (W)'),
      normPower:   prop(p, 'Norm Power (W)'),
      tss:         prop(p, 'TSS'),
      avgHR:       prop(p, 'Avg HR'),
      maxHR:       prop(p, 'Max HR'),
      avgCadence:  prop(p, 'Avg Cadence'),
      feel:        prop(p, 'Feel'),
      notes:       prop(p, 'Notes'),
    }));

    // Format recovery
    const recovery = recoveryRaw.results.map(p => ({
      id:          p.id,
      date:        prop(p, 'Date'),
      recoveryPct: prop(p, 'Whoop Recovery %'),
      hrv:         prop(p, 'HRV'),
      rhr:         prop(p, 'RHR'),
      sleepScore:  prop(p, 'Sleep Score %'),
      readiness:   prop(p, 'Readiness'),
      notes:       prop(p, 'Notes'),
    }));

    // Days to race
    const raceDate    = new Date(config.race_date || '2026-07-12');
    const daysToRace  = Math.ceil((raceDate - now) / (1000 * 60 * 60 * 24));

    return res.status(200).json({
      config,
      schedule,
      workouts,
      recovery,
      latestRecovery: recovery[0] || null,
      weeklyStats: {
        tss:        Math.round(weeklyTSS),
        bikeMiles:  Math.round(weeklyBikeMiles * 10) / 10,
        runMiles:   Math.round(weeklyRunMiles  * 10) / 10,
        bikeTarget: parseFloat(config.week_bike_target) || 97,
        runTarget:  parseFloat(config.week_run_target)  || 36,
        tssTarget:  parseFloat(config.week_tss_target)  || 420,
      },
      meta: {
        fetchedAt:   now.toISOString(),
        week:        config.current_week  || '?',
        phase:       config.current_phase || '?',
        goal:        config.race_goal     || 'Sub 4:45',
        daysToRace,
      },
    });

  } catch (err) {
    console.error('Notion API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
