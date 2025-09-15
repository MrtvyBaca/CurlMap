const SUPABASE_URL = "https://xcbsoxeewblunomupxld.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjYnNveGVld2JsdW5vbXVweGxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NTA2NjMsImV4cCI6MjA3MzUyNjY2M30.aKMnlJD86fAovjp8DOdO3I7bXmW22tSZF4QRICAypL4";

/**
 * Načíta kluby vrátane venue a tournaments z view `clubs_with_tournaments`
 * – formát presne ako tvoje pôvodné clubs.json.
 */
export async function loadClubs({ q = "", region = "", ice = "" } = {}){
  // Zatiaľ berieme všetko a filtrujeme na klientovi (máš hotovú logiku).
  // Ak chceš, nižšie sú príklady server-side filter parametrov.
  const url = `${SUPABASE_URL}/rest/v1/clubs_with_tournaments`;

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const txt = await res.text().catch(()=> "");
    throw new Error(`HTTP ${res.status} ${txt}`);
  }
  return await res.json();
}
