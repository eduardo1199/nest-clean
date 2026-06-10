import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Notification } from '@/domain/notification/enterprise/entities/notification'
import { Prisma } from 'generated/prisma/browser'
import { Notification as PrismaNotification } from 'generated/prisma/client'

export class PrismaNotificationMapper {
  static toDomain(raw: PrismaNotification): Notification {
    return Notification.create(
      {
        title: raw.title,
        content: raw.content,
        recipientId: new UniqueEntityID(raw.recipientId),
        createdAt: raw.createdAt,
        readAt: raw.readAt ? raw.readAt : undefined,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(
    notification: Notification,
  ): Prisma.NotificationUncheckedCreateInput {
    return {
      content: notification.content,
      title: notification.title,
      id: notification.id.toString(),
      createdAt: notification.createdAt,
      recipientId: notification.recipientId.toValue(),
      readAt: notification.readAt,
    }
  }
}
