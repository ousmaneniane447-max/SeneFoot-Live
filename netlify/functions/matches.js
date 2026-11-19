
exports.handler = async function () {
  const key = process.env.API_FOOTBALL_KEY;

  if (!key) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Clé API non configurée dans Netlify."
      })
    };
  }

  try {
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Dakar",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date());

    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${today}&timezone=Africa%2FDakar`,
      {
        headers: {
          "x-apisports-key": key
        }
      }
    );

    const payload = await response.json();

    if (!response.ok || (payload.errors && Object.keys(payload.errors).length)) {
      throw new Error("Erreur API");
    }

    const matches = (payload.response || []).map(x => ({
      date: x.fixture.date,
      status: x.fixture.status.short,
      statusText: x.fixture.status.long,
      time: new Date(x.fixture.date).toLocaleTimeString("fr-FR", {
        timeZone: "Africa/Dakar",
        hour: "2-digit",
        minute: "2-digit"
      }),
      home: x.teams.home.name,
      away: x.teams.away.name,
      goalsHome: x.goals.home,
      goalsAway: x.goals.away,
      league: {
        name: x.league.name,
        country: x.league.country
      }
    }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=45"
      },
      body: JSON.stringify({ date: today, matches })
    };
  } catch (e) {
    return {
      statusCode: 502,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Données football temporairement indisponibles."
      })
    };
  }
};
