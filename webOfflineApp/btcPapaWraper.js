class PapaCSVWraper {
    constructor(chunkSz, PapaLib) {
        this.fileID = undefined;
        this.config = {
            delimiter: ",",	// auto-detect
            newline: "/n",	// auto-detect
            quoteChar: '"',
            escapeChar: '"',
            header: true,
            transformHeader: undefined,
            dynamicTyping: false,
            preview: 0,
            encoding: "",
            worker: false,
            comments: false,
            step: undefined,
            complete: undefined,
            error: undefined,
            download: true,
            skipEmptyLines: true,
            chunk: undefined,
            fastMode: undefined,
            beforeFirstChunk: undefined,
            withCredentials: undefined,
            transform: undefined
        };

        this.PapaLib = PapaLib;
        this.chunkSz = chunkSz;
        this.chunks = 0;
        this.dataChunk = []   
       
    }

    readData(fname, onRowCb,onComplete) {
        this.fileID = fname;
        this.config.step=onRowCb;
        this.config.complete=onComplete;
        this.PapaLib.parse(this.fileID, this.config);
    }
}