import { Router, Request, Response } from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

const router = Router();

interface ChemicalData {
  casNumber: string;
  name: string;
  formula?: string;
  molecularWeight?: number;
  nfpaHealth?: number;
  nfpaFire?: number;
  nfpaReactivity?: number;
  nfpaSpecial?: string;
  sdsUrl?: string;
  supplier?: string;
}

// CAS lookup using PubChem API (free, reliable)
async function lookupPubChem(casNumber: string): Promise<Partial<ChemicalData> | null> {
  try {
    // Search by CAS number
    const searchUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(casNumber)}/property/MolecularFormula,MolecularWeight,IUPACName/JSON`;
    const response = await axios.get(searchUrl, { timeout: 10000 });

    if (response.data?.PropertyTable?.Properties?.[0]) {
      const props = response.data.PropertyTable.Properties[0];
      return {
        casNumber,
        name: props.IUPACName || '',
        formula: props.MolecularFormula || '',
        molecularWeight: props.MolecularWeight || undefined
      };
    }
  } catch (error) {
    console.error('PubChem lookup error:', error);
  }
  return null;
}

// Try to get SDS and NFPA data from Sigma-Aldrich
async function lookupSigmaAldrich(casNumber: string): Promise<Partial<ChemicalData> | null> {
  try {
    // Search Sigma-Aldrich
    const searchUrl = `https://www.sigmaaldrich.com/US/en/search/${encodeURIComponent(casNumber)}?focus=products&page=1&perpage=30&sort=relevance&term=${encodeURIComponent(casNumber)}&type=cas_number`;

    const response = await axios.get(searchUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    const $ = cheerio.load(response.data);

    // Try to extract product information
    const productName = $('h1[data-testid="product-name"]').first().text().trim() ||
                       $('.product-name').first().text().trim();

    if (productName) {
      return {
        casNumber,
        name: productName,
        supplier: 'Sigma-Aldrich',
        sdsUrl: `https://www.sigmaaldrich.com/US/en/sds/${casNumber}`
      };
    }
  } catch (error) {
    console.error('Sigma-Aldrich lookup error:', error);
  }
  return null;
}

// Common chemical database with NFPA ratings
const commonChemicals: Record<string, Partial<ChemicalData>> = {
  '64-17-5': {
    name: 'Ethanol',
    formula: 'C2H5OH',
    molecularWeight: 46.07,
    nfpaHealth: 0,
    nfpaFire: 3,
    nfpaReactivity: 0
  },
  '67-56-1': {
    name: 'Methanol',
    formula: 'CH3OH',
    molecularWeight: 32.04,
    nfpaHealth: 1,
    nfpaFire: 3,
    nfpaReactivity: 0
  },
  '67-63-0': {
    name: 'Isopropyl Alcohol',
    formula: 'C3H8O',
    molecularWeight: 60.10,
    nfpaHealth: 1,
    nfpaFire: 3,
    nfpaReactivity: 0
  },
  '67-66-3': {
    name: 'Chloroform',
    formula: 'CHCl3',
    molecularWeight: 119.38,
    nfpaHealth: 2,
    nfpaFire: 0,
    nfpaReactivity: 0
  },
  '7732-18-5': {
    name: 'Water',
    formula: 'H2O',
    molecularWeight: 18.02,
    nfpaHealth: 0,
    nfpaFire: 0,
    nfpaReactivity: 0
  },
  '7647-01-0': {
    name: 'Hydrochloric Acid',
    formula: 'HCl',
    molecularWeight: 36.46,
    nfpaHealth: 3,
    nfpaFire: 0,
    nfpaReactivity: 0
  },
  '7664-93-9': {
    name: 'Sulfuric Acid',
    formula: 'H2SO4',
    molecularWeight: 98.08,
    nfpaHealth: 3,
    nfpaFire: 0,
    nfpaReactivity: 2,
    nfpaSpecial: 'W'
  },
  '7697-37-2': {
    name: 'Nitric Acid',
    formula: 'HNO3',
    molecularWeight: 63.01,
    nfpaHealth: 4,
    nfpaFire: 0,
    nfpaReactivity: 0,
    nfpaSpecial: 'OX'
  },
  '7664-38-2': {
    name: 'Phosphoric Acid',
    formula: 'H3PO4',
    molecularWeight: 98.00,
    nfpaHealth: 2,
    nfpaFire: 0,
    nfpaReactivity: 0
  },
  '64-19-7': {
    name: 'Acetic Acid',
    formula: 'CH3COOH',
    molecularWeight: 60.05,
    nfpaHealth: 2,
    nfpaFire: 2,
    nfpaReactivity: 0
  },
  '75-09-2': {
    name: 'Dichloromethane',
    formula: 'CH2Cl2',
    molecularWeight: 84.93,
    nfpaHealth: 2,
    nfpaFire: 1,
    nfpaReactivity: 0
  },
  '110-54-3': {
    name: 'Hexane',
    formula: 'C6H14',
    molecularWeight: 86.18,
    nfpaHealth: 1,
    nfpaFire: 3,
    nfpaReactivity: 0
  },
  '67-64-1': {
    name: 'Acetone',
    formula: 'C3H6O',
    molecularWeight: 58.08,
    nfpaHealth: 1,
    nfpaFire: 3,
    nfpaReactivity: 0
  },
  '108-88-3': {
    name: 'Toluene',
    formula: 'C7H8',
    molecularWeight: 92.14,
    nfpaHealth: 2,
    nfpaFire: 3,
    nfpaReactivity: 0
  },
  '71-43-2': {
    name: 'Benzene',
    formula: 'C6H6',
    molecularWeight: 78.11,
    nfpaHealth: 2,
    nfpaFire: 3,
    nfpaReactivity: 0
  },
  '7727-37-9': {
    name: 'Nitrogen',
    formula: 'N2',
    molecularWeight: 28.01,
    nfpaHealth: 0,
    nfpaFire: 0,
    nfpaReactivity: 0,
    nfpaSpecial: 'SA'
  },
  '7782-44-7': {
    name: 'Oxygen',
    formula: 'O2',
    molecularWeight: 32.00,
    nfpaHealth: 0,
    nfpaFire: 0,
    nfpaReactivity: 0,
    nfpaSpecial: 'OX'
  },
  '1310-73-2': {
    name: 'Sodium Hydroxide',
    formula: 'NaOH',
    molecularWeight: 40.00,
    nfpaHealth: 3,
    nfpaFire: 0,
    nfpaReactivity: 1
  },
  '7681-52-9': {
    name: 'Sodium Hypochlorite',
    formula: 'NaClO',
    molecularWeight: 74.44,
    nfpaHealth: 2,
    nfpaFire: 0,
    nfpaReactivity: 1,
    nfpaSpecial: 'OX'
  },
  '7722-84-1': {
    name: 'Hydrogen Peroxide',
    formula: 'H2O2',
    molecularWeight: 34.01,
    nfpaHealth: 2,
    nfpaFire: 0,
    nfpaReactivity: 1,
    nfpaSpecial: 'OX'
  }
};

