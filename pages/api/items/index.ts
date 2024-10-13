import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'POST') {
    const { name, price, quantity, shoppingListId } = req.body
    try {
      const list = await prisma.shoppingList.findUnique({
        where: { id: shoppingListId, userId: session.user.id },
      })
      if (!list) {
        return res.status(404).json({ error: 'List not found' })
      }
      const newItem = await prisma.item.create({
        data: {
          name,
          price,
          quantity,
          checked: false,
          shoppingListId,
        },
      })
      await prisma.shoppingList.update({
        where: { id: shoppingListId },
        data: { total: { increment: 1 } },
      })
      res.status(201).json(newItem)
    } catch (error) {
      res.status(500).json({ error: 'Failed to create item' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
