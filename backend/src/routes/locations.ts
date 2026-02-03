import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();

// Get all locations
router.get('/', async (req: Request, res: Response) => {
  const prisma: PrismaClient = req.app.locals.prisma;

  try {
    const locations = await prisma.location.findMany({
      include: {
        _count: {
          select: { bottles: true }
        }
      },
      orderBy: [{ building: 'asc' }, { room: 'asc' }, { name: 'asc' }]
    });

    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Get single location with bottles
router.get('/:id', async (req: Request, res: Response) => {
  const prisma: PrismaClient = req.app.locals.prisma;
  const { id } = req.params;

  try {
    const location = await prisma.location.findUnique({
      where: { id: parseInt(id) },
      include: {
        bottles: {
          include: {
            chemical: true
          },
          where: { status: 'active' }
        }
      }
    });

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

// Create location
router.post('/', async (req: Request, res: Response) => {
  const prisma: PrismaClient = req.app.locals.prisma;
  const { name, description, room, building, storageType } = req.body;

  try {
    const location = await prisma.location.create({
      data: {
        name,
        description,
        room,
        building,
        storageType
      }
    });

    res.status(201).json(location);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A location with this name already exists in this room/building' });
    }
    console.error('Error creating location:', error);
    res.status(500).json({ error: 'Failed to create location' });
  }
});

// Update location
router.put('/:id', async (req: Request, res: Response) => {
  const prisma: PrismaClient = req.app.locals.prisma;
  const { id } = req.params;
  const { name, description, room, building, storageType } = req.body;

  try {
    const location = await prisma.location.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        room,
        building,
        storageType
      }
    });

    res.json(location);
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Delete location
router.delete('/:id', async (req: Request, res: Response) => {
  const prisma: PrismaClient = req.app.locals.prisma;
  const { id } = req.params;

  try {
    // Check if location has bottles
    const bottleCount = await prisma.bottle.count({
      where: { locationId: parseInt(id) }
    });

    if (bottleCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete location with bottles. Move or delete bottles first.',
        bottleCount
      });
    }

    await prisma.location.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

export default router;
