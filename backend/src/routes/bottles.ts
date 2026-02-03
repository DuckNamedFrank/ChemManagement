import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();

// Generate unique bottle IDs
async function generateBottleIds(
  prisma: PrismaClient,
  chemicalId: number,
  quantity: number
): Promise<{ parentId: string; bottleIds: { bottleId: string; childNumber: number }[] }> {
  // Check if this chemical already has bottles
  const existingBottles = await prisma.bottle.findMany({
    where: { chemicalId },
    orderBy: { childNumber: 'desc' },
    take: 1
  });

  let parentId: string;
  let startChildNumber: number;

  if (existingBottles.length > 0) {
    // Use existing parent ID and continue child numbering
    parentId = existingBottles[0].parentId;
    startChildNumber = existingBottles[0].childNumber + 1;
  } else {
    // Generate new parent ID
    const counter = await prisma.idCounter.update({
      where: { prefix: 'CHEM' },
      data: { currentNumber: { increment: 1 } }
    });
    parentId = `CHEM${String(counter.currentNumber).padStart(4, '0')}`;
    startChildNumber = 1;
  }

  const bottleIds = Array.from({ length: quantity }, (_, i) => ({
    bottleId: `${parentId}-${startChildNumber + i}`,
    childNumber: startChildNumber + i
  }));

  return { parentId, bottleIds };
}

// Get all bottles with filters
router.get('/', async (req: Request, res: Response) => {
  const prisma: PrismaClient = req.app.locals.prisma;
  const {
    search,
    chemicalId,
    locationId,
    status,
    expired,
    page = '1',
    limit = '50'
  } = req.query;

  try {
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};

    if (search) {
      where.OR = [
        { bottleId: { contains: search as string } },
        { lotNumber: { contains: search as string } },
        { chemical: { name: { contains: search as string } } },
        { chemical: { casNumber: { contains: search as string } } }
      ];
    }

    if (chemicalId) {
      where.chemicalId = parseInt(chemicalId as string);
    }

    if (locationId) {
      where.locationId = parseInt(locationId as string);
    }

    if (status) {
      where.status = status;
    }

    if (expired === 'true') {
      where.expirationDate = { lt: new Date() };
      where.status = 'active';
    }

    const [bottles, total] = await Promise.all([
      prisma.bottle.findMany({
        where,
        include: {
          chemical: true,
          location: true
        },
        orderBy: [{ parentId: 'asc' }, { childNumber: 'asc' }],
        skip,
        take
      }),
      prisma.bottle.count({ where })
    ]);

    res.json({
      bottles,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Error fetching bottles:', error);
    res.status(500).json({ error: 'Failed to fetch bottles' });
  }
});

// Get single bottle
router.get('/:id', async (req: Request, res: Response) => {
  const prisma: PrismaClient = req.app.locals.prisma;
  const { id } = req.params;

  try {
    const bottle = await prisma.bottle.findUnique({
      where: { id: parseInt(id) },
      include: {
        chemical: true,
        location: true
      }
    });

    if (!bottle) {
      return res.status(404).json({ error: 'Bottle not found' });
    }

    res.json(bottle);
  } catch (error) {
    console.error('Error fetching bottle:', error);
    res.status(500).json({ error: 'Failed to fetch bottle' });
  }
});

// Create new bottles (batch creation)
router.post('/', async (req: Request, res: Response) => {
  const prisma: PrismaClient = req.app.locals.prisma;
  const {
    chemicalId,
    numberOfBottles = 1,
    locationId,
    quantity,
    unit,
    orderDate,
    expirationDate,
    receivedDate,
    lotNumber,
    poNumber,
    notes
  } = req.body;

  try {
    // Verify chemical exists
    const chemical = await prisma.chemical.findUnique({
      where: { id: chemicalId }
    });

    if (!chemical) {
      return res.status(404).json({ error: 'Chemical not found' });
    }

    // Generate bottle IDs
    const { parentId, bottleIds } = await generateBottleIds(
      prisma,
      chemicalId,
      numberOfBottles
    );

    // Create bottles
    const bottles = await Promise.all(
      bottleIds.map(({ bottleId, childNumber }) =>
        prisma.bottle.create({
          data: {
            bottleId,
            parentId,
            childNumber,
            chemicalId,
            locationId: locationId || null,
            quantity: quantity ? parseFloat(quantity) : null,
            unit,
            orderDate: orderDate ? new Date(orderDate) : null,
            expirationDate: expirationDate ? new Date(expirationDate) : null,
            receivedDate: receivedDate ? new Date(receivedDate) : null,
            lotNumber,
            poNumber,
            notes
          },
          include: {
            chemical: true,
            location: true
          }
        })
      )
    );

    res.status(201).json({
      message: `Created ${bottles.length} bottle(s)`,
      bottles
    });
  } catch (error) {
    console.error('Error creating bottles:', error);
    res.status(500).json({ error: 'Failed to create bottles' });
  }
});

// Update bottle
router.put('/:id', async (req: Request, res: Response) => {
  const prisma: PrismaClient = req.app.locals.prisma;
  const { id } = req.params;
  const {
    locationId,
    quantity,
    unit,
    orderDate,
    expirationDate,
    receivedDate,
    status,
    lotNumber,
    poNumber,
    notes
  } = req.body;

  try {
    const bottle = await prisma.bottle.update({
      where: { id: parseInt(id) },
      data: {
        locationId: locationId !== undefined ? (locationId || null) : undefined,
        quantity: quantity !== undefined ? (quantity ? parseFloat(quantity) : null) : undefined,
        unit,
        orderDate: orderDate !== undefined ? (orderDate ? new Date(orderDate) : null) : undefined,
        expirationDate: expirationDate !== undefined ? (expirationDate ? new Date(expirationDate) : null) : undefined,
        receivedDate: receivedDate !== undefined ? (receivedDate ? new Date(receivedDate) : null) : undefined,
        status,
        lotNumber,
        poNumber,
        notes
      },
      include: {
        chemical: true,
        location: true
      }
    });

    res.json(bottle);
  } catch (error) {
    console.error('Error updating bottle:', error);
    res.status(500).json({ error: 'Failed to update bottle' });
  }
});

// Delete bottle
router.delete('/:id', async (req: Request, res: Response) => {
  const prisma: PrismaClient = req.app.locals.prisma;
  const { id } = req.params;

  try {
    await prisma.bottle.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Bottle deleted successfully' });
  } catch (error) {
    console.error('Error deleting bottle:', error);
    res.status(500).json({ error: 'Failed to delete bottle' });
  }
});

// Bulk update bottle status
router.post('/bulk-status', async (req: Request, res: Response) => {
  const prisma: PrismaClient = req.app.locals.prisma;
  const { bottleIds, status } = req.body;

  try {
    const result = await prisma.bottle.updateMany({
      where: { id: { in: bottleIds.map((id: string) => parseInt(id)) } },
      data: { status }
    });

    res.json({ message: `Updated ${result.count} bottles` });
  } catch (error) {
    console.error('Error bulk updating bottles:', error);
    res.status(500).json({ error: 'Failed to update bottles' });
  }
});

export default router;
