// Custom Discord Error -> message: string, code: number, stack: 

export class CustomDiscordError extends Error {
    constructor(message: string, code: number) {
        super(message);
        this.name = "CustomDiscordError";
        this.code = code;
    }

    code: number;

    toJSON() {
        return {
            message: this.message,
            code: this.code,
        };
    }

    toString() {
        return `CustomDiscordError: ${this.message}`;
    }

}