import { FakeEncrypter } from './../../../../../test/cryptography/fake-encrypter'
import { InMemoryStudentRepository } from 'test/repositories/in-memory-student-repository'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { AuthenticateUseCase } from './authenticate-student'
import { makeStudent } from 'test/factories/make-student'

let sut: AuthenticateUseCase
let inMemoryRegisterStudentRepository: InMemoryStudentRepository
let fakeHasher: FakeHasher
let fakeEncrypter: FakeEncrypter

describe('Authenticate Student', () => {
  beforeEach(() => {
    inMemoryRegisterStudentRepository = new InMemoryStudentRepository()
    fakeHasher = new FakeHasher()
    fakeEncrypter = new FakeEncrypter()
    sut = new AuthenticateUseCase(
      inMemoryRegisterStudentRepository,
      fakeHasher,
      fakeEncrypter,
    )
  })

  it('should be able to authenticate a student', async () => {
    const student = makeStudent({
      email: 'johndoe@gmail.com',
      password: await fakeHasher.hash('123456'),
    })

    inMemoryRegisterStudentRepository.create(student)

    const result = await sut.execute({
      email: 'johndoe@gmail.com',
      password: '123456',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      accessToken: expect.any(String),
    })
  })
})
