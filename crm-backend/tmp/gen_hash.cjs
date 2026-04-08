const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('varcas@155', 10);
console.log(hash);
