const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const startIdx = code.indexOf('const switchRole = async (role: UserRole) => {');
if (startIdx !== -1) {
  const endIdx = code.indexOf('const addBooking = async (bookingData: any)', startIdx);
  if (endIdx !== -1) {
    code = code.slice(0, startIdx) + code.slice(endIdx);
  }
}

fs.writeFileSync('src/context/AppContext.tsx', code);
