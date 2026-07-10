const db = require('./db');
db.query("DESCRIBE prescriptions")
  .then(res => console.log(res[0]))
  .catch(console.error)
  .finally(() => process.exit(0));
