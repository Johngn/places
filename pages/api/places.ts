import prisma from '../../db/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  console.log(req.body);
  if (req.method === 'POST') {
    try {
      const createPlace = await prisma.place.create({
        data: {
          name: req.body.name,
          lat: req.body.lat,
          lng: req.body.lng,
        },
      });

      return res.status(200).json(createPlace);
    } catch (error) {
      // console.log(error);
      return res.status(404).json({ message: 'Server error' });
    }
  } else {
    const data = await prisma.place.findMany();

    if (!data) {
      return res.status(404).json({ message: 'No places found' });
    }

    return res.status(200).json(data);
  }
};
