/* Read-only project data. No UI or persistence dependencies. */
window.MolassiRepository = (() => {
 const data = window.MOLASSI_DATA;
 if (!data || data.schemaVersion !== 2) throw new Error('Dati planimetrie non validi');
 const ids = new Set();
 for (const u of data.units) { if(ids.has(u.id)) throw new Error('Unità duplicata'); ids.add(u.id); Object.freeze(u); }
 const geometryIds=new Set();
 for(const g of data.geometries){const key=g.floor+':'+g.unitId;if(!ids.has(g.unitId)||!g.path||geometryIds.has(key))throw Error('Geometria non valida');geometryIds.add(key);Object.freeze(g)}
 const get=id=>data.units.find(u=>u.id===id);
 return Object.freeze({floors:data.floors,viewBox:data.viewBox,units:data.units,get,forFloor:id=>data.geometries.filter(g=>g.floor===id).map(g=>({...get(g.unitId),...g,id:g.unitId}))});
})();
