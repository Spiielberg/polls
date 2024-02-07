import { FastifyInstance } from 'fastify'
import z from 'zod'
import { prisma } from '../../lib/prisma'
import { redis } from '../../lib/redis'

export const getPoll = async (app: FastifyInstance) => {
  app.get('/polls/:pollId', async (request, response) => {
    const getPollParams = z.object({
      pollId: z.string().uuid(),
    })

    const { pollId } = getPollParams.parse(request.params)

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    if (!poll) {
      return response.status(404).send({ message: 'Poll not found.' })
    }

    const result = await redis.zrange(pollId, 0, -1, 'WITHSCORES')

    const votes = result.reduce(
      (obj, value, index) => {
        if (index % 2 === 0) {
          const score = result[index + 1]

          Object.assign(obj, { [value]: Number(score) })
        }

        return obj
      },
      {} as Record<string, number>,
    )

    return response.send({
      poll: {
        id: poll.id,
        title: poll.title,
        createdAt: poll.createdAt,
        updatedAt: poll.updatedAt,
        options: poll.options.map((option) => {
          return {
            id: option.id,
            title: option.title,
            score: votes[option.id] || 0,
          }
        }),
      },
    })
  })
}
