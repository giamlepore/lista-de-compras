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

  const { id } = req.query

  if (req.method === 'PUT') {
    const { checked, quantity } = req.body
    try {
      const updatedItem = await prisma.item.update({
        where: { id: String(id) },
        data: { checked, quantity },
      })
      const list = await prisma.shoppingList.findUnique({
        where: { id: updatedItem.shoppingListId },
        include: { items: true },
      })
      if (list) {
        await prisma.shoppingList.update({
          where: { id: list.id },
          data: { progress: list.items.filter((item: { checked: boolean }) => item.checked).length },
        })
      }
      res.status(200).json(updatedItem)
    } catch (error) {
      res.status(500).json({ error: 'Failed to update item' })
    }
  } else if (req.method === 'DELETE') {
    try {
      const deletedItem = await prisma.item.delete({
        where: { id: String(id) },
      })
      await prisma.shoppingList.update({
        where: { id: deletedItem.shoppingListId },
        data: { 
          total: { decrement: 1 },
          progress: { decrement: deletedItem.checked ? 1 : 0 },
        },
      })
      res.status(204).end()
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete item' })
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
