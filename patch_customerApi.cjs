const fs = require('fs');
let code = fs.readFileSync('src/api/customerApi.ts', 'utf8');

const newMethods = `
  getProviders: async (category: string) => {
    const url = category === 'all' ? '/providers' : \`/providers/category/\${category}\`;
    const response = await axiosInstance.get(url);
    return response.data;
  },
  createBooking: async (data: any) => {
    const response = await axiosInstance.post('/bookings', data);
    return response.data;
  },
`;

code = code.replace(/export const customerApi = \{/, 'export const customerApi = {\n' + newMethods);

fs.writeFileSync('src/api/customerApi.ts', code);
