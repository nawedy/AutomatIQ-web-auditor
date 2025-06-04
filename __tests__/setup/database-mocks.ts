// __tests__/setup/database-mocks.ts
// Mock for database.ts module

export const websiteQueries = {
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

export const auditQueries = {
  findByWebsiteId: jest.fn(),
  create: jest.fn(),
};

// Mock for sql
const sql = jest.fn();
sql.unsafe = jest.fn();

export default sql;
