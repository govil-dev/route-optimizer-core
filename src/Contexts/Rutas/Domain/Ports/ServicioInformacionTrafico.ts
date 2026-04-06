
import { CondicionTrafico } from "../ValueObjects/CondicionTrafico";
import { SegmentoRuta } from "../ValueObjects/SegmentoRuta";

export interface ServicioInformacionTrafico {
  obtenerCondicionTrafico(segmento: SegmentoRuta): Promise<CondicionTrafico>;
  obtenerCondicionesTraficoMultiples(segmentos: SegmentoRuta[]): Promise<Map<SegmentoRuta, CondicionTrafico>>;
}
