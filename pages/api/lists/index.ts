import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getServerSession(req, res, authOptions)
  
    console.log('Session:', session); // Add this line for debugging
  
    if (!session) {
      console.log('No session found'); // Add this line for debugging
      return res.status(401).json({ error: 'Unauthorized' })
    }
  
    if (req.method === 'GET') {
      try {
        const lists = await prisma.shoppingList.findMany({
          where: { userId: session.user.id },
          include: { items: true },
        })
        res.status(200).json(lists)
      } catch (error) {
        console.error('Failed to fetch lists:', error); // Add this line for debugging
        res.status(500).json({ error: 'Failed to fetch lists' })
      }
    } else if (req.method === 'POST') {
      const { name } = req.body
      try {
        const newList = await prisma.shoppingList.create({
          data: {
            name,
            progress: 0,
            total: 0,
            isComplete: false,
            userId: session.user.id,
          },
        })
        res.status(201).json(newList)
      } catch (error) {
        console.error('Failed to create list:', error); // Add this line for debugging
        res.status(500).json({ error: 'Failed to create list' })
      }
    } else {
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  }
