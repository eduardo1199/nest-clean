import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Answer } from '@/domain/forum/enterprise/entities/answer'
import { Prisma } from 'generated/prisma/browser'
import { Answer as PrismaAnswer } from 'generated/prisma/client'

export class PrismaAnswerMapper {
  static toDomain(raw: PrismaAnswer): Answer {
    return Answer.create(
      {
        content: raw.content,
        authorId: new UniqueEntityID(raw.authorId),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        questionId: new UniqueEntityID(raw.questionId),
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(answer: Answer): Prisma.AnswerUncheckedCreateInput {
    return {
      authorId: answer.authorId.toValue(),
      content: answer.content,
      id: answer.id.toString(),
      createdAt: answer.createdAt,
      updatedAt: answer.updatedAt,
      questionId: answer.questionId.toValue(),
    }
  }
}
