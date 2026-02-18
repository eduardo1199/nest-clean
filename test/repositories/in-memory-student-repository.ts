import { DomainEvents } from '@/core/events/domain-events'
import { StudentRepository } from '@/domain/forum/application/repositories/student-repository'
import { Student } from '@/domain/forum/enterprise/entities/student'

export class InMemoryStudentRepository implements StudentRepository {
  public items: Student[] = []

  async findByEmail(email: string): Promise<Student | null> {
    const studentByEmail = this.items.find((student) => student.email === email)

    if (!studentByEmail) return null

    return studentByEmail
  }

  async create(student: Student): Promise<void> {
    this.items.push(student)

    DomainEvents.dispatchEventsForAggregate(student.id)
  }
}
