class QResponse {
    constructor(data) {
        this._data = data;
    }

    attachment(filename) {
        this._attachment = true;
        this._filename = filename;
        return this;
    }

    apply(res) {
        if (this._attachment) res.attachment(this._filename);
        return res.status(200).send(this._data);
    }
}
exports.QResponse = QResponse;

// Define constant responses:

