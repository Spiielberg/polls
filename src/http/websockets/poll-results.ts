import { FastifyInstance } from 'fastify'
import z from 'zod'
import { voting } from '../../utils/voting-pub-sub'

export const pollResults = async (app: FastifyInstance) => {
  app.get(
    '/polls/:pollId/results',
    { websocket: true },
    async (connection, request) => {
      const pollResultsParams = z.object({
        pollId: z.string().uuid(),
      })

      const { pollId } = pollResultsParams.parse(request.params)

      voting.subscribe(pollId, (message) => {
        connection.socket.send(JSON.stringify(message))
      })
    },
  )
}
