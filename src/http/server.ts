import cookie from '@fastify/cookie'
import websocket from '@fastify/websocket'
import fastify from 'fastify'
import { createPoll } from './routes/create-poll'
import { getPoll } from './routes/get-poll'
import { voteOnPoll } from './routes/vote-on-poll'
import { pollResults } from './websockets/poll-results'

const app = fastify()

app.register(cookie, {
  secret: process.env.COOKIE_SECRET,
  hook: 'onRequest',
  parseOptions: {},
})

app.register(websocket)

app.register(createPoll)
app.register(getPoll)
app.register(voteOnPoll)

app.register(pollResults)

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP Server is running on port 3333')
})
