import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();

// Get all chemicals with optional search
router.get('/', async (req: Request, res: Response) => {
  const prisma: PrismaClient = req.app.locals.prisma;
  const { search, page = '1', limit = '50' } = req.query;

  try {
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where = search
      ? {
          OR: [
            { name: { contains: search as string } },
            { casNumber: { contains: search as string } },
            { formula: { contains: search as string } }
          ]
        }
      : {};

    const [chemicals, total] = await Promise.all([
      prisma.chemical.findMany({
        where,
        include: {
          bottles: {
            select: {
              id: true,
              bottleId: true,
              status: true
            }
          }
        },
        orderBy: { name: 'asc' },
        skip,
        take
      }),
      prisma.chemical.count({ where })
    ]);

    res.json({
      chemicals,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Error fetching chemicals:', error);
    res.status(500).json({ error: 'Failed to fetch chemicals' });
  }
});

// Get single chemical by ID
router.get('/:id', async (req: Request, res: Response) => {
  const prisma: PrismaClient = req.app.locals.prisma;
  const { id } = req.params;

  try {
    const chemical = await prisma.chemical.findUnique({
      where: { id: parseInt(id) },
      include: {
        bottles: {
          include: {
            location: true
          },
          orderBy: { childNumber: 'asc' }
        }
      }
    });

    if (!chemical) {
      return res.status(404).json({ error: 'Chemical not found' });
    }

    res.json(chemical);
  } catch (error) {
    console.error('Error fetching chemical:', error);
    res.status(500).json({ error: 'Failed to fetch chemical' });
  }
});

// Create new chemical
router.post('/', async (req: Request, res: Response) => {
  const prisma: PrismaClient = req.app.locals.prisma;
  const {
    casNumber,
    name,
    formula,
    molecularWeight,
    nfpaHealth,
    nfpaFire,
    nfpaReactivity,
    nfpaSpecial,
    sdsUrl,
    supplier
  } = req.body;

  try {
    // Check if chemical with same CAS already exists
    if (casNumber) {
      const existing = await prisma.chemical.findUnique({
        where: { casNumber }
      });
      if (existing) {
        return res.status(400).json({
          error: 'Chemical with this CAS number already exists',
          existingId: existing.id
        });
      }
    }

    const chemical = await prisma.chemical.create({
      data: {
        casNumber,
        name,
        formula,
        molecularWeight: molecularWeight ? parseFloat(molecularWeight) : null,
        nfpaHealth: nfpaHealth !== undefined ? parseInt(nfpaHealth) : null,
        nfpaFire: nfpaFire !== undefined ? parseInt(nfpaFire) : null,
        nfpaReactivity: nfpaReactivity !== undefined ? parseInt(nfpaReactivity) : null,
        nfpaSpecial,
        sdsUrl,
        supplier
      }
    });

    res.status(201).json(chemical);
  } catch (error) {
    console.error('Error creating chemical:', error);
    res.status(500).json({ error: 'Failed to create chemical' });
  }
});

// Update chemical
router.put('/:id', async (req: Request, res: Response) => {
  const prisma: PrismaClient = req.app.locals.prisma;
  const { id } = req.params;
  const {
    casNumber,
    name,
    formula,
    molecularWeight,
    nfpaHealth,
    nfpaFire,
    nfpaReactivity,
    nfpaSpecial,
    sdsUrl,
    supplier
  } = req.body;

  try {
    const chemical = await prisma.chemical.update({
      where: { id: parseInt(id) },
      data: {
        casNumber,
        name,
        formula,
        molecularWeight: molecularWeight ? parseFloat(molecularWeight) : null,
        nfpaHealth: nfpaHealth !== undefined ? parseInt(nfpaHealth) : null,
        nfpaFire: nfpaFire !== undefined ? parseInt(nfpaFire) : null,
        nfpaReactivity: nfpaReactivity !== undefined ? parseInt(nfpaReactivity) : null,
        nfpaSpecial,
        sdsUrl,
        supplier
      }
    });

    res.json(chemical);
  } catch (error) {
    console.error('Error updating chemical:', error);
    res.status(500).json({ error: 'Failed to update chemical' });
  }
});

// Delete chemical
router.delete('/:id', async (req: Request, res: Response) => {
  const prisma: PrismaClient = req.app.locals.prisma;
  const { id } = req.params;

  try {
    await prisma.chemical.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Chemical deleted successfully' });
  } catch (error) {
    console.error('Error deleting chemical:', error);
    res.status(500).json({ error: 'Failed to delete chemical' });
  }
});

export default router;
