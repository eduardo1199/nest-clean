import { HasherComparer } from '@/domain/forum/application/crytography/hasher-comparer'
import { HasherGenerator } from '@/domain/forum/application/crytography/hasher-generator'

export class FakeHasher implements HasherGenerator, HasherComparer {
  async compare(plain: string, hash: string): Promise<boolean> {
    return plain.concat('-hashed') === hash
  }

  async hash(plain: string): Promise<string> {
    return plain.concat('-hashed')
  }
}
