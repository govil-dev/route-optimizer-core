import { Injectable } from "@nestjs/common";
import { IFileParserService } from "../../domain/ports/file-parser.service";
import { PackageDataDto } from "../../application/dtos/cargar-paquetes-masivamente.input";
import { FormatoArchivoInvalidoException } from "../../domain/exceptions/formato-archivo-invalido.exception";

@Injectable()
export class TxtFileParserService implements IFileParserService {

    private readonly EXPECTED_HEADERS = ["PackageID", "Address", "Lat", "Lng", "Weight_kg", "TimeWindow", "Priority"];

    async parse(fileContent: string): Promise<PackageDataDto[]> {
        const lines = fileContent.split(/\\r?\\n/).filter(line => line.trim() !== "");
        if (lines.length < 2) {
            throw new FormatoArchivoInvalidoException("El archivo debe contener al menos una cabecera y una línea de datos.");
        }

        const headerLine = lines[0];
        const delimiter = this.detectDelimiter(headerLine);
        const headers = headerLine.split(delimiter).map(h => h.trim());

        this.validateHeaders(headers);

        const dataLines = lines.slice(1);
        const parsedData: PackageDataDto[] = [];

        for (let i = 0; i < dataLines.length; i++) {
            const line = dataLines[i];
            const values = line.split(delimiter).map(v => v.trim());

            if (values.length !== this.EXPECTED_HEADERS.length) {
                throw new FormatoArchivoInvalidoException(`La línea ${i + 2} tiene un número incorrecto de campos. Se esperaban ${this.EXPECTED_HEADERS.length} pero se encontraron ${values.length}.`);
            }

            const rowData = this.mapValuesToDto(headers, values, i + 2);
            parsedData.push(rowData);
        }

        return parsedData;
    }

    private detectDelimiter(headerLine: string): string {
        if (headerLine.includes("|")) {
            return "|";
        }
        if (headerLine.includes(",")) {
            return ",";
        }
        throw new FormatoArchivoInvalidoException("No se pudo detectar el delimitador (se esperaba '|' o ',').");
    }

    private validateHeaders(headers: string[]): void {
        const headerSet = new Set(headers);
        for (const expectedHeader of this.EXPECTED_HEADERS) {
            if (!headerSet.has(expectedHeader)) {
                throw new FormatoArchivoInvalidoException(`Falta la cabecera requerida: ${expectedHeader}.`);
            }
        }
    }

    private mapValuesToDto(headers: string[], values: string[], lineNumber: number): PackageDataDto {
        const rowObject: { [key: string]: string } = {};
        headers.forEach((header, index) => {
            rowObject[header] = values[index];
        });

        const lat = parseFloat(rowObject["Lat"]);
        const lng = parseFloat(rowObject["Lng"]);
        const weightKg = parseFloat(rowObject["Weight_kg"]);

        if (isNaN(lat) || isNaN(lng) || isNaN(weightKg)) {
            throw new FormatoArchivoInvalidoException(`Error de tipo de dato en la línea ${lineNumber}: Lat, Lng y Weight_kg deben ser números.`);
        }

        // YYYY-MM-DD HH:MM-HH:MM
        const timeWindowRegex = /^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}-\\d{2}:\\d{2}$/;
        if (!timeWindowRegex.test(rowObject["TimeWindow"])) {
            throw new FormatoArchivoInvalidoException(`Formato de TimeWindow inválido en la línea ${lineNumber}. Se esperaba "YYYY-MM-DD HH:MM-HH:MM".`);
        }

        return {
            packageId: rowObject["PackageID"],
            address: rowObject["Address"],
            lat,
            lng,
            weightKg,
            timeWindow: rowObject["TimeWindow"],
            priority: rowObject["Priority"],
        };
    }
}
