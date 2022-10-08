import prisma from '../../../db/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const place = req.query['place'];

  if (!place || typeof place !== 'string') {
    res.statusCode = 404;

    res.send(JSON.stringify({ message: 'Not found' }));

    return;
  }

  const data = await prisma.Place.findFirst({
    where: {
      name: {
        equals: place,
      },
    },
  });

  if (!data) {
    res.statusCode = 404;

    res.send(JSON.stringify({ message: 'Place not found' }));

    return;
  }

  return res.json(data);
};
