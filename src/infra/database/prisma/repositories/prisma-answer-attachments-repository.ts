import { AnswerAttachmentsRepository } from '@/domain/forum/application/repositories/answer-attachments-repository'
import { AnswerAttachment } from '@/domain/forum/enterprise/entities/answer-attachment'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { PrismaAnswerAttachmentMapper } from '../mappers/prisma-answer-attachment-mapper'

@Injectable()
export class PrismaAnswerAttachmentRepository implements AnswerAttachmentsRepository {
  constructor(private prisma: PrismaService) {}
  async findManyByAnswerId(answerId: string): Promise<AnswerAttachment[]> {
    const AnswerAttachments = await this.prisma.attachment.findMany({
      where: {
        answerId,
      },
    })

    return AnswerAttachments.map((AnswerAttachment) =>
      PrismaAnswerAttachmentMapper.toDomain(AnswerAttachment),
    )
  }

  async deleteManyByAnswerId(answerId: string): Promise<void> {
    await this.prisma.attachment.deleteMany({
      where: {
        answerId,
      },
    })
  }
}
