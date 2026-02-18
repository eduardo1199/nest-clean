import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { StudentRepository } from '../repositories/student-repository'
import { HasherComparer } from '../crytography/hasher-comparer'
import { Encrypter } from '../crytography/encrypter'
import { WrongCredentialsError } from './errors/wrong-credentials-error'

interface AuthenticateStudentUseCaseRequest {
  email: string
  password: string
}

type AuthenticateStudentUseCaseResponse = Either<
  WrongCredentialsError,
  {
    accessToken: string
  }
>
@Injectable()
export class AuthenticateUseCase {
  constructor(
    private studentsRepository: StudentRepository,
    private hasComparer: HasherComparer,
    private encrypter: Encrypter,
  ) {}

  async execute({
    password,
    email,
  }: AuthenticateStudentUseCaseRequest): Promise<AuthenticateStudentUseCaseResponse> {
    const student = await this.studentsRepository.findByEmail(email)

    if (!student) {
      return left(new WrongCredentialsError())
    }

    const isPasswordValid = await this.hasComparer.compare(
      password,
      student.password,
    )

    if (!isPasswordValid) {
      return left(new WrongCredentialsError())
    }

    const accessToken = await this.encrypter.encrypt({ slug: student.id })

    return right({
      accessToken,
    })
  }
}
