import { PackageDataDto } from "../../application/dtos/cargar-paquetes-masivamente.input";

export const IFileParserServiceToken = "IFileParserService";

export interface IFileParserService {
    parse(fileContent: string): Promise<PackageDataDto[]>;

    parseCsv(fileContent: string): Promise<PackageDataDto[]>;
    parseJson(fileContent: string): Promise<PackageDataDto[]>;
    parseXml(fileContent: string): Promise<PackageDataDto[]>;
}
