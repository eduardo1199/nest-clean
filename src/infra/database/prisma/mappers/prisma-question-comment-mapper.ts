import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { QuestionComment } from '@/domain/forum/enterprise/entities/question-comment'
import { Prisma } from 'generated/prisma/browser'
import { Comment as PrismaComment } from 'generated/prisma/client'

export class PrismaQuestionCommentMapper {
  static toDomain(raw: PrismaComment): QuestionComment {
    if (!raw.questionId) {
      throw new Error('Invalid comment type.')
    }

    return QuestionComment.create(
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

  static toPrisma(
    questionComment: QuestionComment,
  ): Prisma.CommentUncheckedCreateInput {
    return {
      authorId: questionComment.authorId.toValue(),
      content: questionComment.content,
      id: questionComment.id.toString(),
      createdAt: questionComment.createdAt,
      updatedAt: questionComment.updatedAt,
      answerId: questionComment.questionId.toValue(),
    }
  }
}
