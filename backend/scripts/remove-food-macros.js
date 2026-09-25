require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');

async function removeFoodMacroFields() {
  await mongoose.connect(process.env.MONGO_URL);

  const result = await mongoose.connection.collection('foods').updateMany(
    {},
    { $unset: { protein: '', carbs: '', fat: '' } },
  );

  console.log(
    `Removed protein, carbs, and fat from ${result.modifiedCount} Food document(s).`,
  );
  await mongoose.disconnect();
}

removeFoodMacroFields().catch((error) => {
  console.error('Food macro migration failed:', error.message);
  process.exitCode = 1;
});
