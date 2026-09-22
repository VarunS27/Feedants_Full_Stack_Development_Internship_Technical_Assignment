/* eslint-disable no-console */
/**
 * Applies the index definitions in the models to the database, dropping indexes that
 * no longer exist in code. Run after changing an index definition.
 *
 * Kept as an explicit script rather than running at boot: on a large collection an
 * index build is expensive and must be a deliberate, observable deployment step.
 */
const { connectDatabase, disconnectDatabase } = require('../src/config/database');

const models = [
  require('../src/models/User'),
  require('../src/models/Competition'),
  require('../src/models/Registration'),
];

const run = async () => {
  await connectDatabase();

  for (const model of models) {
    const dropped = await model.syncIndexes();
    console.log(`${model.modelName}: synced` + (dropped.length ? `, dropped ${dropped.join(', ')}` : ''));
    const indexes = await model.collection.indexes();
    indexes.forEach((i) => console.log(`   - ${i.name}`));
  }

  await disconnectDatabase();
};

run().catch(async (error) => {
  console.error('Index sync failed:', error);
  await disconnectDatabase().catch(() => {});
  process.exit(1);
});
