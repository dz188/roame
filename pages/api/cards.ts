import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.join(process.cwd(), 'data', 'cards.json');
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const cards = JSON.parse(fileContents);
    res.status(200).json(cards);
  } catch (err) {
    console.error('Error reading cards.json:', err);
    res.status(500).json({ error: 'Failed to load cards' });
  }
}
