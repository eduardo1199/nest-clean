import { DomainEvents } from '@/core/events/domain-events'
import { envSchema } from '@/infra/env/env'
import 'dotenv/config'
import { PrismaClient } from 'generated/prisma/client'
import Redis from 'ioredis'
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'

const env = envSchema.parse(process.env)

const prisma = new PrismaClient()
const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  db: env.REDIS_DB,
})

function generateUniqueDatabaseURL(schemaId: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Please provider a DATABASE_URL environment variable.')
  }

  const url = new URL(env.DATABASE_URL)

  url.searchParams.set('schema', schemaId)

  return url.toString()
}

const schemaId = randomUUID()

beforeAll(async () => {
  const databaseURL = generateUniqueDatabaseURL(schemaId)

  process.env.DATABASE_URL = databaseURL

  DomainEvents.shouldRun = false

  await redis.flushdb()

  await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaId}"`)

  const output = execSync('npx prisma migrate deploy')
  console.log(output.toString())
})

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await prisma.$disconnect()
})
