import { Global, Module, Provider } from "@nestjs/common";
import { SseService } from "./services/sse.service";

const providers: Provider[] = [
  SseService
];

@Global()
@Module({
  providers,
  imports: [],
  exports: [...providers],
})
export class SharedModule {}