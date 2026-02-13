-- Adds checklist template: "Dørmontering - Sjekkliste"
-- Safe to run multiple times (upsert by id).

insert into public."checklistTemplates" ("id", "name", "items")
values (
  'template-door-installation-checklist',
  'Dørmontering - Sjekkliste',
  '[
    {"text":"Hvor er døråpningen?"},
    {"text":"Er døråpningen klar for dør innsetting?"},
    {"text":"Hvis ja, ignorer dette punktet. Hvis nei, hva skal til for å gjøre den klar?"},
    {"text":"Hvor tykt er blekket døren skal monteres i?"},
    {"text":"Er underlaget jevnt? (Ja innenfor 1–2 mm, nei hvis mer)"},
    {"text":"Samsvarer karm nr. med nr. på tegningen?"},
    {"text":"Er karmen pen eller skadet? All adjufix tilstede."},
    {"text":"Er karmen satt i lodd opp og ned?"},
    {"text":"Er karmen satt i lodd sideveis?"},
    {"text":"Er nr. på dørbladene det samme som på tegning?"},
    {"text":"Er dørbladene uskadet?"},
    {"text":"Går dørbladene bra?"},
    {"text":"Er alle skruer montert?"},
    {"text":"Er propper montert?"},
    {"text":"Er døren dyttet med isolasjon?"},
    {"text":"Er døren fuget?"},
    {"text":"Bilde av ferdig dør"}
  ]'::jsonb
)
on conflict ("id") do update
set
  "name" = excluded."name",
  "items" = excluded."items";

