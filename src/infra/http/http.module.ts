import { Module } from '@nestjs/common'
import { CreateAccountController } from '@/infra/http/controllers/create-account.controller'
import { AuthenticateController } from '@/infra/http/controllers/authenticate-controller'
import { CreateQuestionController } from '@/infra/http/controllers/create-question-controller'
import { FetchRecentQuestionsController } from '@/infra/http/controllers/fetch-recent-questions'
import { DatabaseModule } from '../database/database.module'
import { CreateQuestionUseCase } from '@/domain/forum/application/use-cases/create-question'

/**
 * Imports: São utilizados sempre para importar outros módulos (Optional list of imported modules that export the providers which are required in this module)
 * Controllers: São utilizados para realizar operações baseados em rotas HTTP (Optional list of controllers defined in this module which have to be instantiated)
 * Providers: São utilizados para prover algo aos controllers (Optional list of providers that will be instantiated by the Nest injector and that may be shared at least across this module.)
 */

@Module({
  imports: [DatabaseModule],
  controllers: [
    CreateAccountController,
    AuthenticateController,
    CreateQuestionController,
    FetchRecentQuestionsController,
  ],
  providers: [CreateQuestionUseCase],
})
export class HttpModule {}
