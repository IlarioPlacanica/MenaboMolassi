/* Read-only project data. No UI or persistence dependencies. */
window.MolassiRepository = (() => {
 const data = window.MOLASSI_DATA;
 if (!data || data.schemaVersion !== 1) throw new Error('Dati planimetrie non validi');
 const ids = new Set();
 for (const u of data.units) { if(ids.has(u.id) || !u.path) throw new Error('Geometria duplicata o assente'); ids.add(u.id); Object.freeze(u); }
 return Object.freeze({floors:data.floors,viewBox:data.viewBox,units:data.units,get:id=>data.units.find(u=>u.id===id),forFloor:id=>data.units.filter(u=>u.floor===id)});
})();