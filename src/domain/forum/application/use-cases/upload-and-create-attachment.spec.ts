import { InMemoryAttachmentRepository } from 'test/repositories/in-memory-attachments-repository'
import { UploadAndCreateAttachmentUseCase } from './upload-and-create-attachment'
import { FakeUploader } from 'test/storage/fake-uploder'
import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type'

let sut: UploadAndCreateAttachmentUseCase
let inMemoryAttachmentsRepository: InMemoryAttachmentRepository
let fakeUploader: FakeUploader

describe('Upload and Create Attachment', () => {
  beforeEach(() => {
    inMemoryAttachmentsRepository = new InMemoryAttachmentRepository()
    fakeUploader = new FakeUploader()
    sut = new UploadAndCreateAttachmentUseCase(
      inMemoryAttachmentsRepository,
      fakeUploader,
    )
  })

  it('should be able upload and create attachment', async () => {
    const result = await sut.execute({
      fileName: 'file-name',
      fileType: 'image/png',
      body: Buffer.from(''),
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      attachment: inMemoryAttachmentsRepository.items[0],
    })
    expect(fakeUploader.uploads).toEqual([
      {
        fileName: 'file-name',
        url: fakeUploader.uploads[0].url,
      },
    ])
  })

  it('should not be able to upload an attachment with invalid file type', async () => {
    const result = await sut.execute({
      fileName: 'file-name',
      fileType: 'invalid/type',
      body: Buffer.from(''),
    })

    expect(result.isLeft()).toBe(true)
    expect(fakeUploader.uploads).toEqual([])
    expect(result.value).toBeInstanceOf(InvalidAttachmentTypeError)
  })
})