// Lookup chemical by CAS number
router.get('/cas/:casNumber', async (req: Request, res: Response) => {
  const { casNumber } = req.params;

  try {
    // Validate CAS number format (XXXXXXX-XX-X)
    const casRegex = /^\d{2,7}-\d{2}-\d$/;
    if (!casRegex.test(casNumber)) {
      return res.status(400).json({ error: 'Invalid CAS number format' });
    }

    let result: ChemicalData = {
      casNumber,
      name: ''
    };

    // Check local database first
    if (commonChemicals[casNumber]) {
      result = { ...result, ...commonChemicals[casNumber] };
    }

    // Try PubChem for additional data
    const pubchemData = await lookupPubChem(casNumber);
    if (pubchemData) {
      result = {
        ...result,
        ...pubchemData,
        // Keep NFPA ratings from local database if available
        nfpaHealth: result.nfpaHealth,
        nfpaFire: result.nfpaFire,
        nfpaReactivity: result.nfpaReactivity,
        nfpaSpecial: result.nfpaSpecial
      };
    }

    // Try Sigma-Aldrich for SDS link
    const sigmaData = await lookupSigmaAldrich(casNumber);
    if (sigmaData) {
      result = {
        ...result,
        sdsUrl: sigmaData.sdsUrl || result.sdsUrl,
        supplier: sigmaData.supplier || result.supplier,
        // Use Sigma name if we don't have one
        name: result.name || sigmaData.name || ''
      };
    }

    if (!result.name) {
      return res.status(404).json({
        error: 'Chemical not found',
        casNumber,
        suggestion: 'Try entering the chemical information manually'
      });
    }

    res.json(result);
  } catch (error) {
    console.error('CAS lookup error:', error);
    res.status(500).json({ error: 'Failed to lookup chemical' });
  }
});

// Search chemicals by name
router.get('/search', async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Search query required' });
  }

  try {
    // Search PubChem
    const searchUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(q)}/property/MolecularFormula,MolecularWeight,IUPACName/JSON`;
    const response = await axios.get(searchUrl, { timeout: 10000 });

    if (response.data?.PropertyTable?.Properties) {
      const results = response.data.PropertyTable.Properties.slice(0, 10).map((props: any) => ({
        name: props.IUPACName || q,
        formula: props.MolecularFormula || '',
        molecularWeight: props.MolecularWeight || null
      }));
      return res.json(results);
    }

    res.json([]);
  } catch (error) {
    console.error('Search error:', error);
    res.json([]);
  }
});

// Get SDS URL for a chemical
router.get('/sds/:casNumber', async (req: Request, res: Response) => {
  const { casNumber } = req.params;

  // Generate SDS URLs for common suppliers
  const sdsUrls = {
    sigmaAldrich: `https://www.sigmaaldrich.com/US/en/sds/sial/${casNumber.replace(/-/g, '')}`,
    fisher: `https://www.fishersci.com/store/msds?partNumber=${casNumber}&vendorId=VN00033897`,
    vwr: `https://us.vwr.com/store/search/searchAdv.jsp?keyword=${casNumber}&pimId=&tabId=&resultType=documents`,
    spectrum: `https://www.spectrumchemical.com/search?term=${casNumber}`
  };

  res.json(sdsUrls);
});

export default router;
