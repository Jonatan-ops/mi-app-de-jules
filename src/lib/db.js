import Dexie from 'dexie';

export const db = new Dexie('FDAutoRepairDB');

// Version 1: Initial
// db.version(1).stores({
//   orders: '++id, status, client.name, vehicle.plate, mechanicId',
//   mechanics: '++id, name, code'
// });

// Version 2: Add indexes for maintenance and sorting
// db.version(2).stores({
//   orders: '++id, status, client.name, vehicle.plate, mechanicId, isMaintenance, createdAt',
//   mechanics: '++id, name, code'
// });

// Version 3: No major schema changes needed for 'cancelled' status (it uses 'status' index),
// but bumping version keeps things clean if we need to force re-indexing or add future fields.
db.version(3).stores({
  orders: '++id, status, client.name, vehicle.plate, mechanicId, isMaintenance, createdAt',
  mechanics: '++id, name, code'
});

// Helper to seed mechanics if empty
export const seedMechanics = async () => {
  const count = await db.mechanics.count();
  if (count === 0) {
    await db.mechanics.bulkAdd([
      { name: 'Juan Mecánico', code: 'MEC-001' },
      { name: 'Pedro Técnico', code: 'MEC-002' },
      { name: 'Carlos Electricista', code: 'MEC-003' }
    ]);
  }
};

// Initialize
seedMechanics();
