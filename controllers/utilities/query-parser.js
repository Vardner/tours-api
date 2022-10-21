export class QueryParser {
    filtered = false;
    comparisonParsed = false;
    functionalKeysParsed = false;

    sort = {createdAt: -1};
    page = 0;
    fields = {__v: false};
    limit = 100;

    constructor (queryString) {
        this.query = Object.assign({}, queryString);
        this.genuineQuery = queryString;
    }

    parseComparisonOperators () {
        this.query = JSON.parse(JSON.stringify(this.query).replace(/\b(gte|lt|gt|lte)\b/g, match => '$' + match));
        this.comparisonParsed = true;
    }

    filterFunctionalKeys () {
        const filteredQuery = {};
        const excludedFields = ['page', 'sort', 'limit', 'fields'];

        for (let queryKey in this.query) {
            if (excludedFields.includes(queryKey)) {
                continue;
            }
            filteredQuery[queryKey] = this.query[queryKey];
        }
        this.query = filteredQuery;
        this.filtered = true;
    }

    parseFunctionalKeys () {
        if (this.genuineQuery.fields) {
            this.fields = this.genuineQuery.fields.replace(/,/g, ' ').trim() + ' -__v';
        }

        if (this.genuineQuery.sort) {
            this.sort = this.genuineQuery.sort.replace(/,/g, ' ')
        }

        if (!isNaN(+this.genuineQuery.limit)) {
            this.limit = +this.genuineQuery.limit;
        }

        if (+this.genuineQuery.page > 0) {
            this.page = (+this.genuineQuery.page || 1) - 1;
        }

        this.functionalKeysParsed = true;
    }
}