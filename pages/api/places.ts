import prisma from '../../db/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      const findPlace = await prisma.place.findFirst({
        where: {
          name: {
            equals: req.body.name,
          },
        },
      });

      if (findPlace) {
        await prisma.place.delete({
          where: {
            id: findPlace?.id,
          },
        });

        return res.status(200).json({ message: 'Country deleted' });
      }

      const createPlace = await prisma.place.create({
        data: {
          isoCode: req.body.isoCode,
          name: req.body.name,
          lat: req.body.lat,
          lng: req.body.lng,
        },
      });

      return res.status(200).json(createPlace);
    } catch (error) {
      return res.status(404).json({ message: 'Server error' });
    }
  } else {
    const data = await prisma.place.findMany();

    if (!data) return res.status(404).json({ message: 'No places found' });

    return res.status(200).json(data);
  }
};
