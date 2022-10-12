import prisma from '../../db/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const session = await getSession({ req });
    if (!session) return res.status(401).json({ message: 'Not logged in' });

    // console.log(session);

    try {
      const user = await prisma.user.findUnique({
        where: {
          email: session.user?.email || undefined,
        },
      });

      if (!user) return res.status(401).json({ message: 'User not found' });

      const findPlace = await prisma.place.findFirst({
        where: {
          name: {
            equals: req.body.name,
          },
          userId: {
            equals: user?.id,
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
          userId: user?.id,
        },
      });

      return res.status(200).json(createPlace);
    } catch (error) {
      return res.status(404).json({ message: 'Server error' });
    }
  }
};
