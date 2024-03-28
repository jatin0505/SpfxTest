import { SPBatch } from "@pnp/sp";

export const fixSPBatchParser = () => {
    SPBatch.ParseResponse = (body: string): Promise<Response[]> => {
        return new Promise((resolve, reject) => {
            const responses: Response[] = [];
            const header = "--batchresponse_";
            // Ex. "HTTP/1.1 500 Internal Server Error"
            const statusRegExp = new RegExp("^HTTP/[0-9.]+ +([0-9]+) +(.*)", "i");
            const lines = body.split("\n");
            let state = "batch";
            let status: number;
            let statusText: string;
            let responseBody = [];

            for (let i = 0; i < lines.length; ++i) {
                const line = lines[i];

                switch (state) {
                    case "batch":
                        if (line.substr(0, header.length) === header) {
                            state = "batchHeaders";
                        } else {
                            if (line.trim() !== "") {
                                throw Error(`Invalid response, line ${i}`);
                            }
                        }

                        break;

                    case "batchHeaders":
                        if (line.trim() === "") {
                            state = "status";
                        }
                        break;

                    case "status":
                        const parts = statusRegExp.exec(line);
                        if (parts.length !== 3) {
                            throw Error(`Invalid status, line ${i}`);
                        }
                        status = parseInt(parts[1], 10);
                        statusText = parts[2];
                        state = "statusHeaders";
                        break;

                    case "statusHeaders":
                        if (line.trim() === "") {
                            state = "body";
                        }
                        break;

                    case "body":
                        if (line.substr(0, header.length) === header) {
                            responses.push((status === 204) ? new Response() : new Response(responseBody.join('\n'), { status: status, statusText: statusText }));
                            responseBody = [];
                            state = "batchHeaders";
                        } else {
                            responseBody.push(line);
                        }
                        break;
                }
            }

            if (state !== "status") {
                reject(Error("Unexpected end of input"));
            }

            resolve(responses);
        });
    };
};