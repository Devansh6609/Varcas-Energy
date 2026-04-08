const bcrypt = require('bcryptjs');
const fs = require('fs');

const hash = bcrypt.hashSync('varcas@155', 10);
const sql = `INSERT INTO "User" ("id", "email", "name", "password", "role", "updatedAt") 
VALUES ('admin1', 'info@varcasenergy.com', 'Info Admin', '${hash}', 'Master', CURRENT_TIMESTAMP);
INSERT INTO "User" ("id", "email", "name", "password", "role", "updatedAt") 
VALUES ('admin2', 'admin@varcasenergy.com', 'Master Admin', '${hash}', 'Master', CURRENT_TIMESTAMP);`;

fs.writeFileSync('seed.sql', sql);
console.log('seed.sql generated');
