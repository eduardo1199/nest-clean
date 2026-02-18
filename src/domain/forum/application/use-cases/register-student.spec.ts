import { InMemoryStudentRepository } from 'test/repositories/in-memory-student-repository'
import { RegisterStudentUseCase } from './register-student'
import { FakeHasher } from 'test/cryptography/fake-hasher'

let sut: RegisterStudentUseCase
let inMemoryRegisterStudentRepository: InMemoryStudentRepository
let fakeHasher: FakeHasher

describe('Register Student', () => {
  beforeEach(() => {
    inMemoryRegisterStudentRepository = new InMemoryStudentRepository()
    fakeHasher = new FakeHasher()
    sut = new RegisterStudentUseCase(
      inMemoryRegisterStudentRepository,
      fakeHasher,
    )
  })

  it('should be able create new student', async () => {
    const result = await sut.execute({
      name: 'JohnDoe',
      email: 'johndoe@gmail.com',
      password: '123456',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      student: inMemoryRegisterStudentRepository.items[0],
    })
  })

  it('should hash student password upon registration', async () => {
    const result = await sut.execute({
      name: 'JohnDoe',
      email: 'johndoe@gmail.com',
      password: '123456',
    })

    const hashedPassword = await fakeHasher.hash('123456')

    expect(result.isRight()).toBe(true)
    expect(inMemoryRegisterStudentRepository.items[0].password).toEqual(
      hashedPassword,
    )
  })
})
