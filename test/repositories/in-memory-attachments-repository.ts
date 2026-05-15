import { DomainEvents } from '@/core/events/domain-events'
import { AttachmentRepository } from '@/domain/forum/application/repositories/attachment-repository'
import { Attachment } from '@/domain/forum/enterprise/entities/attachment'

export class InMemoryAttachmentRepository implements AttachmentRepository {
  public items: Attachment[] = []

  async create(student: Attachment): Promise<void> {
    this.items.push(student)

    DomainEvents.dispatchEventsForAggregate(student.id)
  }
}
