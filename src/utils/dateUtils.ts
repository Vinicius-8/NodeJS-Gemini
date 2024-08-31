// função valida a data
export function isValidISODateTime(dateString: string): boolean {
    // Expressão regular para verificar o formato ISO 8601 com milissegundos
    const isoDatePattern: RegExp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d{3})?(Z|([+-]\d{2}:\d{2}))$/;

    // Verificar se a string corresponde ao padrão ISO 8601
    if (isoDatePattern.test(dateString)) {
        const date: Date = new Date(dateString);

        // Verificar se a data é válida
        return !isNaN(date.getTime());
    }

    return false;
}
