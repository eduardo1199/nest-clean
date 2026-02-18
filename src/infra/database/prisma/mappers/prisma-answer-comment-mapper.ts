import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { AnswerComment } from '@/domain/forum/enterprise/entities/answer-comment'
import { Prisma } from 'generated/prisma/browser'
import { Comment as PrismaComment } from 'generated/prisma/client'

export class PrismaAnswerCommentMapper {
  static toDomain(raw: PrismaComment): AnswerComment {
    if (!raw.answerId) {
      throw new Error('Invalid comment type.')
    }

    return AnswerComment.create(
      {
        content: raw.content,
        authorId: new UniqueEntityID(raw.authorId),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        answerId: new UniqueEntityID(raw.answerId),
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(
    answerComment: AnswerComment,
  ): Prisma.CommentUncheckedCreateInput {
    return {
      authorId: answerComment.authorId.toValue(),
      content: answerComment.content,
      id: answerComment.id.toString(),
      createdAt: answerComment.createdAt,
      updatedAt: answerComment.updatedAt,
      answerId: answerComment.answerId.toValue(),
    }
  }
}
