import { CommentWithAuthor } from '../../../domain/forum/enterprise/entities/value-objects/comment-with-author'

export class CommentsWithAuthorPresenter {
  static toHTTP(commentWithAuthor: CommentWithAuthor) {
    return {
      commentId: commentWithAuthor.commentId.toString(),
      content: commentWithAuthor.content,
      createdAt: commentWithAuthor.createdAt,
      updatedAt: commentWithAuthor.updatedAt,
      author: {
        id: commentWithAuthor.author.id.toString(),
        name: commentWithAuthor.author.name,
      },
    }
  }
}
