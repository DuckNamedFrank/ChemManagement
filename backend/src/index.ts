import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import chemicalRoutes from './routes/chemicals';
import bottleRoutes from './routes/bottles';
import locationRoutes from './routes/locations';
import lookupRoutes from './routes/lookup';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Make prisma available to routes
app.locals.prisma = prisma;

// Routes
app.use('/api/chemicals', chemicalRoutes);
app.use('/api/bottles', bottleRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/lookup', lookupRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Dashboard stats
app.get('/api/stats', async (req, res) => {
  try {
    const [
      totalChemicals,
      totalBottles,
      activeBottles,
      expiredBottles,
      totalLocations
    ] = await Promise.all([
      prisma.chemical.count(),
      prisma.bottle.count(),
      prisma.bottle.count({ where: { status: 'active' } }),
      prisma.bottle.count({
        where: {
          expirationDate: { lt: new Date() },
          status: 'active'
        }
      }),
      prisma.location.count()
    ]);

    res.json({
      totalChemicals,
      totalBottles,
      activeBottles,
      expiredBottles,
      totalLocations
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Initialize ID counter if not exists
async function initializeIdCounter() {
  const counter = await prisma.idCounter.findUnique({
    where: { prefix: 'CHEM' }
  });

  if (!counter) {
    await prisma.idCounter.create({
      data: { prefix: 'CHEM', currentNumber: 0 }
    });
  }
}

// Start server
app.listen(PORT, async () => {
  await initializeIdCounter();
  console.log(`Server running on port ${PORT}`);
});

export { prisma };
