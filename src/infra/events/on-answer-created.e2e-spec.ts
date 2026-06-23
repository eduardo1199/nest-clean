import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { StudentFactory } from 'test/factories/make-student'
import { DatabaseModule } from '@/infra/database/database.module'
import { QuestionFactory } from 'test/factories/make-question'
import { waitFor } from 'test/utils/wait-for'
import { DomainEvents } from '@/core/events/domain-events'

describe('On Answer created E2E', () => {
  let app: INestApplication
  let prisma: PrismaService
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)
    questionFactory = moduleRef.get(QuestionFactory)
    studentFactory = moduleRef.get(StudentFactory)

    DomainEvents.shouldRun = true

    await app.init()
  })

  test('should send a notification when an answer is created', async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    await request(app.getHttpServer())
      .post(`/questions/${question.id.toString()}/answers`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'New Answer',
        attachments: [],
      })

    await waitFor(async () => {
      const notification = await prisma.notification.findFirst({
        where: {
          recipientId: user.id.toString(),
        },
      })

      expect(notification).toBeTruthy()
    })
  })
})
