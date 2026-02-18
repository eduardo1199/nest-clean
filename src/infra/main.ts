import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { EnvService } from '@/infra/env/env.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  /**
   * ConfigService é class responsável por acessar as configurações do serviço, nesse caso:
   * Eu consigo capturar as informações de variáveis ambiente do sistema, passando o tipo das    variáveis "ENV" e como segundo parâmetro "true", que indica que houve tratamento das variáveis
   */
  const configService = app.get(EnvService)
  const port = configService.get('PORT')

  await app.listen(port)
}

bootstrap()
