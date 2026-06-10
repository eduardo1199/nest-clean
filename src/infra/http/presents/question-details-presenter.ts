import { QuestionDetails } from '@/domain/forum/enterprise/entities/value-objects/question-details'

export class QuestionDetailsPresenter {
  static toHTTP(questionDetails: QuestionDetails) {
    return {
      questionId: questionDetails.questionId.toString(),
      title: questionDetails.title,
      slug: questionDetails.slug.value,
      bestAnswerId: questionDetails.bestAnswerId
        ? questionDetails.bestAnswerId.toString()
        : null,
      content: questionDetails.content,
      createdAt: questionDetails.createdAt,
      updatedAt: questionDetails.updatedAt,
      author: questionDetails.author,
      authorId: questionDetails.authorId.toString(),
      attachments: questionDetails.attachments.map((attachment) => {
        return {
          id: attachment.id.toString(),
          fileName: attachment.title,
          url: attachment.link,
        }
      }),
    }
  }
}
