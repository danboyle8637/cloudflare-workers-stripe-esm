import { Router } from 'itty-router'
import { Stripe } from 'stripe'

import isOdd from 'is-odd'

// In order for the workers runtime to find the class that implements
// our Durable Object namespace, we must export it from the root module.
export { CounterTs } from './counter'

interface Env {
  COUNTER: DurableObjectNamespace
  STRIPE_TEST_PUB_KEY: string
  STRIPE_TEST_SECRET_KEY: string
}

const router = Router()

router.get('/counter/*', handleRequest)

router.get('/stripe', payment)

router.all('*', errorHandler)

export default {
  fetch: router.handle,
}

async function handleRequest(request: Request, env: Env) {
  let id = env.COUNTER.idFromName('A')
  let obj = env.COUNTER.get(id)
  let resp = await obj.fetch(request.url)
  let count = Number(await resp.text())
  let wasOdd = isOdd(count) ? 'is odd' : 'is even'

  return new Response(`${count} ${wasOdd}`)
}

async function errorHandler(): Promise<Response> {
  const response = new Response('Bad Request', { status: 400 })
  return response
}

async function payment(request: Request, env: Env): Promise<Response> {
  const stripe = new Stripe(env.STRIPE_TEST_SECRET_KEY, {
    apiVersion: '2020-08-27',
    httpClient: Stripe.createFetchHttpClient(),
  })

  return new Response('Getting Stripe to work with ESM Workers')
}
