import { Module } from "@nestjs/common";
import { CargaMasivaModule } from "./modules/carga-masiva/carga-masiva.module";
import { EntregaPaquetesModule } from "./modules/entrega-paquetes/entrega-paquetes.module";

@Module({
  imports: [CargaMasivaModule, EntregaPaquetesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
