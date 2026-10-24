export type { Vehicle } from '@prisma/client';
export { PrismaStockRepository, type StockRepository } from './stock.repository.js';
export { PrismaVehicleRepository, type VehicleRepository } from './vehicles.repository.js';
export { vehiclesRouter } from './vehicles.routes.js';
export { VehicleService } from './vehicles.service.js';
