import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { CommentWithAuthor } from '@/domain/forum/enterprise/entities/value-objects/comment-with-author'
import { Comment, User } from 'generated/prisma/client'

type PrismaCommentWithAuthor = Comment & {
  author: User
}

export class PrismaCommentWithAuthorMapper {
  static toDomain(raw: PrismaCommentWithAuthor): CommentWithAuthor {
    return CommentWithAuthor.create({
      commentId: new UniqueEntityID(raw.id),
      content: raw.content,
      author: {
        id: new UniqueEntityID(raw.authorId),
        name: raw.author.name,
      },
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    })
  }
}
