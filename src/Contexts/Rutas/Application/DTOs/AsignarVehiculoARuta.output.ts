export class AsignarVehiculoARutaOutput {
    constructor(
        public readonly rutaId: string,
        public readonly vehiculoId: string,
        public readonly estadoRuta: string
    ) {}
}
