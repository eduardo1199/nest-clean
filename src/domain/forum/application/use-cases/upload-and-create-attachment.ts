import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type'
import { Attachment } from '../../enterprise/entities/attachment'
import { AttachmentRepository } from '../repositories/attachment-repository'
import { Uploader } from '../storage/uploader'

interface UploadAndCreateAttachmentUseCaseRequest {
  fileName: string
  fileType: string
  body: Buffer
}

type UploadAndCreateAttachmentUseCaseResponse = Either<
  InvalidAttachmentTypeError,
  {
    attachment: Attachment
  }
>
@Injectable()
export class UploadAndCreateAttachmentUseCase {
  constructor(
    private readonly attachmentRepository: AttachmentRepository,
    private readonly uploader: Uploader,
  ) {}

  async execute({
    fileName,
    fileType,
    body,
  }: UploadAndCreateAttachmentUseCaseRequest): Promise<UploadAndCreateAttachmentUseCaseResponse> {
    if (!/^image\/(jpeg|png)$|^application\/pdf$/.test(fileType)) {
      return left(new InvalidAttachmentTypeError(fileName))
    }

    const { url } = await this.uploader.upload({
      fileName,
      fileType,
      body,
    })

    const attachment = Attachment.create({
      title: fileName,
      url,
    })

    await this.attachmentRepository.create(attachment)

    return right({
      attachment,
    })
  }
}
