export class QueryParser {
    filtered = false;
    comparisonParsed = false;
    functionalKeysParsed = false;

    sort = {createdAt: -1};
    page = 0;
    fields = {__v: false};
    limit = 100;

    static functionalKeys = ['fields', 'sort', 'limit', 'page'];

    static functionalKeysParsers = {
        fields: (query) => {
            if (query.fields) {
                return query.fields.replace(/,/g, ' ').trim() + ' -__v';
            }
        },
        sort: (query) => {
            if (query.sort) {
                return query.sort.replace(/,/g, ' ')
            }
        },
        limit: (query) => {
            if (!isNaN(+query.limit)) {
                return +query.limit;
            }
        },
        page: (query) => {
            if (+query.page > 0) {
                return (+query.page || 1) - 1;
            }
        },
    }

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

        for (let queryKey in this.query) {
            if (QueryParser.functionalKeys.includes(queryKey)) {
                continue;
            }
            filteredQuery[queryKey] = this.query[queryKey];
        }
        this.query = filteredQuery;
        this.filtered = true;
    }

    parseFunctionalKeys (keys = QueryParser.functionalKeys) {
        for (let key of keys) {
            if (QueryParser.functionalKeysParsers[key]) {
                this[key] = QueryParser.functionalKeysParsers[key](this.genuineQuery) ?? this[key];
            }
        }

        this.functionalKeysParsed = true;
    }
}