import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { StudentFactory } from 'test/factories/make-student'
import { QuestionFactory } from 'test/factories/make-question'
import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug'
import { AttachmentFactory } from 'test/factories/make-attachment'
import { QuestionAttachmentFactory } from 'test/factories/make-question-attachments'
import { CacheRepository } from '@/infra/cache/cache-repository'
import { CacheModule } from '@/infra/cache/cache.module'
import { QuestionsRepository } from '@/domain/forum/application/repositories/questions-repository'

describe('Prisma Questions Repository E2E', () => {
  let app: INestApplication
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let attachmentFactory: AttachmentFactory
  let questionAttachmentFactory: QuestionAttachmentFactory
  let cacheRepository: CacheRepository
  let questionsRepository: QuestionsRepository

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule, CacheModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AttachmentFactory,
        QuestionAttachmentFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    studentFactory = moduleRef.get(StudentFactory)
    attachmentFactory = moduleRef.get(AttachmentFactory)
    questionAttachmentFactory = moduleRef.get(QuestionAttachmentFactory)
    cacheRepository = moduleRef.get(CacheRepository)
    questionFactory = moduleRef.get(QuestionFactory)
    questionsRepository = moduleRef.get(QuestionsRepository)
    await app.init()
  })

  it('should cache questions details', async () => {
    const user = await studentFactory.makePrismaStudent({
      name: 'John Doe',
    })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
      slug: Slug.create('question-01'),
    })

    const attachment = await attachmentFactory.makePrismaAttachment({
      title: 'Some Attachment',
    })

    await questionAttachmentFactory.makePrismaQuestionAttachment({
      questionId: question.id,
      attachmentId: attachment.id,
    })

    const slug = question.slug.value

    const questionDetails =
      await questionsRepository.findBySlugWithDetails(slug)

    const cached = await cacheRepository.get(`questions:${slug}:details`)

    if (!cached) {
      throw new Error('Cached not found')
    }

    expect(JSON.parse(cached)).toEqual(
      expect.objectContaining({ id: questionDetails?.questionId.toString() }),
    )
  })

  it('should be return cached questions details', async () => {
    const user = await studentFactory.makePrismaStudent({
      name: 'John Doe',
    })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
      slug: Slug.create('question-02'),
    })

    const attachment = await attachmentFactory.makePrismaAttachment({
      title: 'Some Attachment',
    })

    await questionAttachmentFactory.makePrismaQuestionAttachment({
      questionId: question.id,
      attachmentId: attachment.id,
    })

    const slug = question.slug.value

    let cached = await cacheRepository.get(`questions:${slug}:details`)

    expect(cached).toBeNull()

    const questionDetails =
      await questionsRepository.findBySlugWithDetails(slug)

    cached = await cacheRepository.get(`questions:${slug}:details`)

    expect(cached).not.toBeNull()

    if (!cached) {
      throw new Error('Cached not found')
    }

    expect(JSON.parse(cached)).toEqual(
      expect.objectContaining({ id: questionDetails?.questionId.toString() }),
    )
  })

  it('should be reset question details cache when saving question', async () => {
    const user = await studentFactory.makePrismaStudent({
      name: 'John Doe',
    })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
      slug: Slug.create('question-03'),
    })

    const attachment = await attachmentFactory.makePrismaAttachment({
      title: 'Some Attachment',
    })

    await questionAttachmentFactory.makePrismaQuestionAttachment({
      questionId: question.id,
      attachmentId: attachment.id,
    })

    const slug = question.slug.value

    await cacheRepository.set(
      `questions:${slug}:details`,
      JSON.stringify({ empty: true }),
    )

    await questionsRepository.save(question)

    const cached = await cacheRepository.get(`questions:${slug}:details`)

    expect(cached).toBeNull()
  })
})
